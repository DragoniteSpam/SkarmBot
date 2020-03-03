git checkout master
git fetch origin master
git merge origin/master
git pull
node bot.js > output.txt
IF %ERRORLEVEL% == 9 ( exit )
git add users/*.zeal
git commit users/*.zeal -m "User Updates"
git add logs/*.*
git commit logs/*.* -m "Log Updates"
git commit *.txt -m "end of task git push"
git push 
echo restarting...
launcher.bat
