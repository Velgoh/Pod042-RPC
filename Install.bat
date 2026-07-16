@echo off
echo ===================================================
echo Installing Pod 042 YouTube Music RPC Auto-Start...
echo ===================================================

:: Get current directory
set "DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "PROGRAMS_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
set "VBS_FILE=%STARTUP_FOLDER%\yt-music-rpc.vbs"

:: Create the Auto-Start VBS script
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS_FILE%"
echo WshShell.CurrentDirectory = "%DIR%yt-music-rpc" >> "%VBS_FILE%"
echo WshShell.Run """%DIR%node\node.exe"" ""%DIR%yt-music-rpc\index.js""", 0, False >> "%VBS_FILE%"

:: Create the Start Menu Shortcut via a temporary VBS script
set "TMP_VBS=%TEMP%\create_shortcut.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "%TMP_VBS%"
echo Set oMyShortcut = WshShell.CreateShortcut("%PROGRAMS_FOLDER%\Pod 042.lnk") >> "%TMP_VBS%"
echo oMyShortcut.TargetPath = "wscript.exe" >> "%TMP_VBS%"
echo oMyShortcut.Arguments = """%VBS_FILE%""" >> "%TMP_VBS%"
echo oMyShortcut.IconLocation = "%DIR%yt-music-rpc\YoRHa3.ico" >> "%TMP_VBS%"
echo oMyShortcut.WorkingDirectory = "%DIR%yt-music-rpc" >> "%TMP_VBS%"
echo oMyShortcut.Save >> "%TMP_VBS%"

:: Create the Stop Menu Shortcut
echo Set oMyStopShortcut = WshShell.CreateShortcut("%PROGRAMS_FOLDER%\Stop Pod 042.lnk") >> "%TMP_VBS%"
echo oMyStopShortcut.TargetPath = "%DIR%yt-music-rpc\Stop-Pod.bat" >> "%TMP_VBS%"
echo oMyStopShortcut.IconLocation = "%DIR%yt-music-rpc\YoRHa3.ico" >> "%TMP_VBS%"
echo oMyStopShortcut.WorkingDirectory = "%DIR%yt-music-rpc" >> "%TMP_VBS%"
echo oMyStopShortcut.Save >> "%TMP_VBS%"

cscript //B "%TMP_VBS%"
del "%TMP_VBS%"

echo.
echo Success! Pod 042 has been added to your Startup folder AND your Start Menu!
echo You can now search for "Pod 042" and "Stop Pod 042" in your Start Menu!
echo.
echo Starting it for you right now...
cscript //B "%VBS_FILE%"

echo.
pause
