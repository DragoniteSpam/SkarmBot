Param(
    [switch]$Force = $false
)

Function reportGood($value){
    Write-Host -Object $value -ForegroundColor Green
}

Function reportWarn($value){
    Write-Host -Object $value -ForegroundColor Yellow -BackgroundColor Red
}

$npmRoot = "$PSScriptRoot\node_modules"

Push-Location

cd $PSScriptRoot

if($Force){
    Write-Host "Purging $npmRoot"
    Remove-Item -Recurse -Force $npmRoot
}

$PackageList = @("child_process", "discordie", "request", "node-wolfram", "crypto-js")

$PackageList | foreach {
    $item = $_
    
    #NPM package paths ignore @ suffix
    if($_.contains("@")){
        $item = $item.Substring(0,$item.indexOf("@"))
    }
    
    
    if(Test-Path $npmRoot\$item){
        reportGood("Initialized $item package")
        return;
    }else{
        reportWarn("installing package: $_")
        npm install $_ >>$null 2>$Null
    }


    if(Test-Path $npmRoot\$item){
        reportGood("Initialized $item package")
    }else{
        reportWarn("Failed to find package: $npmRoot\$item")
        reportWarn("Please run 'npm install $_'")
    }
}

Pop-Location
