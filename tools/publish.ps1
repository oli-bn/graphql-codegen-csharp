#$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -Parent
$nodeProjDir = Join-Path $scriptDir "nodejs"
$toolsPath = Join-Path $scriptDir "tools"

cd $toolsPath

$nuspecPath = Join-Path $toolsPath "Agoda.CodeGen.GraphQL.nuspec"

$version = $env:APPVEYOR_BUILD_VERSION

nuget pack $nuspecPath -Version "$version-alpha"

cd $nodeProjDir

$packagePath = Join-Path $nodeProjDir "package.json"
$version = $env:APPVEYOR_BUILD_VERSION
$isAppVeyor = $true

if([string]::IsNullOrWhiteSpace($version)){
    $v = [Version]::Parse($packageJson.version)    
    $version = "$($v.Major).$($v.Minor).$($v.Build + 1)"
    $isAppVeyor = $false
}

$branch = $env:APPVEYOR_REPO_BRANCH

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

if($isAppVeyor){

    if($branch  -eq "master"){

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
    }
}
else{       
    npm publish
}