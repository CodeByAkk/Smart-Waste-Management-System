$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot

$java = "java"
if (Test-Path "C:\Program Files\Java\jdk-26.0.1\bin\java.exe") {
    $java = "C:\Program Files\Java\jdk-26.0.1\bin\java.exe"
} elseif ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $java = "$env:JAVA_HOME\bin\java.exe"
}

$targetClasses = Join-Path $rootDir "backend\target\classes"
if (-not (Test-Path $targetClasses)) {
    Write-Host ">>> Target classes not found. Building backend first..."
    & (Join-Path $rootDir "build-backend.ps1")
}

$m2Repo = Join-Path $env:USERPROFILE ".m2\repository"
$jars = (Get-ChildItem $m2Repo -Filter "*.jar" -Recurse -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch "sources" -and 
    $_.FullName -notmatch "javadoc" -and 
    $_.FullName -notmatch "slf4j.*1\.7\."
} | Select-Object -ExpandProperty FullName) -join ";"

$classpath = "$targetClasses;$jars"

Write-Host ">>> Starting Smart Waste Management System Backend on port 8080..."
& $java -cp $classpath com.smartwaste.SmartWasteApplication
