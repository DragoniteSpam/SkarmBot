param(
    [Parameter(Mandatory=$true)] [ValidateSet("live", "test")] $operationMode
)
Push-Location
cd $PSScriptRoot
Start-Process -Wait powershell.exe -ArgumentList @("$PSScriptRoot\initialize-Dependencies.ps1")


if($operationMode -eq "live"){
    do{
        node $PSScriptRoot\bot.js beta
    }while($LASTEXITCODE -ne 69)
}


if($operationMode -eq "test"){
    do{
        node $PSScriptRoot\bot.js
    }while($LASTEXITCODE -ne 69)
}

Pop-Location
