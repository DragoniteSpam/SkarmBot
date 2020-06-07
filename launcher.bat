REM verify no duplicate tasks are running
tasklist | find /i "node" 
if %ERRORLEVEL% ==1 (
cd C:\bots\Skarmbot
start truelaunch.bat
)

timeout /t 10