[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
RebootMode=NoRestart
InstallPrompt=
DisplayLicense=
FinishMessage=
TargetName=D:\kantin\dist\kantin-single.exe
FriendlyName=Kantin Portable (single-click)
AppLaunched=cmd /c powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path \"%~dp0kantin-portable.zip\" -DestinationPath \"%TEMP%\\kantin_portable\" -Force; Start-Process -FilePath \"%TEMP%\\kantin_portable\\start.bat\" -WorkingDirectory \"%TEMP%\\kantin_portable\""
PostInstallCmd=

[Strings]
Title=Kantin Portable

[SourceFiles]
SourceFiles0=D:\kantin\dist
[SourceFiles0]
File0=kantin-portable.zip
