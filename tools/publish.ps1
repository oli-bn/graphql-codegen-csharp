#$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -Parent

cd $scriptDir

cd $scriptDir

$version = $env:APPVEYOR_BUILD_VERSION

$packagePath = Join-Path $scriptDir "package.json"

$packageJson = ConvertFrom-Json (gc $packagePath -Raw -Encoding Ascii) 

$isAppVeyor = $true


if([string]::IsNullOrWhiteSpace($version)){
    $v = [Version]::Parse($packageJson.version)    
    $version = "$($v.Major).$($v.Minor).$($v.Build + 1)"
    $isAppVeyor = $false
}

$packageJson.version = $version

$jsonText = ConvertTo-Json -InputObject $packageJson 

$jsonText | Out-File $packagePath -Encoding ascii

if($isAppVeyor){

    if($env:APPVEYOR_REPO_BRANCH -eq "master"){

        $npmrcPath = Join-Path $ENV:APPVEYOR_BUILD_FOLDER ".npmrc"
    
        Write-Output "npmrc path: $npmrcPath"
    
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