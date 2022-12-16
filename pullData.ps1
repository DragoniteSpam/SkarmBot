<#
.SYNOPSIS
    Copies in the encrypted databases used by skarm into the path SkarmBot\..\skarmData\ from cloud copies accessed via Box Drive

#>

$windowTitle = "Skarmbot live"
$host.ui.RawUI.WindowTitle = $windowTitle

Push-Location
cd $PSScriptRoot

$dataSource = "~\Box\skarmData\*.penguin"
$dataRemoval = "~\Box\skarmData\*(*).penguin"
$dataDestination = "$PSScriptRoot\..\skarmData\"

if(-not (Test-Path $dataSource)){
    try {
        Start-Process 'C:\Program Files\Box\Box\Box.exe'
        Write-Host "Starting up box drive..."
        Start-Sleep 15
    } catch {
        Write-Error "database files not found.  Please verify that the path ~\Box\skarmData exists and that Box Drive is working properly."
        Start-Sleep 1
        $Host.SetShouldExit(-1)
        exit
    }
}

Write-Host "Copying files..."
if(-not (Test-Path $dataDestination)){
    New-Item -Path $dataDestination -ItemType Directory
}

# Purge clones
ls $dataRemoval | Remove-Item -Verbose

# Copy in data if the file size is at least 1 byte (avoids one-time case where 0-length data was pushed to the database)
ls $dataSource | where {$_.Length -gt 8} | foreach {Write-Host "Copying in $($_.Name) of size $($_.Length)"; Copy-Item -Path $_ -Destination $dataDestination}

#provide master branch git revision count to skarm
$version = (git rev-list --count master)
Write-Host "Version: 2.$((gh pr list -s merged).Length).$version"
$Host.SetShouldExit($version)      #force the powershell exit code to be the "version" number
#exit                               #https://weblogs.asp.net/soever/returning-an-exit-code-from-a-powershell-script
Pop-Location
Start-Sleep 1
