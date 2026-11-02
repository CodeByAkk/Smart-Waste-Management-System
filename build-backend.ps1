$ErrorActionPreference = "Stop"

Write-Host ">>> Locating Java and .m2 dependencies..."
$javac = "C:\Program Files\Java\jdk-26.0.1\bin\javac.exe"
if (-not (Test-Path $javac)) {
    $javac = "javac"
}

$targetClasses = "d:\projects\ADSA\backend\target\classes"
if (Test-Path $targetClasses) {
    Remove-Item -Recurse -Force $targetClasses
}
New-Item -ItemType Directory -Force -Path $targetClasses | Out-Null

$jars = (Get-ChildItem "C:\Users\LOQ\.m2\repository" -Filter "*.jar" -Recurse | Where-Object { 
    $_.FullName -notmatch "sources" -and 
    $_.FullName -notmatch "javadoc" -and 
    $_.FullName -notmatch "slf4j.*1\.7\."
} | Select-Object -ExpandProperty FullName) -join ";"

$javaFiles = Get-ChildItem -Path "d:\projects\ADSA\backend\src\main\java" -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName

$sourcesFile = "d:\projects\ADSA\backend\sources.txt"
[System.IO.File]::WriteAllLines($sourcesFile, $javaFiles)

Write-Host ">>> Compiling $($javaFiles.Count) Java source files with javac..."
$process = Start-Process -FilePath $javac -ArgumentList "--release 21 -parameters -encoding UTF-8 -d `"$targetClasses`" -cp `"$jars`" `@`"$sourcesFile`"" -NoNewWindow -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Error "Compilation failed with code $($process.ExitCode)"
    exit 1
}

Write-Host ">>> Copying resource files..."
$resources = Get-ChildItem -Path "d:\projects\ADSA\backend\src\main\resources"
foreach ($r in $resources) {
    Copy-Item -Path $r.FullName -Destination $targetClasses -Force
}

Remove-Item $sourcesFile -Force -ErrorAction SilentlyContinue
Write-Host ">>> Backend compiled successfully into $targetClasses!"
