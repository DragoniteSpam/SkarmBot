cd $PSScriptRoot
do{
    node $PSScriptRoot\bot.js beta
}while($LASTEXITCODE -ne 69)