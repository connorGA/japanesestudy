@echo off
setlocal
pushd "%~dp0" || exit /b 1
if /i "%~1"=="/clean" (
  if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
  )
)
REM .npmrc sets bin-links=false so installs work on SMB / mapped Mac shares.
call npm.cmd install
set "EXITCODE=%ERRORLEVEL%"
popd
exit /b %EXITCODE%
