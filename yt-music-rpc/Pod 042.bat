@echo off
echo Starting Pod 042 Discord RPC...
title Pod 042
cd /d "%~dp0"
..\node\node.exe index.js
pause
