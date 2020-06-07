:LOOP
git pull
node bot.js > output.txt
if %ERRORLEVEL% == 69 (goto LOOP)