#$ErrorActionPreference = "Stop"

$version = $env:APPVEYOR_BUILD_VERSION

if(!$version) 
{
	Write-Output "Missing version: $version"
	Exit 1
}

$branch = $env:APPVEYOR_REPO_BRANCH

if(!$branch) 
{
	Write-Output "Missing branch: $branch"
	Exit 1
}

if($branch -ne "master") 
{
    $version = "$version-alpha"
}


$scriptDir = Split-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -Parent
$nodeProjDir = Join-Path $scriptDir "nodejs"
$toolsPath = Join-Path $scriptDir "tools"
$binPath = Join-Path $scriptDir "csharp\bin\Debug"

cd $toolsPath

$nuspecPath = Join-Path $toolsPath "Agoda.CodeGen.GraphQL.nuspec"

nuget pack $nuspecPath -Version $version

ls $nuspecPath -Filter "*.nuspec" | % {
    Write-Output $_.FullName
    Copy-Item -Path $_.FullName -Destination 
}

cd $nodeProjDir

$packagePath = Join-Path $nodeProjDir "package.json"

Write-Output "-------------------------------------------"
Write-Output "nodeProjDir: $nodeProjDir, packagePath: $packagePath, version: $version, branch: $branch"
Write-Output "-------------------------------------------"

if(!(Test-Path $packagePath)) 
{
	Write-Output "Missing file: $packagePath"
	Exit 1
}

$packageJson = ConvertFrom-Json (gc $packagePath -Raw -Encoding Ascii) 
$packageJson.version = $version
$jsonText = ConvertTo-Json -InputObject $packageJson 

$jsonText | Out-File $packagePath -Encoding ascii

$npmrcPath = Join-Path $nodeProjDir  ".npmrc"
		
Write-Output "-------------------------------------------"
Write-Output "npmrc path: $npmrcPath"
Write-Output "-------------------------------------------"
		
if((Test-Path $npmrcPath)) {
    Write-Output "removing old .npmrc"
    Remove-Item $npmrcPath
}

$auth = "//registry.npmjs.org/:_authToken=`$`{NPM_TOKEN`}"

$auth | Out-File $npmrcPath -Encoding UTF8
iex "npm pack"
iex "npm publish"
    
