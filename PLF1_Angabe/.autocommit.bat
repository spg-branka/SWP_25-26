@echo off
setlocal enabledelayedexpansion

REM Work in the folder where this .bat resides (repo root)
cd /d "%~dp0"

REM Generate a 3-character random key using only uppercase letters
set "CHARS=ABCDEFGHIJKLMNOPQRSTUVWXYZ"
set "APP_KEY="
for /l %%i in (1,1,3) do (
  set /a "INDEX=!RANDOM! %% 26"
  for %%j in (!INDEX!) do set "APP_KEY=!APP_KEY!!CHARS:~%%j,1!"
)

set "INTERVAL_SECONDS=300"
if not "%~1"=="" set "INTERVAL_SECONDS=%~1"
call :LogMessage "Got paramter: !INTERVAL_SECONDS!"
echo !INTERVAL_SECONDS!| findstr /r "^[0-9][0-9]*$" >nul 2>&1 || (
    call :LogMessage "Invalid interval !INTERVAL_SECONDS!, falling back to 300."
    set "INTERVAL_SECONDS=300"
)
set /a MODIFIED_INTERVAL=!INTERVAL_SECONDS!-1
set "LOG_PATH=.\.autocommit.log"
set "ACCOUNT_NAME=!USERNAME!"
set "USER_NAME=!ACCOUNT_NAME!"
set "USER_EMAIL=!ACCOUNT_NAME!@plf.spengergasse.at"

call :LogMessage "getting PID:"
call :GetPid
call :LogMessage "Program started (interval: !INTERVAL_SECONDS! seconds) (user: !USER_NAME!, email: !USER_EMAIL!)"

git config --global --get user.name >nul 2>&1
if errorlevel 1 (
  call :LogMessage "setting git user.name"
  git config --global user.name "!USER_NAME!" >> "!LOG_PATH!" 2>&1
)

git config --global --get user.email >nul 2>&1
if errorlevel 1 (
  call :LogMessage "setting git user.email"
  git config --global user.email "!USER_EMAIL!" >> "!LOG_PATH!" 2>&1
)

if not exist ".git\" (
  call :LogMessage "No .git found - initializing git repository"
  git init >> "!LOG_PATH!" 2>&1
) else (
  call :LogMessage ".git exists, skipping git init"
)

:LOOP
REM if there was a git add or a commit within the last 290 seconds, log this and jump to the timeout command
powershell -NoProfile -Command "if ((Test-Path '.git\index') -and ((Get-Date) - (Get-Item '.git\index').LastWriteTime).TotalSeconds -lt !MODIFIED_INTERVAL!) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  rem changes in repo exist so I can also modify the log
  call :LogMessage "Git index younger than !MODIFIED_INTERVAL! seconds, going to sleep."
  goto :SLEEP
)

REM I KNOW I WILL COMMIT
rem call :LogMessage "Now adding and committing (but not logging git output)..."
git add . >nul 2>&1

REM FIND OUT EMPTY OR AUTOCOMMIT
git diff --cached --quiet >nul 2>&1
if errorlevel 1 (
  rem call :LogMessage "Git commit autocommit"
  git commit -m "auto: !APP_KEY!" >nul 2>&1
  ) else (
  REM No staged changes - create empty commit
  rem call :LogMessage "Git commit empty"
  git commit --allow-empty -m "empty: !APP_KEY!" >nul 2>&1
)

:SLEEP
REM Sleep for 5 minutes (timeout in seconds)
rem call :LogMessage "start sleeping !INTERVAL_SECONDS!s"
powershell -NoProfile -Command "Start-Sleep -Seconds !INTERVAL_SECONDS!"

goto LOOP

:LogMessage
set "MSG=%~1"
echo !date! !time! !APP_KEY! !MSG! >> "!LOG_PATH!"
goto :eof

:GetPid
set "CMD=powershell -NoProfile -Command "$ppid = (Get-CimInstance Win32_Process -Filter \"ProcessId = $PID\").ParentProcessId; echo $ppid""
!CMD! >> "!LOG_PATH!" 2>&1
goto :eof
