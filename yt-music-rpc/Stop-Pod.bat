@echo off
echo Stopping Pod 042...
wmic process where "name='node.exe' and commandline like '%%yt-music-rpc%%'" call terminate >nul 2>&1
echo Pod 042 has been successfully stopped!
timeout /t 3 >nul
