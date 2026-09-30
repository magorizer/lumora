# ImOK dev toolset — ActiveCollab (Lajos MCP) updates

<!--
Workflow version: 2.4.0 — 2026-09-19
Part of the ImOK dev toolset (coding-agent-workflow.md, info-and-testing.md, ac-workflow.md).
Project-agnostic. Copy this file as-is between projects; anything project-specific (AC project id,
which task carries the progress thread, company id) belongs in .claude/CLAUDE.md, never here.
Bump the version on every change and log it below. SemVer: MAJOR = a rule change that alters what
gets posted or how approval works, MINOR = additive guidance, PATCH = wording.

Changelog
- 2.4.0 (2026-09-19): **sign-in rule for the OAuth portal.** Lajos no longer mints login links (OAuth
  through the Cloudflare MCP portal since 2026-09-16), so the `login_url` + login-status polling
  flow and the LAN-only note are removed. On any sign-in need, the reply's first line is the
  client's sign-in link, then the flow STOPS until the user confirms they authorized. Same rule
  as the Lajos server guide (`resources/mcp/instructions.md`, `guide-short.md`).
- 2.3.1 (2026-09-17): named the ImOK dev toolset.
- 2.3.0 (2026-08-12): the **login-link rule** — on every not-logged-in error (including mid-session
  expiry) the reply STARTS with the fresh login link, bold on its own first line, before any other
  text or tool call.
- 2.2.0 (2026-08-12): adds the **house style for comments & discussions** (plain text, CAPS headings
  with colon, `*`/`<ul>` bullets, CAPS for inline emphasis — never `**bold**`) and the **callout
  restraint rule**: at most one callout per comment/discussion, only for what changes the reader's
  next action; zero is the normal case. Task descriptions keep their callout template unchanged.
