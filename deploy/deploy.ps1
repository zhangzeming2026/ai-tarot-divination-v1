$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $RootDir ".app.pid"
$LogDir = Join-Path $RootDir "logs"
$LogFile = Join-Path $LogDir "app.log"

Set-Location $RootDir

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "已自动创建 .env，请补充 OPENAI_API_KEY 后重新执行。"
  exit 1
}

npm install --omit=dev

if (-not (Test-Path $LogDir)) {
  New-Item -ItemType Directory -Path $LogDir | Out-Null
}

if (Test-Path $PidFile) {
  $OldPid = (Get-Content $PidFile | Select-Object -First 1).Trim()
  if ($OldPid) {
    $OldProcess = Get-Process -Id $OldPid -ErrorAction SilentlyContinue
    if ($OldProcess) {
      Stop-Process -Id $OldPid -Force
      Start-Sleep -Seconds 1
    }
  }
}

$Process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run start >> `"$LogFile`" 2>&1" -WorkingDirectory $RootDir -WindowStyle Hidden -PassThru
Set-Content -Path $PidFile -Value $Process.Id

Write-Host "部署完成，应用已启动。"
Write-Host "访问地址: http://服务器IP:8787"
Write-Host "日志文件: $LogFile"