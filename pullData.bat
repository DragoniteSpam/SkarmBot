@echo off
cd ..\skarmData
if %errorlevel% == 1 (
	cd ..
	cd ..\skarmData
	if %errorlevel% == 1 (
		exit /b %errorlevel%
	)
)

git pull
cd ..\SkarmBot
exit /b %errorlevel%