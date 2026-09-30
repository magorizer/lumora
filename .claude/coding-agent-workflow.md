# ImOK dev toolset — the planner + coding-agent loop

<!--
Spec version: 3.4.0 — 2026-09-19
Part of the ImOK dev toolset (coding-agent-workflow.md, info-and-testing.md, ac-workflow.md).
Project-agnostic. Copy this file as-is between projects; anything project-specific (which coding
agent, launcher path, plans folder, id prefix, branch) belongs in .claude/CLAUDE.md, never here.
Bump the version on every change and log it below. SemVer: MAJOR = format/lifecycle change plans
must follow, MINOR = additive guidance, PATCH = wording.

Changelog
- 3.4.0 (2026-09-19): the plan file is the agent's ONLY plan — the launcher prompt forbids the
  agent's own planning mode and any self-made plan/requirements files (Junie wrote
  `.junie/plans/…` instead of updating the plan); plan changes go through `BLOCKED`.
- 3.3.0 (2026-09-17): named the ImOK dev toolset. Adds **Where Claude works** — always the
  user's checked-out working copy open in the IDE, never a Claude-managed worktree; branches stay
  under the user's control.
- 3.2.0 (2026-09-16): per-item checkpoints — every plan item ends with a checkpoint line, the ground
  rules forbid batching plan updates, and the launcher prompt must demand an update after EACH item
  (agents were updating the plan once at the end). One spec file per project: the old
  agent-specific workflow file is retired.
- 3.1.0 (2026-09-16): plans track ONLY coding-agent work — server/ops steps the user runs by hand
  never become plan items, progress lines or status; Claude hands them over in chat as ready-to-run
  commands. Information gathering never gets a plan: Claude gives the user read-only commands instead.
- 3.0.0 (2026-08-07): generalised from "the Junie loop" to any coding agent — agent name, launcher,
  plans folder and id prefix now live in .claude/CLAUDE.md. Adds the 🚦 Status block.
- 2.1.0 (2026-08-07): every plan carries a 🚦 Status block the coding agent keeps current, so the
  planner can tell in-progress from finished without reading the diff.
- 2.0.0 (2026-07-24): plan IDs + plans INDEX + done/ archive; the coding agent must `git add` every
  new file it creates.
- 1.0.0: initial documented planner→coder loop (plan .md in the plans folder, progress bar, ground rules).
-->

**ImOK dev toolset** · coding-agent loop · **Spec version: 3.4.0** (see the changelog comment above;
bump on every change).

Claude is the **planner and reviewer**; a **coding agent** writes the code. Claude never edits
source files directly. The agent in use, its launcher, the plans folder, the id prefix and the
expected branch are recorded in `.claude/CLAUDE.md` — this spec names none of them.

1. The user gives Claude the task.
2. Claude investigates the project.
3. Claude writes the implementation plan as a `.md` in the project's plans folder (see **Plan file
   conventions**), assigns it the next id, and adds a row to the plans `INDEX.md` if the project keeps one.
4. Claude launches the project's coding-agent launcher. From a non-interactive shell, run it as its
   own process so any DPI-awareness call works, and pass the plan path explicitly rather than relying
   on "most recently modified" — an untracked or freshly edited file will otherwise win.
5. A visible agent terminal opens where the user can watch and steer.
6. The user observes and steers the agent live.
7. The agent modifies files, visible immediately in the IDE — and **`git add`s any new files it
   creates** (see ground rules).
8. The agent keeps the plan's **🚦 Status block** current as it goes, and sets it to
   `FINISHED — READY FOR REVIEW` once every item is struck and the self-check passes. That string is
   how Claude knows the work is complete rather than paused.
9. The user returns to Claude for **diff review**: Claude verifies the plan's progress marks against
   the real diff, lints, and smoke-tests imports before any rebuild.
10. Once verified as implemented, Claude **moves the plan to the `done/` archive** and flips its
    INDEX row.

## Where Claude works

- **Always in the user's checked-out working copy** — the project directory open in the IDE
  (PhpStorm), on whatever branch the user has checked out there. Every read, edit, plan, document
  and deliverable lands in that directory, so the user sees it immediately in the IDE.
- **Never in a Claude-managed worktree** (`.claude/worktrees/…`), and never create a worktree or a
  branch on Claude's own initiative. If a session was started inside a worktree, work in the primary
  checkout anyway and leave nothing behind in the worktree.
- **The branch is the user's.** Claude does not switch, create, commit on or push branches unless
  asked. Check `git branch --show-current` before writing and say which branch a change landed on
  when it matters.
- Generated files that do not belong in the repo (probe scripts, renders, intermediate output) go to
  the session scratchpad; delete them or promote the reusable ones into `tools/`.

## What goes in a plan — and what never does

- **A plan contains only work the coding agent can do in the repo.** Ops the user runs by hand —
  deploys and file syncs, `.env` edits, service restarts, server/tunnel config, firewall rules,
  dashboard changes (Cloudflare, hosting panels, DNS) — are **never** plan items, progress-bar
  lines, phases or status entries. Claude gives them to the user **directly in chat** as
  ready-to-run command blocks (in the order they must run, with what to expect from each), after
  the diff review or whenever they are needed.
- **Never write a plan to gather information.** When a fact is missing (server state, logs, config
  values, what a request actually contains), Claude gives the user the **read-only commands** to
  run on the box and waits for the output — no plan, no diagnostic code change. Only if no command
  can answer the question does Claude propose temporary instrumentation, and it asks first.
