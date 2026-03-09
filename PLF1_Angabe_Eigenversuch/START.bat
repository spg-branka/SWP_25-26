@echo off
powershell -WindowStyle Hidden -Command "Start-Process -FilePath cmd.exe -ArgumentList '/c', \"%~dp0.autocommit.bat\", 200 -WindowStyle Hidden"
echo Autocommit started.
code .
