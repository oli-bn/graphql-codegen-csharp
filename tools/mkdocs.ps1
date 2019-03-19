$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
cd $scriptDir

$sitePath = Join-Path $scriptDir "Site"

$htmls = ls $sitePath -Recurse -Filter "*.html" 

$htmls | % {

    $html = gc $_.FullName

    $html = $html -replace '../css/', "//agoda-com.github.io/graphql-codegen-csharp/css/"
    $html = $html -replace '"css/', '"//agoda-com.github.io/graphql-codegen-csharp/css/'
    $html = $html -replace '../js/', "//agoda-com.github.io/graphql-codegen-csharp/js/"
    $html = $html -replace '"js/', '"//agoda-com.github.io/graphql-codegen-csharp/js/'
    $html = $html -replace '../img/', "//agoda-com.github.io/graphql-codegen-csharp/img/"
    $html = $html -replace '"img/', '"//agoda-com.github.io/graphql-codegen-csharp/img/'

    $html | Out-File -FilePath $_.FullName -Encoding utf8

    $html
}


