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
    [switch]$Force = $false,
    [switch]$test = $false
)

# Global variable set in case of errors to be able to pass back up to launcher file
$Global:warnings = $false

Function reportGood($value) {
    Write-Host -Object $value -ForegroundColor Green
}

Function reportWarn($value) {
    Write-Host -Object $value -ForegroundColor Red -BackgroundColor Black
    $Global:warnings = $true
}

$npmRoot = "$PSScriptRoot\node_modules"

Push-Location

cd $PSScriptRoot

if ($Force) {
    Write-Host "Purging $npmRoot"
    Remove-Item -Recurse -Force $npmRoot -ErrorAction Stop
}

### 1. node.js is installed
$softwareName = "Node.js"

Function get-LatestVersionData {
    # Returns an object containing the current version and download URL for the software
    $VersionSite     = "https://github.com/nodejs/node/releases?q=lts&expanded=true"
    $ProgressPreference = "SilentlyContinue"
    $content = Invoke-WebRequest -UseBasicParsing -Uri $VersionSite
    $path = $content.Links | % href | ? {$_ -like "*/releases/tag/v*"} | select -first 1
    $vversion = $path.split("/")[-1]
    $cv = $vversion.Replace("v","")
    
    [PSCustomObject]@{
        currentVersion = $cv
        downloadUrl = "https://nodejs.org/dist/v$cv/node-v$cv-x64.msi"
    }
}

Function get-InstalledVersion {
    <#
        Returns the version data if the software is installed, and no value otherwise
    #>
    Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\* | where {$_.DisplayName -and $_.DisplayName.Contains("Node.js")} | foreach {$_.DisplayVersion}
}

Function get-upToDateStatus {
    $latest = (get-LatestVersionData).currentVersion
    $installed = get-InstalledVersion
    [pscustomobject]@{
        IsInstalled = $latest -in $installed 
        Latest = $latest
        Installed = $installed
    }
}

Function install-LatestVersion {
    param($currentVersion, $downloadUrl)
    $webPageFilePath = "C:\Users\$env:username\AppData\Local\Temp\$softwareName-$currentVersion.msi"
    $logFilePath = "C:\Users\$env:username\AppData\Local\Temp\$softwareName-$currentVersion.log"
    $webClient.DownloadFile($downloadUrl, $webPageFilePath)

    start-process msiexec.exe -Wait -ArgumentList @("/passive", "/log", "$logFilePath.log", "/package", $webPageFilePath)
}

<# EXECUTION #>
$webClient = (New-Object System.Net.WebClient)
$latestData = get-LatestVersionData
$currentVersion = $latestData.currentVersion

$status = get-upToDateStatus
if($status.IsInstalled){
    Write-Host -ForegroundColor Green "Latest version is already installed: $softwareName - $currentVersion"
    exit
} else {
    Write-Host "Not already installed: $softwareName - $currentVersion"
    if($status.Installed){
        Write-Host "Currently installed version:" $status.Installed
    }
}

# Disabled to let the user manage installed version instead
# Write-Host "Installing $softwareName $currentVersion"
# install-LatestVersion -currentVersion $currentVersion -downloadUrl $latestData.downloadUrl

# Verify installation was successful
if(get-upToDateStatus){
    Write-Host -ForegroundColor Green "Latest version has been installed: $softwareName - $currentVersion"

	# Refresh Environment Variable after the install
	$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
} else {
    Write-Error "Failed to install latest version of $softwareName - $currentVersion"
}






### 2. NPM modules
$PackageList = @("child_process", "discordie", "request", "node-wolfram", "crypto-js")

$allPackagesInsatlled = $true
$PackageList | foreach {
    $item = $_
    
    #NPM package paths ignore @ suffix
    if ($_.contains("@")) {
        $item = $item.Substring(0, $item.indexOf("@"))
    }
    
    
    if (Test-Path $npmRoot\$item) {
        return;
    }
    else {
        reportWarn("installing package: $_")
        npm install $_ >>$null 2>$Null
    }


    if (Test-Path $npmRoot\$item) {
        reportGood("Initialized $item package")
    }
    else {
        $allPackagesInsatlled = $false
        reportWarn("Failed to find package: $npmRoot\$item")
        reportWarn("Please run 'npm install $_'")
    }
}
if ($allPackagesInsatlled) {
    reportGood "All NPM packages are installed"
}


### 3. local/Box skarm data
$skarmDataPath = "$PSScriptRoot/../skarmData"
$skarmDataBox = "~/Box/skarmData"

if (-not(Test-Path $skarmDataPath)) {
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
    if (-not (Test-Path "$skarmDataPath/$_") -and -not (Test-Path "$skarmDataBox/$_")) {
        reportWarn "$_ is missing from skarmData on both Box and locally"
        $missingFiles = $true
    }
    if (     (Test-Path "$skarmDataPath/$_") -and -not (Test-Path "$skarmDataBox/$_")) {
        reportWarn "$_ is missing from skarmData on Box"
        $missingFiles = $true
    }
}
if (-not $missingFiles) {
    reportGood "All data files present"
}

### 4. all required tokens exist
$privateTokens = @{}
$privateTokens["aes.txt"] = "This token must be given to you by an admin.  Please contact Drago or Argo for a copy."
if ($test) {
    $privateTokens["descrution.txt"] = "This token is used when testing the bot outside of the main instance. `n Go to https://discord.com/developers/applications. `n Select your application. `n Select the bot tab. `n Click 'Copy' on the TOKEN field. `n Paste the contents into the file path."
}
else {
    $privateTokens["token.txt"] = "This token is used to connect the bot to the main instance. `n Go to https://discord.com/developers/applications. `n Select your application. `n Select the bot tab. `n Click 'Copy' on the TOKEN field. `n Paste the contents into the file path."
}
# $privateTokens["wolfram.txt"] = "Acquire a Wolfram Alpha API key here: https://products.wolframalpha.com/api/"


$missingTokens = $false
$privateTokens.Keys | foreach {
    $tokenPath = "$PSScriptRoot/../$_"
    $boxTokenPath = "~/Box/skarmData/tokens/$_"
    if (-not (Test-Path $tokenPath)) {
        if (Test-Path $boxTokenPath) {
            Copy-Item -Path $boxTokenPath -Destination $tokenPath -Verbose
        }
        else {
            reportWarn "The following token is missing: $tokenPath"
            reportWarn "    Not found at $boxTokenPath"
            reportWarn $privateTokens[$_]
            Write-Host ""
            $missingTokens = $true
        }
    }
}
if (-not $missingTokens) {
    reportGood "All required tokens present"
}

Pop-Location

$Global:warnings
