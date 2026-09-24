@echo off
setlocal
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

if exist "%LocalAppData%\Programs\Python\Python314\python.exe" (
  "%LocalAppData%\Programs\Python\Python314\python.exe" "%~dp0capture.py"
  exit /b %ERRORLEVEL%
)

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  python "%~dp0capture.py"
  exit /b %ERRORLEVEL%
)

echo {"continue": true}
exit /b 0
