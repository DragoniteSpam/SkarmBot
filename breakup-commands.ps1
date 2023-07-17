$modLines = gc ./JavaScript/commands.js

$defaultMode = "idle"
$mode = $defaultMode

$functions = @{}

for ($i = 0; $i -lt $modLines.Length; $i++) {
    $nextLine = $modLines[$i]
    if ($mode -eq $defaultMode) {
        if ($nextLine -like "    [A-Z]*: {") {
            $mode = $nextLine.Trim().Split(":")[0]
            Write-Host "Entered Mode $mode"
            $functions[$mode] = @()
        }
        continue
    }

    if ($nextLine -like "    },") {
        Write-Host "Exiting mode $mode"
        $mode = $defaultMode
        continue
    }

    $functions[$mode] += $nextLine
}

$headers = @('"use strict";'
    'const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");'
    ''
    'module.exports = {'
)

$footers = @("}", "")

$functions.Keys | foreach {
    $lines = $headers + $functions[$_] + $footers
    Set-Content -Path "./javascript/commands/$_.js" -Value $lines
}

