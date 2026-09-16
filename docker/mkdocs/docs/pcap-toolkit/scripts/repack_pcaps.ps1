<#
.SYNOPSIS
    Repack PCAPs by merging and then splitting them into chunks.

.DESCRIPTION
    This script takes a directory of `.pcap` files, merges them using `mergecap`,
    then splits the merged file into smaller `.pcap` chunks using `editcap`.

.PARAMETER InputFolder
    Path to the folder containing `.pcap` files.

.PARAMETER ChunkSize
    Number of packets per split `.pcap` file.

.EXAMPLE
    .\repack_pcaps.ps1 -InputFolder ".\pcap" -ChunkSize 1000
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$InputFolder,

    [Parameter(Mandatory = $true)]
    [int]$ChunkSize
)

$mergecap = "C:\Program Files\Wireshark\mergecap.exe"
$editcap = "C:\Program Files\Wireshark\editcap.exe"

if (-not (Test-Path $InputFolder)) {
    Write-Host "Directory not found: $InputFolder"
    exit 1
}

$files = Get-ChildItem $InputFolder -Filter *.pcap
if ($files.Count -eq 0) {
    Write-Host "No PCAP files found in the directory."
    exit 1
}

$mergedPath = "$PWD\merged_temp.pcap"
$outputBase = "$PWD\repacked_output.pcap"

Write-Host "`nMerging $($files.Count) files into: $mergedPath"
& $mergecap -w $mergedPath $files.FullName

Write-Host "Splitting merged PCAP into chunks of $ChunkSize packets..."
& $editcap -c $ChunkSize $mergedPath $outputBase

Remove-Item $mergedPath -Force
Write-Host "`nRepacking complete. Output written to: $PWD"
