git checkout master
git fetch origin master
git merge origin/master
git pull
del oldOutput.txt
ren output.txt oldOutput.txt
node bot.js > output.txt
set ERL=%ERRORLEVEL%
IF %ERL% == 9 ( exit )
git add users/*.zeal
git commit users/*.zeal -m "User Updates"
git add logs/*.*
git commit logs/*.* -m "Log Updates"
git commit *.txt -m "end of task git push"
git push 
IF %ERL% == 1 (
echo restarting...
launcher.bat
exit)
IF %ERL% == 2 (
echo restarting...
launcher.bat
exit)
IF %ERL% == 3 (
echo restarting...
launcher.bat
exit)
IF %ERL% == 4 (
echo restarting...
launcher.bat
exit)
IF %ERL% == 5 (
echo restarting...
launcher.bat
exit)
IF %ERL% == 6 (
echo switching to dev...
dev.bat
exit)
IF %ERL% == 7 (
echo switching to 2...
2.bat
exit)
IF %ERL% == 420 (
winRestart.bat
)
echo failed to find a proper thing to reboot off of... I'll restart...
launcher.bat