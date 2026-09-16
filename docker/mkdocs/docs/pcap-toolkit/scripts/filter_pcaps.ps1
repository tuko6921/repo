<#
.SYNOPSIS
    PCAP Toolkit - Filter and export PCAPs using tshark display filters.

.DESCRIPTION
    This script filters a `.pcap` file using Wireshark Display filters (-Y).
    It outputs the result to a new `.pcap` file using `tshark`.

.PARAMETER InputFile
    Path to the input PCAP file.

.PARAMETER OutputFile
    Path to the output (filtered) PCAP file.

.PARAMETER Filter
    The display filter string (Wireshark syntax only).

.EXAMPLE
    .\filter_pcaps.ps1 -InputFile "merged_output.pcap" -OutputFile "udp_only.pcap" -Filter "udp"
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $true)]
    [string]$OutputFile,

    [Parameter(Mandatory = $true)]
    [string]$Filter
)

# Resolve input path from current working directory
$ResolvedInput = Join-Path -Path (Get-Location) -ChildPath $InputFile

# Validate the input file
if (-Not (Test-Path -Path $ResolvedInput)) {
    Write-Error "Input file '$ResolvedInput' does not exist."
    exit 1
}

# Resolve output path
$ResolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputFile)) {
    $OutputFile
} else {
    Join-Path -Path (Get-Location) -ChildPath $OutputFile
}

# Build and run the tshark command with display filter only
$tsharkCommand = "tshark -r `"$ResolvedInput`" -Y `"$Filter`" -w `"$ResolvedOutput`""
Write-Output "Running: $tsharkCommand"
Invoke-Expression $tsharkCommand
