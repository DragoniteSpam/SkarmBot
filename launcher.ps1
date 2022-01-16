param(
    [Parameter(Mandatory=$true)] [ValidateSet("live", "test")] $operationMode
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
