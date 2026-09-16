<#
.SYNOPSIS
    Merge multiple PCAP files from a folder into one output file.

.DESCRIPTION
    Uses mergecap to combine .pcap files found in a specified folder
    into a single merged PCAP file. Works well with Wireshark/mergecap
    installed on Windows.

.PARAMETER InputFolder
    Relative or full path to the folder containing .pcap files.

.PARAMETER OutputFile
    (Optional) Name of the output file. Defaults to 'merged_output.pcap'.
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$InputFolder,

    [string]$OutputFile = "merged_output.pcap"
)

# Path to mergecap.exe (edit this if installed elsewhere)
$mergecapPath = "C:\Program Files\Wireshark\mergecap.exe"

if (-not (Test-Path $mergecapPath)) {
    Write-Error "mergecap.exe not found at '$mergecapPath'. Please install Wireshark or adjust the path."
    exit 1
}

# Resolve the input folder path
$ResolvedFolder = Join-Path -Path $PSScriptRoot -ChildPath $InputFolder

if (-not (Test-Path $ResolvedFolder)) {
    Write-Error "Input folder does not exist: $ResolvedFolder"
    exit 1
}

# Find all .pcap files in the folder
$pcapFiles = Get-ChildItem -Path $ResolvedFolder -Filter *.pcap | Select-Object -ExpandProperty FullName

if ($pcapFiles.Count -eq 0) {
    Write-Host "[ERROR] No .pcap files found in: $ResolvedFolder"
    exit 1
}

# Output path
$ResolvedOutput = Join-Path -Path $PSScriptRoot -ChildPath $OutputFile

# Merge all PCAP files
Write-Host "`n[Merging] $($pcapFiles.Count) files into: $ResolvedOutput"
& $mergecapPath -w "`"$ResolvedOutput`"" $pcapFiles

Write-Host "[OK] Merged PCAP created at: $ResolvedOutput"
