<#
.SYNOPSIS
    This script initializes all (WIP) dependencies required to run SkarmBot

.DESCRIPTION
    Last Modified:      52/01/12
    Emergency Contact:  github.com/argothenaut

    The following actions will be performed by the script in order to prepare the execution environment
    1. Make sure that the latest version of node.js is installed
    2. Make sure that all required NPM modules are installed
    3. Make sure that the skarmData local and Box directories are connected
    4. Make sure that all required secret tokens exist at the expected path
#>



### Setup
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
    Remove-Item -Recurse -Force $npmRoot -ErrorAction Stop
}

### 1. node.js is installed
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



### 2. NPM modules
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


### 3. local/Box skarm data
$skarmDataPath = "$PSScriptRoot/../skarmData"
$skarmDataBox = "~/Box/skarmData"

if(-not(Test-Path $skarmDataPath)){
    $skarmDataDir = mkdir $skarmDataPath
}

$skarmDataFiles = @(
    "deleted.penguin",
    "guilds.penguin",
    "users.penguin",
    "xkcd-log.penguin",
    "xkcd.penguin",
    "xkcdtime.penguin"
)



$missingFiles = $false
$skarmDataFiles | foreach {
    if(-not (Test-Path "$skarmDataPath/$_") -and -not (Test-Path "$skarmDataBox/$_")){
        reportWarn "$_ is missing from skarmData on both Box and locally"
        $missingFiles = $true
    }
    if(     (Test-Path "$skarmDataPath/$_") -and -not (Test-Path "$skarmDataBox/$_")){
        reportWarn "$_ is missing from skarmData on Box"
        $missingFiles = $true
    }
}
if(-not $missingFiles){
    reportGood "All data files present"
}

### 4. all required tokens exist
$privateTokens = @{}
$privateTokens["aes.txt"] = "This token must be given to you by an admin.  Please contact Drago or Argo for a copy."
$privateTokens["descrution.txt"] = "This token is used when testing the bot outside of the main instance. `n Go to https://discord.com/developers/applications. `n Select your application. `n Select the bot tab. `n Click 'Copy' on the TOKEN field. `n Paste the contents into the file path."
$privateTokens["token.txt"] = "This token is used to connect the bot to the main instance. `n Go to https://discord.com/developers/applications. `n Select your application. `n Select the bot tab. `n Click 'Copy' on the TOKEN field. `n Paste the contents into the file path."
$privateTokens["wolfram.txt"] = "Acquire a Wolfram Alpha API key here: https://products.wolframalpha.com/api/"


$missingTokens = $false
$privateTokens.Keys | foreach {
    $tokenPath = "$PSScriptRoot/../$_"
    if(-not (Test-Path $tokenPath)){
        reportWarn "The following token is missing: $tokenPath"
        $privateTokens[$_]
        $missingTokens = $true
    }
}
if(-not $missingTokens){
    reportGood "All required tokens present"
}

Pop-Location
