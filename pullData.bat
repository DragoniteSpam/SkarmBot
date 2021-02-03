@echo off
xcopy C:\Users\%USERNAME%\Box\skarmData\*.penguin  ..\skarmData\ /y
FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-list --count master`) DO (
    SET var=%%F
)
exit /b %var%
