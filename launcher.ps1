﻿<#
.Synopsis
   Launches skarmbot or a testing instance

.DESCRIPTION
   Launches skarmbot or a testing instance.  If the computer is already hosting that particular version, the script will exit immediately.

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

.PARAMETER stopOnError
    Stop before execution if any dependencies are missing
#>


param(
    [Parameter(Mandatory = $true)] [string][ValidateSet("live", "test")] $operationMode,
    [switch] $stopOnError = $false
)

$test = $operationMode -eq "test"

$host.ui.RawUI.WindowTitle = "Definitely not SkarmBot"
$windowTitle = "SkarmBot live"

$conflictingProcesses = Get-Process | where { $_.MainWindowTitle -eq $windowTitle }
if ($conflictingProcesses) {
    Write-Host "A process with this unique name is already running: "
    return $conflictingProcesses
}
$host.ui.RawUI.WindowTitle = $windowTitle


Push-Location
cd $PSScriptRoot
Write-Host "Checking dependencies..."
# $failure = . "$PSScriptRoot/initialize-Dependencies.ps1" -test:$test

# Reset window title as it may have gotten wiped when starting the dependency initializer
$host.ui.RawUI.WindowTitle = $windowTitle

if ($Global:warnings -and $stopOnError) {
    Write-Host "Failed dependency check.  Skarmbot will not start."
    exit
}
Write-Host "Starting Skarmbot bootloop"
if ($operationMode -eq "live") {
    if ($IsLinux) {
        $nvm = Get-ChildItem /home/*/.nvm/versions/node/v*/bin/node | % FullName | Select -Last 1
        Write-Host "Available node versions: $nvm"

        . $nvm $PSScriptRoot/bot.js beta |
        foreach {
            $t = (get-date -format o).split(".")[0].Replace("T", " ")
            "[$t] $_"
        }
        $LEC = $LASTEXITCODE
        Write-Host "Process exited with code $LEC"
    }
    else {
        do {
            node $PSScriptRoot/bot.js beta | 
            foreach {
                $t = (get-date -format o).split(".")[0].Replace("T", " ")
                "[$t] $_"
            }
            $LEC = $LASTEXITCODE
            Write-Host "Process exited with code $LEC"
        } while ($LEC -ne 0 -and $LEC -ne 42)    
    }
}


# no persistence through failures during testing
if ($operationMode -eq "test") {
    node $PSScriptRoot/bot.js | foreach {
        $t = (get-date -format o).split(".")[0].Replace("T", " ")
        "[$t] $_"
    }
    $LEC = $LASTEXITCODE
    Write-Host "Process exited with code $LEC"
}

Pop-Location
