@echo off
REM verify no duplicate tasks are running
:LOOP

node bot.js beta
if %ERRORLEVEL% == 69 (
		goto LOOP
	)
)

exit /b 0