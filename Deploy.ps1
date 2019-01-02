$nerfBifPath = split-path -parent $MyInvocation.MyCommand.Definition
Write-Output "Source code path - $($nerfBifPath.Trim())"

$extensionPath = $env:USERPROFILE + "\.vscode\extensions"
Write-Output "VS Code extension path - $($extensionPath.Trim())"

Copy-Item $nerfBifPath -Destination $extensionPath -Recurse -Force
Write-Host "Successfully installed the extension" -ForegroundColor Green