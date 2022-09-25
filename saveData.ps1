<#
.SYNOPSIS
    Copies the encrypted databases from the local skarmData to cloud copies on Box

#>

$windowTitle = "SkarmBot live"
$host.ui.RawUI.WindowTitle = $windowTitle

$dataDestination = "~\Box\skarmData\"
$dataRemoval = "$PSScriptRoot\..\skarmData\*(*).penguin"
$dataSource = "$PSScriptRoot\..\skarmData\*.penguin"

if(-not(Test-Path $dataSource)){
    Write-Error "Error: data source not found"
    $Host.SetShouldExit(-1)
    exit
}

if(-not(Test-Path $dataDestination)){
    Write-Error "Error: data destination path not found"
    $Host.SetShouldExit(-2)
    exit
}

# Purge clones
ls $dataRemoval | Remove-Item -Verbose

# Save data to Box
ls $dataSource | where {$_.Length -gt 8} | foreach {Write-Host "Saving $($_.Name) of size $($_.Length) to the cloud..."; Copy-Item -Path $_ -Destination $dataDestination -Force}
