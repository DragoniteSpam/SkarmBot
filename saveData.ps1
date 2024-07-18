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

### Purge clones
ls $dataRemoval | Remove-Item -Verbose


### Save data to Box
ls $dataSource | where {$_.Length -gt ".penguin".Length} |    # Take all the local penguin files
foreach {
    Write-Host "Saving $($_.Name) of size $($_.Length) to the cloud..."; 
    Copy-Item -Path $_ -Destination $dataDestination -Force
}


### Save data backups based on timestamp
# using '-format "yyyy/MM/dd"' does not have consistently 
# correct behavior based on regional format
$d = (Get-Date -format "yyyy-MM-dd") -replace "-","/"
$backupPath = Join-Path  $dataDestination $d                  # use cmdlet for clean/reliable path merging
mkdir $backupPath -ErrorAction SilentlyContinue | Out-Null    # make the date-based folder if it hasn't already been made

# repeat save to data backup destination
ls $dataSource | 
where {$_.Length -gt ".penguin".Length} | 
foreach {
    Write-Host "Saving $($_.Name) of size $($_.Length) to the backup path $backupPath`..."; 
    Copy-Item -Path $_ -Destination $backupPath -Force
}
