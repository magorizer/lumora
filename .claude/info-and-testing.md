# ImOK dev toolset — how we gather information and test

<!--
Spec version: 1.0.1 — 2026-09-17
Part of the ImOK dev toolset (coding-agent-workflow.md, info-and-testing.md, ac-workflow.md).
Project-agnostic. Copy this file as-is between projects; anything project-specific (URLs, paths,
scripts, host quirks) belongs in .claude/CLAUDE.md, never here.
Bump the version on every change and log it below. SemVer: MAJOR = a rule that changes what Claude
is allowed to do, MINOR = additive guidance, PATCH = wording.

Changelog
- 1.0.1 (2026-09-17): named the ImOK dev toolset; where Claude works is defined in
  coding-agent-workflow.md (Where Claude works).
- 1.0.0 (2026-08-07): initial — go-and-look default, Playwright-first (always headed) for both
  information gathering and testing, SSH over uploads, read-vs-write rule, cached-auth handling,
  cache/WAF busting, script hygiene, Claude-owns-verification.
-->

**ImOK dev toolset** · information & testing · **Spec version: 1.0.1** (see the changelog comment
above; bump on every change).

This covers **both** halves of the same job: finding out how something behaves, and proving that a
change works. Same tools, same order, same rules.

## Always headed

Every Playwright run — investigation or test — launches **headed**, so the user can watch what is
happening and intervene. Never the Claude Browser or Claude-in-Chrome MCP tools; Playwright only.

## The default: go and look

Claude fetches the answer itself and runs the test itself. The user is asked only for what is
genuinely out of reach — credentials, uploads to hosts Claude cannot reach, physical deploys, and
business decisions. "Can you check X for me?" is a last resort, not an opener. Prefer running the
automated test over asking the user to click through a dashboard.

## Preferred order

1. **Playwright** against the dev or prod site — rendered pages, admin screens, REST responses,
   console/network traffic, screenshots, full funnel runs.
2. **CLI commands on the dev/prod server over SSH** when that is the shorter path — tailing and
   grepping logs, framework CLIs, inspecting files, `curl` from the box itself.
3. **Local repo reads** — code, docs, captured API samples.
4. **Asking the user.**

Steps 1 and 2 are peers, not a strict hierarchy. A public endpoint answered by `curl` beats booting
a browser; anything behind a login or needing a rendered DOM belongs to Playwright.

## SSH beats uploading anything

Never put a file on a live server to answer a question a shell command can answer. Uploading a
one-shot script is the **fallback for hosts with no shell access** — and it must be admin-gated,
PII-free, refuse to write when its own sanity checks fail, and be deleted from the server
immediately after use. Record which hosts have a shell, and which don't, in `.claude/CLAUDE.md`.

## Read-only freely; write commands get a warning first

Read-only commands — `tail`, `grep`, `cat`, `ls`, a config read, a `GET` — just run.

Anything that **mutates state** — DB writes, file edits, deletions, cache or config changes,
submitting to an external API — stops first and tells the user, in plain terms:

- exactly what will change,
- what cannot be undone,
- what it costs if the assumption behind it is wrong,

then waits for an explicit go-ahead. Where possible, offer a **dry run that prints the intended
change** and have the user confirm from that output rather than from a description.

## Credentials never pass through Claude

Playwright reuses a gitignored `storageState` per host. When it is missing or stale the script
opens a headed window and waits for the user to log in, then saves the session for next time.
Any other secrets come from a gitignored `.env` loaded by the test helpers — never read or print
its values.

## Caches and WAFs lie

Before concluding anything from a response, rule out the edge:

- Append a unique query string (`?cb=$RANDOM`) — CDNs and page caches will happily serve a cached
  404 for a file that now exists, including to a logged-in browser.
- Compare against a deliberately non-existent path in the same directory. A `403` on your file
  next to a `404` on a made-up name means the file is there and something is answering for it —
  which may simply be your own script's auth gate.
- An unexplained `406` is usually ModSecurity, not the application.

**And so does your own tooling.** Before blaming the edge, confirm the request went where you think:
which origin, which stored session, which cookies actually apply. A helper that derives its session
file or login check from an env-var default rather than from the target URL will happily prove you
are logged in to one site while requesting another — an authentic 403 that looks exactly like a
cache problem. Tools should print the origin and session file they chose, and on an unexpected
auth failure dump the cookie **names** (never values) the context considered applicable.

## Script hygiene

Throwaway probes and specs are deleted once they have served their purpose. Anything reusable is
promoted into the project's tools directory with a usage comment at the top.

On Windows, Git Bash rewrites a leading `/` into a Windows path — pass **full URLs** to CLI tools,
not bare paths.

## Verification is Claude's job, not the coding agent's

The coding agent writes code; Claude runs every browser check, E2E script and screenshot. Plans put
test commands in an **"Acceptance (Claude verifies)"** section and state in the ground rules that
the coding agent must not run Playwright or anything in the tools directory — its own verification
stops at a linter and reading its diff.

After the coding agent finishes: review the diff against the plan, correct the progress marks
against what the code actually does, lint, and only then run the functional test.
