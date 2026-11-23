@echo off
wsl -d Ubuntu -- bash -c "nohup python3 '/mnt/d/A - Hoc Tap/Thuong Mai Dien Tu/san-quan-ao/scripts/relay.py' > /tmp/relay.log 2>&1 &"
timeout /t 3 /nobreak > nul
echo Relay started
