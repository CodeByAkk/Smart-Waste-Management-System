$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
Write-Host ">>> Locating Java and .m2 dependencies..."

$javac = "javac"
if (Test-Path "C:\Program Files\Java\jdk-26.0.1\bin\javac.exe") {
    $javac = "C:\Program Files\Java\jdk-26.0.1\bin\javac.exe"
} elseif ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
    $javac = "$env:JAVA_HOME\bin\javac.exe"
}

$targetClasses = Join-Path $rootDir "backend\target\classes"
if (Test-Path $targetClasses) {
    Remove-Item -Recurse -Force $targetClasses
}
New-Item -ItemType Directory -Force -Path $targetClasses | Out-Null

$m2Repo = Join-Path $env:USERPROFILE ".m2\repository"
if (-not (Test-Path $m2Repo)) {
    Write-Warning ".m2 repository not found at $m2Repo. If you have Maven installed, run 'mvn clean compile' inside backend folder."
}

$jars = (Get-ChildItem $m2Repo -Filter "*.jar" -Recurse -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch "sources" -and 
    $_.FullName -notmatch "javadoc" -and 
    $_.FullName -notmatch "slf4j.*1\.7\."
} | Select-Object -ExpandProperty FullName) -join ";"

$srcDir = Join-Path $rootDir "backend\src\main\java"
$javaFiles = Get-ChildItem -Path $srcDir -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName

$sourcesFile = Join-Path $rootDir "backend\sources.txt"
[System.IO.File]::WriteAllLines($sourcesFile, $javaFiles)

Write-Host ">>> Compiling $($javaFiles.Count) Java source files with javac..."
$process = Start-Process -FilePath $javac -ArgumentList "--release 21 -parameters -encoding UTF-8 -d `"$targetClasses`" -cp `"$jars`" `@`"$sourcesFile`"" -NoNewWindow -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Error "Compilation failed with code $($process.ExitCode)"
    exit 1
}

Write-Host ">>> Copying resource files..."
$resourcesDir = Join-Path $rootDir "backend\src\main\resources"
$resources = Get-ChildItem -Path $resourcesDir
foreach ($r in $resources) {
    Copy-Item -Path $r.FullName -Destination $targetClasses -Force
}

Remove-Item $sourcesFile -Force -ErrorAction SilentlyContinue
Write-Host ">>> Backend compiled successfully into $targetClasses!"
