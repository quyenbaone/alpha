$content = Get-Content 'c:\Users\cauva\Downloads\Decrypted.seb' -Raw 
$content = $content -replace "UltraViewer_Desktop.exe(.+?)<key>active</key>(.+?)<true/>", "UltraViewer_Desktop.exe`$1<key>active</key>`$2<false/>" 
