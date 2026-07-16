@echo off
echo ===================================================
echo Installing Pod 042 YouTube Music RPC Auto-Start...
echo ===================================================

:: Get current directory
set "DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "PROGRAMS_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs"

:: Clean up old legacy scripts if they exist
del "%STARTUP_FOLDER%\yt-music-rpc.vbs" >nul 2>&1

:: Create shortcuts via a temporary VBS script
set "TMP_VBS=%TEMP%\create_shortcut.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "%TMP_VBS%"

:: Startup Shortcut
echo Set oMyShortcut = WshShell.CreateShortcut("%STARTUP_FOLDER%\Pod 042.lnk") >> "%TMP_VBS%"
echo oMyShortcut.TargetPath = "%DIR%Pod042.exe" >> "%TMP_VBS%"
echo oMyShortcut.IconLocation = "%DIR%yt-music-rpc\YoRHa3.ico" >> "%TMP_VBS%"
echo oMyShortcut.WorkingDirectory = "%DIR%" >> "%TMP_VBS%"
echo oMyShortcut.Save >> "%TMP_VBS%"

:: Start Menu Shortcut
echo Set oMyStartShortcut = WshShell.CreateShortcut("%PROGRAMS_FOLDER%\Pod 042.lnk") >> "%TMP_VBS%"
echo oMyStartShortcut.TargetPath = "%DIR%Pod042.exe" >> "%TMP_VBS%"
echo oMyStartShortcut.IconLocation = "%DIR%yt-music-rpc\YoRHa3.ico" >> "%TMP_VBS%"
echo oMyStartShortcut.WorkingDirectory = "%DIR%" >> "%TMP_VBS%"
echo oMyStartShortcut.Save >> "%TMP_VBS%"

:: Stop Menu Shortcut
echo Set oMyStopShortcut = WshShell.CreateShortcut("%PROGRAMS_FOLDER%\Stop Pod 042.lnk") >> "%TMP_VBS%"
echo oMyStopShortcut.TargetPath = "taskkill.exe" >> "%TMP_VBS%"
echo oMyStopShortcut.Arguments = "/F /IM Pod042.exe" >> "%TMP_VBS%"
echo oMyStopShortcut.IconLocation = "%DIR%yt-music-rpc\YoRHa3.ico" >> "%TMP_VBS%"
echo oMyStopShortcut.Save >> "%TMP_VBS%"

cscript //B "%TMP_VBS%"
del "%TMP_VBS%"

echo.
echo Success! Pod 042 has been added to your Startup folder AND your Start Menu!
echo You can now search for "Pod 042" and "Stop Pod 042" in your Start Menu!
echo.
echo Starting it for you right now...
start "" "%DIR%Pod042.exe"

echo.
pause
