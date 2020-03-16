git checkout dev

git fetch origin dev
git merge origin/dev

del oldOutput.txt
ren output.txt oldOutput.txt
node bot.js > output.txt
IF %ERRORLEVEL% == 9(
exit
)
git add *
git commit * -m "end of task git push"
git push -u origin dev
launcher.bat