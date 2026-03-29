$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "AI Diviner 卸载程序 (Windows)"
Write-Host "=========================================="

$PidFile = ".app.pid"

$Confirm = Read-Host "是否完全删除应用？这将删除应用目录。(y/n)"
if ($Confirm -ne "y" -and $Confirm -ne "Y") {
  Write-Host "取消卸载"
  exit 0
}

Write-Host ""
Write-Host "[1/3] 停止应用进程..."
if (Test-Path $PidFile) {
  $AppPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if ($AppPid) {
    $Process = Get-Process -Id $AppPid -ErrorAction SilentlyContinue
    if ($Process) {
      Stop-Process -Id $AppPid -Force
      Start-Sleep -Seconds 1
      Write-Host "✓ 进程已停止"
    } else {
      Write-Host "○ 进程不存在"
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "[2/3] 删除日志目录..."
$LogDir = "logs"
if (Test-Path $LogDir) {
  Remove-Item $LogDir -Recurse -Force
  Write-Host "✓ 日志目录已删除"
} else {
  Write-Host "○ 日志目录不存在"
}

Write-Host ""
Write-Host "[3/3] 清理 npm 缓存..."
$NodeModules = "node_modules"
if (Test-Path $NodeModules) {
  Write-Host "  删除 node_modules..."
  Remove-Item $NodeModules -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "✓ 依赖已清理"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "卸载完成！"
Write-Host "应用目录可手动删除。"
Write-Host "=========================================="
