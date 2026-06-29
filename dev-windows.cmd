@echo off
setlocal
REM UNC startup cwd is fine here: we immediately map to a drive letter with pushd.
pushd "%~dp0" || exit /b 1
set "INIT_CWD=%CD%"
node "%INIT_CWD%\scripts\run-dev.cjs"
set "EXITCODE=%ERRORLEVEL%"
popd
exit /b %EXITCODE%
