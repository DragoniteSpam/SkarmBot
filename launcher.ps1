Push-Location
cd $PSScriptRoot
if(-not (Test-Path "$PSScriptRoot\node_modules")){
    Start-Process -Wait powershell.exe -ArgumentList @("$PSScriptRoot\initialize-Dependencies.ps1")
}
do{
    node $PSScriptRoot\bot.js beta
}while($LASTEXITCODE -ne 69)
Pop-Location
