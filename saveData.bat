@echo off
cd ..\skarmData
if %errorlevel% == 1 (
	cd ..
	cd ..\skarmData
	if %errorlevel% == 1 (
		exit /b %errorlevel%
	)
)

git add *.penguin
git commit -a -m "Periodic commit"
git push
exit /b %errorlevel%