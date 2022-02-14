<#
.Synopsis
   Launches skarmbot or a testing instance

.DESCRIPTION
   Launches skarmbot or a testing instance

.EXAMPLE
    .\launcher.ps1 operationMode live
    Launches a live operation instance of skarmbot

.EXAMPLE
    .\launcher.ps1 operationMode test
    Launches a test instance of skarmbot

.INPUTS
   Operation mode: live or test

.OUTPUTS
    Hosts skarmbot indefinitely

.NOTES
   TODO
#>


param(
    [Parameter(Mandatory=$true)] [string][ValidateSet("live", "test")] $operationMode
)
Push-Location
cd $PSScriptRoot
Start-Process -Wait powershell.exe -ArgumentList @("$PSScriptRoot\initialize-Dependencies.ps1")


if($operationMode -eq "live"){
    do{
        node $PSScriptRoot\bot.js beta
        $LEC = $LASTEXITCODE
        Write-Host "Process exited with code $LEC"
    }while($LEC -ne 0 -and $LEC -ne 42)
}


if($operationMode -eq "test"){
    do{
        node $PSScriptRoot\bot.js
        $LEC = $LASTEXITCODE
        Write-Host "Process exited with code $LEC"
    }while($LEC -ne 0 -and $LEC -ne 42)
}

Pop-Location
