@echo off
xcopy ..\skarmData\*.penguin C:\Users\%USERNAME%\Box\skarmData\ /y
exit /b %errorlevel%