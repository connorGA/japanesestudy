# Run from the repo root (double-click or in PowerShell):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\go-local.ps1
# Or:  . .\go-local.ps1
#
# Maps \\Mac\Share\... to a free drive letter (net use) and cds there so npm/cmd work.

$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  return (Resolve-Path -LiteralPath $PSScriptRoot).Path
}

function Test-UncPath([string]$Path) {
  return $Path.StartsWith('\\')
}

function Split-Unc([string]$UncPath) {
  if ($UncPath -notmatch '^\\\\([^\\]+)\\([^\\]+)(\\.*)?$') {
    throw "Path is not a UNC share in the form \\server\share\... : $UncPath"
  }
  $server = $Matches[1]
  $share = $Matches[2]
  $rest = if ($Matches[3]) { $Matches[3].TrimStart('\') } else { '' }
  return @{
    Root = "\\$server\$share"
    SubPath = $rest
  }
}

function Get-FreeDriveLetter {
  foreach ($code in 90..68) {
    $letter = [char]$code
    $root = "${letter}:\"
    if (-not (Test-Path -LiteralPath $root)) {
      return $letter
    }
  }
  throw 'No free drive letters between Z: and D:. Free one in Explorer or run net use * /delete for unused mappings.'
}

$repo = Get-RepoRoot

if (-not (Test-UncPath $repo)) {
  Write-Host "Already on a drive-letter path: $repo"
  Set-Location -LiteralPath $repo
  Write-Host 'You can run: npm install   then   npm run dev'
  exit 0
}

$parts = Split-Unc $repo
$uncRoot = $parts.Root
$sub = $parts.SubPath

$letter = Get-FreeDriveLetter
$drive = "${letter}:"

Write-Host "Mapping $uncRoot -> ${drive}\ ..."
net use $drive $uncRoot /persistent:no | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) {
  throw "net use failed (exit $LASTEXITCODE). Check Parallels Shared Folders / Mac file sharing, or map the share manually in Explorer."
}

$target = if ($sub) {
  Join-Path $drive $sub
} else {
  Join-Path $drive '\'
}

if (-not (Test-Path -LiteralPath $target)) {
  net use $drive /delete /yes | Out-Null
  throw "Mapped drive does not contain expected folder: $target"
}

Set-Location -LiteralPath $target
Write-Host ""
Write-Host "Now at: $(Get-Location)"
Write-Host "Run: npm install"
Write-Host "Then: npm run dev   (or npm.cmd run dev if execution policy blocks npm.ps1)"
Write-Host ""
Write-Host "This session used a temporary map (/persistent:no). For a permanent drive, run:"
Write-Host "  net use $drive $uncRoot /persistent:yes"
