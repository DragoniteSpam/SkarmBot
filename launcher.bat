git fetch origin producton
git merge origin/producton
git checkout production -f
node bot.js > output.txt
git add *
git commit * -m "end of task git push"
git push -u origin producton
