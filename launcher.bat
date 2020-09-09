@echo off
REM verify no duplicate tasks are running
:LOOP
tasklist | find /i "node" 
if %ERRORLEVEL% ==0 (
	exit /b 0
)

node bot.js beta
if %ERRORLEVEL% == 69 (
	goto LOOP
)