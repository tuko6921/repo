<#
.SYNOPSIS
    Split a PCAP file into smaller files by packet count using editcap.

.DESCRIPTION
    This script uses editcap (from Wireshark) to split a large .pcap file into multiple smaller chunks,
    each with a defined number of packets.

.PARAMETER InputFile
    Path to the input .pcap file.

.PARAMETER PacketsPerSplit
    Number of packets per split file.

.EXAMPLE
    .\split_pcap.ps1 -InputFile "large.pcap" -PacketsPerSplit 100000
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $true)]
    [int]$PacketsPerSplit
)

# Path to editcap.exe
$editcapPath = "C:\Program Files\Wireshark\editcap.exe"

if (-not (Test-Path $editcapPath)) {
    Write-Error "editcap.exe not found at: $editcapPath. Please check your Wireshark installation."
    exit 1
}

if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

# Get base name and construct output file name
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
$outputPattern = "$PWD\${baseName}_split.pcap"

# Run editcap to split
Write-Host "Splitting '$InputFile' into chunks of $PacketsPerSplit packets..."
& "$editcapPath" -c $PacketsPerSplit "$InputFile" "$outputPattern"

Write-Host "✅ PCAP file successfully split!"
