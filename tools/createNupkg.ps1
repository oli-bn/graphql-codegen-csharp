$scriptDir = Split-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -Parent

$toolsPath = Join-Path $scriptDir "tools"

cd $toolsPath

$nuspecPath = Join-Path $toolsPath "Agoda.CodeGen.GraphQL.nuspec"

$version = $env:APPVEYOR_BUILD_VERSION

nuget pack $nuspecPath -Version "$version-alpha"