- A plan is written once the code change is known.

**Verification belongs to Claude, not the agent** — see `info-and-testing.md`. Plans put test
commands in an "Acceptance (Claude verifies)" section, and the ground rules forbid the agent from
running browser or end-to-end tooling.

## Plan organization

Keep the folder scannable — a reader should see every plan, its id, and its status at a glance.

- **`INDEX.md`** in the plans folder is the single source of truth: an ID → title → file table,
  grouped by initiative, with an **🟢 Active** section on top and **✅ Done** sections below. It
  records the **next free id**. Update it whenever a plan is created or completed.
- **IDs:** every plan gets a stable, zero-padded, sequential id using the project's prefix, never
  reused. Reference plans by id in commits, chat, and cross-plan links.
- **Lifecycle folders:** active plans live directly in the plans folder; implemented-and-verified
  plans are archived under `done/`. Move related plans together so their cross-links stay valid.
- **New-plan filename:** `<PREFIX>-###-<short-slug>.md`. Legacy plans keep their old names; their
  ids live in INDEX.

## Plan file conventions

- **Header line** (first line under the `#` title): `**<ID> · <status> · YYYY-MM-DD**` where status is
  `active` | `done`. This makes the id/status visible inside the plan itself, not just in INDEX.
- Then `## 🚦 Status` — a block the **coding agent** rewrites as it works, so the planner can tell at
  a glance whether it is mid-flight, stuck, or done, without reading the diff. Exact shape:

  ```
  ## 🚦 Status

  **STATUS:** NOT STARTED
  **Updated:** —
  **Now:** —
  **Blocked:** —
  **Handoff:** —
  ```

  - `STATUS` is one of **`NOT STARTED`** · **`IN PROGRESS`** · **`BLOCKED`** · **`FINISHED — READY FOR REVIEW`**.
  - Set it to `IN PROGRESS` before the first edit; rewrite the block after **each** completed item.
  - `Updated` — `YYYY-MM-DD HH:MM` local, every time the block changes.
  - `Now` — the item number and a few words (`item 8 of 10 — multi-room pricing`), or `—` when finished.
  - `Blocked` — why work stopped and what decision is needed; `—` otherwise. Use `BLOCKED` rather than
    guessing when a plan is ambiguous or its instructions look wrong.
  - `Handoff` — one line for the reviewer: what changed, and what to look at first.
  - Only set `FINISHED — READY FOR REVIEW` when **every** item is struck through and the plan's
    self-check has passed.
  - The status is the agent's *claim*, not evidence — the planner still verifies the marks against
    the real diff.
- Then `## 📊 Progress overview` — one line per item grouped by phase, topped by a progress bar of
  filled/hollow parallelograms over 10 cells: `▰▰▰▱▱▱▱▱▱▱ NN% — done/total`. Avoid `█`/`░` block-shade
  chars — they render as a muddy texture in some IDE markdown previews.
  - Pending item: `- [ ] 4\. Item name`. Keep the `- ` bullet, and **escape the dot** (`4\.`); a plain
    `4.` after the list marker renders as a nested ordered list and breaks the layout.
  - Done item: `- ✅ ~~4\. Item name~~` — keep the leading `- ` (so it stays a list line, same format as
    pending), replace `[ ]` with the green ✅, and strike the text to match the body heading.
- Then `## ⚠️ Ground rules`: work in the primary repo dir on the expected branch, targeted edits only,
  explicit whitelist of editable files, and the standing rules below. Final self-check
  (`git diff --stat` + a linter/import test).
  - **Stage new files:** the agent must run `git add <path>` for **every** new file it creates so
    nothing is left untracked for the user to stage by hand. State this explicitly in each plan.
  - **No browser or end-to-end tooling.** The agent's verification stops at a linter and reading its
    own diff; Claude runs the tests.
  - **Update the plan after every item — never batched at the end.** Work one item at a time, in
    order; the plan edit (strike the heading, tick the overview, move the bar, rewrite 🚦 Status) is
    the last step of each item and happens before the next item's first code edit. This rule
    overrides any agent guideline about not editing markdown files.
  - Whitelist every editable/new file so the diff review is bounded.
  - Where a plan changes money, pricing, or anything guest-facing, say so in the ground rules and
    forbid invented fallbacks — values must come from real data or the offer is dropped.
- **Checkpoint line:** every item body ends with
  `> ⏸ Checkpoint — update this plan now (strike heading, tick overview, bar, 🚦 Status), then start item N+1.`
  (last item: `…, then run the self-check and set FINISHED — READY FOR REVIEW.`). Agents follow a
  stop sign placed in the item far more reliably than a rule stated once at the top.
- **Launcher prompt:** the plan file is the agent's **only** plan — no built-in planning mode, no
  self-made plan/requirements files; a plan that needs changing is reported via `BLOCKED`. The
  project's launcher must also tell the agent to work one item at a time, update
  the plan (including 🚦 Status) after each item before starting the next, never batch the updates,
  and treat that as overriding any "don't edit markdown" guideline.
- Body: numbered items with concrete specs. The plan instructs the agent to `~~strike through~~` each
  item as implemented and keep the overview and status block in sync — the plan doubles as the live
  progress tracker.

## Review round-trips

A plan does not have to be right first time. When the diff review finds problems, **append a
"Round N — corrections from the diff review" section** to the same plan with new numbered items,
raise the item total in the progress bar, and relaunch the agent on that plan. One plan per
change-set keeps the history readable; a new id is for a new problem, not a second attempt at the
same one.
