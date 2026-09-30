# open-junie-plan.ps1 — launch a visible, interactive Junie session on an implementation plan,
# snapped to the bottom half of a portrait monitor and brought to the foreground.
# Usage:
#   .\open-junie-plan.ps1                     # uses the newest .md in .junie\plans\
#   .\open-junie-plan.ps1 -PlanPath .junie\plans\JP-001-my-plan.md
#   .\open-junie-plan.ps1 -Force              # skip confirmation prompts (non-interactive launchers)
# Lives in <project>\.claude\ — the project dir is its parent.
param(
    [string]$PlanPath,
    [string]$ProjectDir = (Split-Path $PSScriptRoot -Parent),
    [string]$ExpectedBranch = "master",
    [double]$SnapFraction = 0.33,  # portion of the monitor height the terminal occupies at the bottom
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Per-monitor DPI awareness MUST be set before any UI/monitor API call, or Windows
# feeds us virtualized coordinates on mixed-DPI setups and the snap lands elsewhere.
Add-Type -Namespace Win32 -Name Dpi -MemberDefinition '[DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr value);'
[Win32.Dpi]::SetProcessDpiAwarenessContext([IntPtr]::new(-4)) | Out-Null  # PER_MONITOR_AWARE_V2

# --- Resolve the plan file ---
if (-not $PlanPath) {
    $latest = Get-ChildItem (Join-Path $ProjectDir ".junie\plans\*.md") |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) { Write-Error "No plan found in .junie\plans\ and no -PlanPath given."; exit 1 }
    $PlanPath = $latest.FullName
}
$PlanPath = (Resolve-Path $PlanPath).Path
$planRel = [System.IO.Path]::GetRelativePath($ProjectDir, $PlanPath)

# --- Pre-flight checks ---
$branch = git -C $ProjectDir branch --show-current
if ($branch -ne $ExpectedBranch) {
    Write-Warning "Branch is '$branch', expected '$ExpectedBranch'."
    if (-not $Force) {
        $answer = Read-Host "Continue anyway? (y/N)"
        if ($answer -ne "y") { exit 1 }
    } else { Write-Warning "-Force given: continuing on '$branch'." }
}
$dirty = git -C $ProjectDir status --porcelain
if ($dirty) {
    Write-Warning "Working tree is not clean — Junie's diff will mix with these changes:"
    $dirty | ForEach-Object { "  $_" }
    if (-not $Force) {
        $answer = Read-Host "Continue anyway? (y/N)"
        if ($answer -ne "y") { exit 1 }
    } else { Write-Warning "-Force given: continuing with dirty tree." }
}

Write-Host "Project : $ProjectDir"
Write-Host "Branch  : $branch"
Write-Host "Plan    : $planRel"

# --- Guard: a stale junie update jam (crashed apply) corrupts junie.bat's control flow and
# WIPES ALL FILES in the launch directory (root-cause of the 2026-07-18 deletion incidents).
$staleJam = Join-Path $env:USERPROFILE ".local\share\junie\updates\pending-update.json.processing"
if (Test-Path $staleJam) {
    $age = (Get-Date) - (Get-Item $staleJam).LastWriteTime
    if ($age.TotalMinutes -gt 10) {
        Write-Warning "Removing stale junie update jam ($([int]$age.TotalHours)h old): $staleJam"
        Remove-Item $staleJam -Force
    } else {
        Write-Error "A junie update is being applied right now ($staleJam is fresh). Retry in a few minutes."
        exit 1
    }
}

# --- Build the prompt and a launcher file (nested wt->pwsh->junie.bat parsing mangles inline quotes) ---
$prompt = "Read the implementation plan at $planRel and implement every unchecked item, following its Ground rules exactly. " +
          "Work ONE item at a time, in order. Before your first code edit, set the plan Status block to IN PROGRESS. " +
          "After finishing EACH item, and BEFORE starting the next one, edit the plan file: strike through that item heading with a check mark, " +
          "tick it in the Progress overview, update the progress bar, and rewrite the Status block (Updated, Now, Handoff). " +
          "Never batch plan updates at the end. When every item is done and the self-check passes, set Status to FINISHED - READY FOR REVIEW. " +
          "Updating this plan file after every item is mandatory and overrides any guideline about not editing markdown files. " +
          "This plan file is the ONLY plan: do not use your own planning mode and do not create plan, requirements or task files (e.g. under .junie/plans); if the plan needs changing, set Status to BLOCKED and say why."