- 2.1.0 (2026-08-12): the approval widget must show human-readable Markdown, never raw HTML source —
  Markdown → HTML conversion happens after approval, at post time. Adds the spacer-paragraph rule
  (`<p>&nbsp;</p>` in paragraph-flow bodies; `<p> </p>` is stripped by AC's cleaner).
- 2.0.0 (2026-08-12): generalised — the AC project id and the progress-thread task now live in
  .claude/CLAUDE.md. Adds the **Formatting** section: every MCP body renders as HTML, not Markdown,
  plus the spacing rule and the canonical task-description template (objective + Scope/Done-when
  callouts + Out of scope).
- 1.1.0 (2026-07-24): project-progress narrative goes to the Planning & Coordination task as one
  chronological thread (Barter Bridge = task #3).
- 1.0.0 (2026-07-24): initial spec — draft-then-approve gate before any AC write; match task language,
  non-technical, no overclaiming; session-start login handling.
-->

**ImOK dev toolset** · ActiveCollab updates · **Workflow version: 2.4.0** (bump on every change; keep
the changelog above in sync).

All ActiveCollab work goes through the **Lajos** MCP server (project.imok.biz). Never post via local
credentials or direct API calls. The AC project id, its company, and which task carries the progress
thread are recorded in `.claude/CLAUDE.md` — this spec names none of them.

## The golden rule — draft, show, approve, then post

**Never write to ActiveCollab (comment, task update, time record, status change, subtask, etc.)
without the user's explicit approval of the exact text first.**

1. Draft the full text of the comment/update — **in readable Markdown**, not HTML.
2. **Present it in an editable visual widget** (`mcp__visualize__show_widget`) — a textarea
   pre-filled with the draft plus a short "does this look good?" prompt, so the user can edit inline.
   Call `mcp__visualize__read_me` once before the first widget (silently — don't narrate it).
3. Ask the user to confirm or edit. Wait for an explicit go-ahead.
4. **Convert the approved Markdown to AC HTML** (per **Formatting** below) and post it with the
   appropriate Lajos tool. If the user edited the widget text, their version is the source.
5. Report back the task number and a link/confirmation.

**The widget shows Markdown, never HTML source.** The user is reviewing wording, tone and business
framing — not markup. A textarea full of escaped `&lt;p&gt;` tags is unreadable and defeats the
gate; it is a workflow failure, not a formatting preference. Keep the draft in `**bold**`, `-`
bullets and plain headings, and do the HTML conversion yourself after approval. Never ask the user
to proofread angle brackets.

This gate applies to **every mutating AC action**. Read-only calls (whoami, list, get) need no gate.

## Formatting — AC renders HTML, not Markdown

Applies to **every** MCP body field: comments (`add_comment`) **and** task descriptions
(`create_task` / `update_task`). Markdown syntax (`**bold**`, `` `code` ``, `-` bullets) shows up as
**literal characters** in the rendered output. Use HTML:

- `<strong>` / `<em>` for emphasis · `<code>` inline, `<pre>` for blocks
- `<ul><li>…</li></ul>` and `<ol><li>…</li></ol>` for lists
- `<a href="…">` for links · `<blockquote>` for quotes

**Spacing:** AC is in paragraph mode. A **blank line** (`\n\n`) between blocks becomes a phantom empty
bullet or empty paragraph — never use one. A **single** `\n` between block tags is correct and gives
clean spacing from the natural `<p>`/`<ul>` margins; fully tight (zero newlines) reads as cramped.
One newline per tag, no blank lines.

**Spacer paragraphs:** adjacent `<p>` tags render with no visual gap, so paragraph-flow bodies
(comments, discussions) need explicit spacers between blocks: `<p>&nbsp;</p>`. Use the entity — AC's
HTML cleaner **strips** `<p> </p>` with a regular space, so it silently does nothing. The
callout-based task-description template below is the exception: its callouts carry their own margins
and must have no spacers.

### House style for comments & discussions — plain by default

Modeled on the established progress-update style (e.g. Barter Bridge #3). Comments and discussions
are **plain**, not decorated:

- **Section headings in CAPS ending with a colon**, in their own `<p>`:
  `<p>WHAT WE FOUND:</p>`. No bold tags, no emoji headings.
- **Inline emphasis is CAPS too** — `ROUGHLY 48–70 HOURS`, `WITHOUT A SUBSCRIPTION`. Never
  `**bold**` (renders as literal asterisks) and not `<strong>` in comment bodies — CAPS is the
  house convention and survives every renderer.
- Bullets as `<ul><li>`; the heading's content starts directly under it (no spacer between a
  heading and its list/paragraph); `<p>&nbsp;</p>` spacer **between sections**.

**Callout restraint — a box is for the one thing the reader must not miss:**

- **At most ONE callout per comment or discussion**, and only for content that changes what the
  reader *does* next: the total cost, the decision needed, the deadline, the risk.
  If it doesn't change their next action, it isn't a callout.
- **Zero callouts is the normal case.** A progress update with no decision in it gets none.
- Never adjacent boxes, never one per section — if everything is highlighted, nothing is.
- **Type follows meaning:** `aside-info` = context/scope · `aside-success` = included at no cost,
  accepted, done · `aside-warning` = needs a decision, at risk, changes what was agreed ·
  `aside-danger` = broken or urgent only.
- **Task descriptions are the exception** — they keep the canonical template below, where the
  callouts are the structure of a form, not emphasis.

### Canonical task-description template

Use this structure for every task body:

1. **One short objective sentence** (1–2 short `<p>`; bold lead-ins allowed).
2. **Scope** — the work items, with `(~Xh total)` and per-item estimates when known.
3. **Done when** — clear acceptance criteria.
4. **Out of scope** — what is explicitly not included.

Rules that make it render correctly:

- **No empty spacer paragraphs anywhere** (no `<p> </p>`). The callout boxes carry their own margins;
  a heading paragraph rendering visually attached to the box below it is the intended tight look.
- Headings are plain bold with a colon, in their own `<p>`, **no emoji**, placed directly before their
  callout: `<p><strong>Scope:</strong></p>`, `<p><strong>Done when:</strong></p>`.
- **Scope** list goes in an **info** callout, **Done when** in a **success** (green) callout:
  ```html
  <aside class="callout-wrapper aside-info"><div class="callout-content"><ol><li>…</li></ol></div></aside>
  <aside class="callout-wrapper aside-success"><div class="callout-content"><ol><li>…</li></ol></div></aside>
  ```
- Lists inside callouts are numbered `<ol><li>`; a bold lead-in per item
  (`<strong>Feature</strong> — explanation`) suits feature tasks, plain items suit incident tasks.
- **Out of scope** is a plain `<p>`, no callout: `<p><strong>Out of scope:</strong> …</p>`.
- `<code>` for technical tokens. Strike through **completed** items only:
  `<span style="text-decoration: line-through">…</span>`.

## Where to post

- **Project-progress narrative → the project's Planning & Coordination task, as one chronological
  thread** (the task number is in `.claude/CLAUDE.md`). This keeps a single, followable activity log
  for the client/PM instead of updates scattered across feature tasks — especially since progress
  often spans several features at once.
- A task-specific "done"/technical confirmation may **also** go on its own feature task for
  traceability, but the running progress story stays on the Planning task.
- Match the day's update to the actual work window the user asks about (e.g. "everything since commit
  X at HH:MM") — read `git log` for that window so nothing is missed or overclaimed.

## Voice & content

- **Match the existing language of the task and its comments.** Read the task thread first and write in
  whatever language is already used there. Never switch a thread's language.
- **Non-technical.** Write for the client/PM, not for developers — describe outcomes and what the user
  will see, not file names, function names, or framework details.
- **Never overclaim.** Only report work that is actually done and verified. Distinguish done/verified
  from in-progress. Code that is written and deployed but not yet exercised end-to-end is
  **in progress**, not done — say so plainly (Romanian: "în lucru" / "urcat pe mediul de test, dar
  încă nu a fost validat"; reserve "funcțional" for what has been demonstrated working). Say plainly
  when screens still show sample data.
- Never call a defect a "bug" in client-facing text — frame it as a feature or an improvement.

## Session / connection handling

- Lajos is reached only through the Cloudflare MCP portal (`https://ac.imoks.dev/mcp`). Each
  person signs in with their own ActiveCollab account through their MCP client's OAuth flow;
  there is no LAN endpoint and Lajos cannot mint login links.
- **Call `ac_whoami` first.** Sign-in is needed when it is not `ok`, when any tool says
  "Not authenticated", or when the client reports that Lajos needs authentication or has
  disconnected — at the start of a session or in the middle of a task.
- **The sign-in rule — the link is the headline, then stop.**
  1. The reply's FIRST line is the sign-in link, on its own line, bold, with the pointing emoji,
     before any other text or tool call: `**👉 <link>**`. Never a footnote, never next to a
     tool call.
     - If the MCP client shows an authorization URL, use that exact URL.
     - Lajos as a connector in the Claude app or claude.ai:
       `👉 https://claude.ai/settings/connectors` → Lajos → Connect.
     - Claude Code: `👉 run /mcp → Lajos → Authenticate` in an interactive `claude` terminal;
       the browser opens the Cloudflare sign-in and the terminal prints the URL if it does not.
  2. **Stop the flow.** No more AC calls, no retries, no workarounds through other tools, and no
     further steps that depend on ActiveCollab. Say in one line what is paused.
  3. Wait until the user says they have authorized. Then call `ac_whoami` and resume only when
     it is `ok`. A sign-in done in another terminal may not reach the current session; if
     whoami still fails, show the link again.
  - Never ask for passwords, tokens, authorization codes or callback URLs in chat.
- **Call AC tools sequentially, never in parallel** — the server is single-threaded and one slow call
  blocks every user. Cheapest calls first. Avoid `company_time_report(allowSweep: true)` unless the
  user accepted the wait.
- Always refer to tasks by their **visible `#task_number`** (what shows as #9, #26 in the AC UI).
- Setting hours on an assignee needs a job type (`list_job_types`); ask the user which one when
  it is not obvious.

## Known quirks

- `update_time_record` (PUT) **resets `billable_status` when the field is omitted** — always pass
  `billable` explicitly on updates.
- Creating an estimate without a `jobTypeId` returns a 500. Use `list_job_types` to pick a valid one.
