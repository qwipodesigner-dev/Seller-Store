param(
  [Parameter(Mandatory=$true)][string]$Pptx,
  [Parameter(Mandatory=$true)][string]$Pdf
)
$ErrorActionPreference = 'Stop'
$pp = New-Object -ComObject PowerPoint.Application
$pp.DisplayAlerts = 1  # ppAlertsNone is 1
$pres = $pp.Presentations.Open($Pptx, $true, $false, $false)
# 32 = ppSaveAsPDF
$pres.SaveAs($Pdf, 32)
$pres.Close()
$pp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
"OK $Pdf"
