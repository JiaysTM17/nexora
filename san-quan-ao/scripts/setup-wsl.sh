#!/usr/bin/env bash
set -euo pipefail
# Isolated project cluster. Never reconfigure an existing default PostgreSQL cluster.
PG_VERSION="$(ls /usr/lib/postgresql | sort -V | tail -1)"
if ! pg_lsclusters --no-header | awk '{print $2}' | grep -qx mac; then
  pg_createcluster "$PG_VERSION" mac --port 54329 --start
fi
pg_ctlcluster "$PG_VERSION" mac start || test "$(pg_lsclusters --no-header | awk '$2 == "mac" {print $4}')" = online
runuser -u postgres -- psql -p 54329 -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'CREATE ROLE mac LOGIN PASSWORD ''mac_local_only''' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mac')\gexec
SELECT 'CREATE DATABASE mac OWNER mac' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mac')\gexec
SELECT 'CREATE DATABASE mac_test OWNER mac' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mac_test')\gexec
SQL
redis-cli -p 63799 ping >/dev/null 2>&1 || redis-server --port 63799 --bind 127.0.0.1 --daemonize yes --save '' --appendonly no
pg_isready -p 54329
redis-cli -p 63799 ping
