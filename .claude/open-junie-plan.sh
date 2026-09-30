#!/bin/bash
set -euo pipefail

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAN_DIR="$PROJECT_DIR/docs/junie"
EXPECTED_BRANCH="master"
FORCE=false

# --- Parse arguments ---
PLAN_ARG=""
for arg in "$@"; do
    case "$arg" in
        -f|--force) FORCE=true ;;
        *)
            if [[ -z "$PLAN_ARG" ]]; then
                PLAN_ARG="$arg"
            fi
            ;;
    esac
done

# --- Pre-flight checks ---
for command_name in git junie osascript; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Error: Missing command: $command_name" >&2
        exit 1
    fi
done

if [[ ! -d "$PLAN_DIR" ]]; then
    echo "Error: Missing plan directory: $PLAN_DIR" >&2
    exit 1
fi

# --- Resolve the plan path ---
PLAN_PATH="$PLAN_ARG"
if [[ -z "$PLAN_PATH" ]]; then
    # Newest .md directly in PLAN_DIR (not in subfolders like done/)
    PLAN_PATH="$(
        find "$PLAN_DIR" \
            -maxdepth 1 \
            -type f \
            -name '*.md' \
            -print0 |
        xargs -0 stat -f '%m %N' 2>/dev/null |
        sort -nr |
        head -n 1 |
        cut -d' ' -f2-
    )"

    if [[ -z "$PLAN_PATH" ]]; then
        echo "Error: No plan found in $PLAN_DIR and no plan path given." >&2
        exit 1
    fi
elif [[ "$PLAN_PATH" != /* ]]; then
    PLAN_PATH="$PROJECT_DIR/$PLAN_PATH"
fi

# Normalize path
PLAN_PATH="$(cd "$(dirname "$PLAN_PATH")" && pwd)/$(basename "$PLAN_PATH")"

if [[ ! -f "$PLAN_PATH" ]]; then
    echo "Error: Plan does not exist: $PLAN_PATH" >&2
    exit 1
fi

# Validate location: must be directly in PLAN_DIR, not in done/
PLAN_DIR_REAL="$(cd "$PLAN_DIR" && pwd)"
PLAN_PARENT_REAL="$(cd "$(dirname "$PLAN_PATH")" && pwd)"

if [[ "$PLAN_PARENT_REAL" != "$PLAN_DIR_REAL" ]]; then
    echo "Error: Plan must be directly inside: $PLAN_DIR" >&2
    echo "Note: Plans in subdirectories (like 'done/') are not allowed." >&2
    exit 1
fi

PLAN_REL="${PLAN_PATH#"$PROJECT_DIR/"}"
BRANCH="$(git -C "$PROJECT_DIR" branch --show-current)"

# --- Print status ---
echo "Project : $PROJECT_DIR"
echo "Branch  : $BRANCH"
echo "Plan    : $PLAN_REL"

# --- Warnings ---
if [[ "$BRANCH" != "$EXPECTED_BRANCH" ]]; then
    echo "Warning: Branch is '$BRANCH', expected '$EXPECTED_BRANCH'." >&2
    if [[ "$FORCE" = false ]]; then
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "Warning: --force given; continuing on '$BRANCH'." >&2
    fi
fi

DIRTY="$(git -C "$PROJECT_DIR" status --porcelain)"
if [[ -n "$DIRTY" ]]; then
    echo "Warning: Working tree is not clean — Junie's diff will mix with these changes:" >&2
    echo "$DIRTY" | sed 's/^/  /' >&2
    if [[ "$FORCE" = false ]]; then
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "Warning: --force given; continuing with dirty tree." >&2
    fi
fi

# --- Build the prompt ---
# Reuse the .ps1 prompt verbatim, substituting only $planRel
PROMPT="Read the implementation plan at $PLAN_REL and implement every unchecked item, following its Ground rules exactly. Work ONE item at a time, in order. Before your first code edit, set the plan Status block to IN PROGRESS. After finishing EACH item, and BEFORE starting the next one, edit the plan file: strike through that item heading with a check mark, tick it in the Progress overview, update the progress bar, and rewrite the Status block (Updated, Now, Handoff). Never batch plan updates at the end. When every item is done and the self-check passes, set Status to FINISHED - READY FOR REVIEW. Updating this plan file after every item is mandatory and overrides any guideline about not editing markdown files. This plan file is the ONLY plan: do not use your own planning mode and do not create plan, requirements or task files (e.g. under .junie/plans); if the plan needs changing, set Status to BLOCKED and say why."

# --- Launch preparation ---
TMP_SCRIPT="$(mktemp "/tmp/junie-launch.XXXXXX.sh")"

printf '#!/bin/bash\n' > "$TMP_SCRIPT"
printf 'cd %q\n' "$PROJECT_DIR" >> "$TMP_SCRIPT"
printf 'exec junie --project=%q --prompt=%q\n' "$PROJECT_DIR" "$PROMPT" >> "$TMP_SCRIPT"
chmod +x "$TMP_SCRIPT"

escape_applescript() {
    printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

TMP_ESCAPED="$(escape_applescript "$TMP_SCRIPT")"

# --- Execute osascript to open terminal ---
if osascript -e 'id of application "iTerm2"' >/dev/null 2>&1; then
    echo "Opening Junie in iTerm2..."
    osascript >/dev/null <<EOF
tell application "iTerm2"
    activate
    create window with default profile command "/bin/bash \"$TMP_ESCAPED\""
end tell
EOF
else
    echo "iTerm2 not found; opening Terminal.app instead."
    osascript >/dev/null <<EOF
tell application "Terminal"
    activate
    do script "/bin/bash \"$TMP_ESCAPED\""
end tell
EOF
fi

# --- Cleanup ---
(
    sleep 60
    rm -f "$TMP_SCRIPT"
) >/dev/null 2>&1 &

echo "Junie launched. Return to Claude for diff review when Junie marks the plan FINISHED - READY FOR REVIEW."
