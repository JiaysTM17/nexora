#!/usr/bin/env bash
set -e
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/18/mac/postgresql.conf
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/18/mac/pg_hba.conf || true
service postgresql restart
ss -tlpn | grep 54329
