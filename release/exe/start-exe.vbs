Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)
exeFile = fso.BuildPath(base, "ai-diviner.exe")
distDir = fso.BuildPath(base, "dist")
imageDir = fso.BuildPath(base, "image")
envFile = fso.BuildPath(base, ".env")
envExample = fso.BuildPath(base, ".env.example")
If (Not fso.FileExists(envFile)) And fso.FileExists(envExample) Then
  fso.CopyFile envExample, envFile, True
End If
If Not fso.FileExists(exeFile) Then
  MsgBox "未找到 ai-diviner.exe。请保留当前解压目录完整后再运行。", 16, "AI Diviner 启动失败"
  WScript.Quit 1
End If
If Not fso.FolderExists(distDir) Then
  MsgBox "未找到 dist 前端资源。请保留当前解压目录完整后再运行；如果你是从源码仓库启动，请重新执行 npm install 和 npm run build:exe。", 16, "AI Diviner 启动失败"
  WScript.Quit 1
End If
If Not fso.FolderExists(imageDir) Then
  MsgBox "未找到 image 图片资源。请保留当前解压目录完整后再运行。", 16, "AI Diviner 启动失败"
  WScript.Quit 1
End If
shell.CurrentDirectory = base
shell.Run Chr(34) & exeFile & Chr(34), 0, False