$launcher = Join-Path $env:TEMP "junie-launch.ps1"
@"
Set-Location '$ProjectDir'
# pwsh 7's PSModulePath breaks the Windows PowerShell that junie.bat calls internally
# (Get-FileHash vanishes -> every junie self-update fails checksum). Give children the 5.1 default.
`$env:PSModulePath = "`$env:USERPROFILE\Documents\WindowsPowerShell\Modules;`$env:ProgramFiles\WindowsPowerShell\Modules;`$env:windir\system32\WindowsPowerShell\v1.0\Modules"
& junie --project='$ProjectDir' --prompt='$prompt'
"@ | Set-Content -Path $launcher -Encoding UTF8

# --- Capture existing terminal windows so we can identify the new one ---
Add-Type -AssemblyName System.Windows.Forms
Add-Type -Namespace Win32 -Name Snap -MemberDefinition @"
[DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hAfter, int x, int y, int cx, int cy, uint flags);
[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
[DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
"@
$termProcs = "WindowsTerminal", "pwsh", "powershell", "conhost"
$before = @(Get-Process $termProcs -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { [int64]$_.MainWindowHandle })

# --- Launch ---
$wt = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wt) {
    Start-Process wt.exe -ArgumentList "-d `"$ProjectDir`" pwsh -NoExit -File `"$launcher`""
} else {
    Start-Process pwsh -WorkingDirectory $ProjectDir -ArgumentList "-NoExit", "-File", $launcher
}

# --- Root-file watchdog: root files have vanished during Junie sessions (culprit unknown).
# Logs any disappearance of top-level files + full process list to .claude\root-watch.log,
# complementing the Security-log 4663 audit events (which carry the deleting process name).
$watchScript = Join-Path $env:TEMP "junie-root-watch.ps1"
@'
param([string]$ProjectDir, [string]$LogPath)
$baseline = @(Get-ChildItem -LiteralPath $ProjectDir -File | ForEach-Object Name)
$hits = 0
for ($i = 0; $i -lt 180; $i++) {   # every 10s for 30 min
    Start-Sleep -Seconds 10
    $now = @(Get-ChildItem -LiteralPath $ProjectDir -File | ForEach-Object Name)
    $missing = @($baseline | Where-Object { $_ -notin $now })
    if ($missing.Count -gt 0) {
        $hits++
        $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Add-Content $LogPath "=== $ts — ROOT FILES MISSING: $($missing -join ', ')"
        Get-CimInstance Win32_Process | ForEach-Object {
            Add-Content $LogPath ("  [{0}] {1} :: {2}" -f $_.ProcessId, $_.Name, $_.CommandLine)
        }
        $baseline = $now
        if ($hits -ge 3) { break }
    }
}
'@ | Set-Content -Path $watchScript -Encoding UTF8
Start-Process pwsh -WindowStyle Hidden -ArgumentList "-NoProfile", "-File", "`"$watchScript`"",
    "-ProjectDir", "`"$ProjectDir`"", "-LogPath", "`"$(Join-Path $ProjectDir '.claude\root-watch.log')`""

# --- Find the new terminal window (poll up to 10s) ---
$hwnd = [IntPtr]::Zero
for ($i = 0; $i -lt 40 -and $hwnd -eq [IntPtr]::Zero; $i++) {
    Start-Sleep -Milliseconds 250
    $new = Get-Process $termProcs -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowHandle -ne 0 -and $before -notcontains [int64]$_.MainWindowHandle } |
        Select-Object -First 1
    if ($new) { $hwnd = $new.MainWindowHandle }
}

# --- Snap to bottom half of a portrait monitor (prefer the one the mouse is on) and bring to front ---
if ($hwnd -ne [IntPtr]::Zero) {
    $portraits = @([System.Windows.Forms.Screen]::AllScreens | Where-Object { $_.Bounds.Height -gt $_.Bounds.Width })
    $cursor = [System.Windows.Forms.Cursor]::Position
    $screen = $portraits | Where-Object { $_.Bounds.Contains($cursor) } | Select-Object -First 1
    if (-not $screen) { $screen = $portraits | Select-Object -First 1 }
    if (-not $screen) { $screen = [System.Windows.Forms.Screen]::PrimaryScreen }
    $wa = $screen.WorkingArea
    $h = [int]($wa.Height * $SnapFraction)
    [Win32.Snap]::ShowWindow($hwnd, 9) | Out-Null                                        # SW_RESTORE
    [Win32.Snap]::SetWindowPos($hwnd, [IntPtr]::Zero, $wa.X, ($wa.Y + $wa.Height - $h), $wa.Width, $h, 0x0040) | Out-Null  # SWP_SHOWWINDOW
    [Win32.Snap]::SetForegroundWindow($hwnd) | Out-Null
    Write-Host "Junie terminal snapped to the bottom $([int]($SnapFraction*100))% of $($screen.DeviceName)."
} else {
    Write-Warning "Terminal launched but its window could not be located for snapping."
}
Write-Host "Steer Junie there; return to Claude for diff review when done."
