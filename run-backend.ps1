$ErrorActionPreference = "Stop"

$java = "C:\Program Files\Java\jdk-26.0.1\bin\java.exe"
if (-not (Test-Path $java)) {
    $java = "java"
}

$targetClasses = "d:\projects\ADSA\backend\target\classes"
if (-not (Test-Path $targetClasses)) {
    Write-Host ">>> Target classes not found. Building backend first..."
    & "d:\projects\ADSA\build-backend.ps1"
}

$jars = (Get-ChildItem "C:\Users\LOQ\.m2\repository" -Filter "*.jar" -Recurse | Where-Object { 
    $_.FullName -notmatch "sources" -and 
    $_.FullName -notmatch "javadoc" -and 
    $_.FullName -notmatch "slf4j.*1\.7\."
} | Select-Object -ExpandProperty FullName) -join ";"

$classpath = "$targetClasses;$jars"

Write-Host ">>> Starting Smart Waste Management System Backend on port 8080..."
& $java -cp $classpath com.smartwaste.SmartWasteApplication
