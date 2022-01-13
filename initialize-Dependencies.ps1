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

#initialize webclient and temp directory (not checked into git)
$webClient = New-Object System.Net.WebClient
$webPageFilePath = "$PSScriptRoot/temp/site.html"
if(-not (Test-Path "$PSScriptRoot/temp")){
    $tempDir = mkdir temp
}

#Fetch latest version number of nodejs
$VersionSite = "https://nodejs.org/en/"
Remove-Item -Force $webPageFilePath -ErrorAction SilentlyContinue
$webClient.DownloadFile($VersionSite, $webPageFilePath)

#typecasting
$fileData = (Get-Content -Path $webPageFilePath) | where {$_.Contains("nodejs.org/dist/v")}
if($fileData.GetType().BaseType.Name -eq "Array"){
    $fileData = $fileData[0]
}

#isolate version number from file data
$fileData = $fileData.Substring($fileData.IndexOf("dist/v")+"dist/v".Length)
$fileData = $fileData.Substring(0,$fileData.IndexOf("/"))
$nodejsVersion = $fileData

#construct node download URLs
$nodejsDownloadBase = 'https://nodejs.org/dist/v'+$nodejsVersion+'/'
$nodejsFile = 'node-v'+$nodejsVersion+'-x64.msi'
$nodejsDownloadLink = $nodejsDownloadBase+$nodejsFile
$nodejsFileFull = "$PSScriptRoot/temp/$nodejsFile"

#check currently installed version in registry
$nodeProducts = Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\* | where {$_.DisplayName -and $_.DisplayName.Contains("Node")}


if(!$nodeProducts -or ($nodeProducts.DisplayVersion -ne $nodejsVersion)){
    Write-Host "Installing node.js version $nodejsVersion..."
    #SRC: https://gist.github.com/manuelbieh/4178908#file-win32-node-installer
    Remove-Item -Force $nodejsFileFull
    $webClient.DownloadFile($nodejsDownloadLink, $nodejsFileFull)
    if([Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544'){                     #https://megamorf.gitlab.io/2020/05/26/check-if-powershell-is-running-as-administrator/
        msiexec /passive /log "$nodejsVersion.log" /package $nodejsFileFull
    }else{
        reportWarn "Session is not running as admin.  Unable to install the latest version of node js"
        
        if($nodeProducts){
            reportWarn ("Rolling with existing version: " + $nodeProducts.DisplayVersion)
        }else{
            exit        #don't bother checking NPM packages if node is not installed
        }
    }
}else{
    reportGood "the latest version of node is already installed $nodejsVersion"
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
