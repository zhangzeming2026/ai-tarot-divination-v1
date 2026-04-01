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
  MsgBox "AI Diviner: Missing ai-diviner.exe. Keep directory complete.", 16, "Error"
  WScript.Quit 1
End If
If Not fso.FolderExists(distDir) Then
  MsgBox "AI Diviner: Missing dist folder. Keep directory complete.", 16, "Error"
  WScript.Quit 1
End If
If Not fso.FolderExists(imageDir) Then
  MsgBox "AI Diviner: Missing image folder. Keep directory complete.", 16, "Error"
  WScript.Quit 1
End If
shell.CurrentDirectory = base
shell.Run Chr(34) & exeFile & Chr(34), 0, False
