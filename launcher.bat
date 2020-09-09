REM verify no duplicate tasks are running
:LOOP
tasklist | find /i "node" 
if %ERRORLEVEL% ==0 (
goto END
)

node bot.js > output\output.txt
if %ERRORLEVEL% == 69 (
		goto LOOP
	)
)




:END