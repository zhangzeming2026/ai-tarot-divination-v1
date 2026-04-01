Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)
envFile = fso.BuildPath(base, ".env")
envExample = fso.BuildPath(base, ".env.example")
If (Not fso.FileExists(envFile)) And fso.FileExists(envExample) Then
  fso.CopyFile envExample, envFile, True
End If
shell.CurrentDirectory = base
shell.Run Chr(34) & fso.BuildPath(base, "ai-diviner.exe") & Chr(34), 0, False
