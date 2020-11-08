@echo off
xcopy C:\Users\%USERNAME%\Box\skarmData\*.penguin  ..\skarmData /y
exit /b %errorlevel%