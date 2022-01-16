<#
.SYNOPSIS
    Copies in the encrypted databases used by skarm into the path SkarmBot\..\skarmData\ from cloud copies accessed via Box Drive

#>


$dataSource = "~\Box\skarmData\*.penguin"
$dataDestination = "$PSScriptRoot\..\skarmData\"

if(Test-Path $dataSource){
    Write-Host "Copying files..."
    if(-not (Test-Path $dataDestination)){
        New-Item -Path $dataDestination -ItemType Directory
    }
    
    # Copy in data if the file size is at least 1 byte (avoids one-time case where 0-length data was pushed to the database)
    ls $dataSource | where {$_.Length -gt 8} | foreach {Write-Host "Copying in $($_.Name) of size $($_.Length)"; Copy-Item -Path $_ -Destination $dataDestination}

    #provide master branch git revision count to skarm
    $version = (git rev-list --count master)
    Write-Host "Version: $version"
    $Host.SetShouldExit($version)      #force the powershell exit code to be the "version" number
    exit                               #https://weblogs.asp.net/soever/returning-an-exit-code-from-a-powershell-script
}else{
    Write-Error "database files not found.  Please verify that the path ~\Box\skarmData exists and that Box Drive is working properly."
    exit -1
}
