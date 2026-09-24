# Agent capture verification (Step 4)

## 1. Tool and model

- **Tool:** Cursor (Agent)
- **Model:** Grok 4.6 (`cursor-grok-4.6-medium` in session frontmatter)

## 2. Hook mechanism and config

Capture is automatic. Cursor runs `.cursor/hooks.json` on `sessionStart`, `beforeSubmitPrompt`, and `afterAgentResponse`. Each event invokes `capture.py` with Python 3.14 (`python.exe`), not a wrapper around the session.

Config file: `.cursor/hooks.json`

The script is `.cursor/hooks/capture.py`. `.cursor/hooks/capture.cmd` still exists but is not what `hooks.json` calls; hooks now run `python.exe` on `capture.py` so stdin is not re-encoded by `cmd.exe`.

## 3. Log path

`.agent-logs/` (repo root: `D:\8x-fathom-clone\.agent-logs\`)

Index: `.agent-logs/.session-index.json`

## 4. Both canary entries (verbatim from logs)

### Canary 1 — session `6ccc8ae3-c3d5-45d1-8366-ec2c10764cd3`

File: `.agent-logs/2026-09-24_20-30-13_6ccc8ae3-c3d5-45d1-8366-ec2c10764cd3.md`

Prompt as stored:

~~~~
CAPTURE TEST â€“ 8x assignment, Anish Kumar
~~~~

Response as stored (second `RESPONSE num=1` in that file):

~~~~
This canary **prompt is in the log**.

File: `.agent-logs/2026-09-24_20-30-13_6ccc8ae3-c3d5-45d1-8366-ec2c10764cd3.md`

It contains, verbatim as Cursor handed it to the hook:

```
CAPTURE TEST Ã¢â‚¬â€œ 8x assignment, Anish Kumar
```

The en-dash was mojibaked by the `.cmd` wrapper (`â€“` â†’ `Ã¢â‚¬â€œ`). I did not tidy that entry. Hooks now call `python.exe` directly so later turns should keep Unicode intact. This reply should append as `RESPONSE num=1` when the turn ends.

There is also an earlier response-only entry from the failed BOM canary. Left as-is.

**Next:** open a **new** Agent chat in this repo and send:

`CAPTURE TEST 2 â€“ 8x assignment, Anish Kumar`

After that lands, I will write `CAPTURE-TEST.md`. Still no assignment work.
~~~~

### Canary 2 — session `2382b09e-413d-4358-bb7b-c2a77063ccca`

File: `.agent-logs/2026-09-24_20-35-17_2382b09e-413d-4358-bb7b-c2a77063ccca.md`

Prompt as stored:

```
CAPTURE TEST 2 â€“ 8x assignment, Anish Kumar
```

Response as stored:

```
CAPTURE TEST 2 received for the 8x assignment (Anish Kumar).

Prompt and this reply should be logged automatically by the `beforeSubmitPrompt` and `afterAgentResponse` hooks. Nothing extra was wrapped around this session.
```

A third file, `.agent-logs/2026-09-24_20-32-36_adf3e937-23a1-4fc7-836a-9b161f9c5fce.md`, also contains the TEST 2 prompt only (no response). It is left as written.

## 5. Windows UTF-8 BOM issue and the fix

On Windows, Cursor prefixed the hook stdin JSON with a UTF-8 BOM (`EF BB BF`). Decoding as plain `utf-8` and calling `json.loads` raised `JSONDecodeError`, so `beforeSubmitPrompt` never wrote the first canary. That failure was recorded in `.cursor/hooks/last-error.txt`. The first hook run therefore produced a response-only log later, with no matching prompt.

**Fix in `capture.py`:** read stdin as bytes and decode with `utf-8-sig` (strips a leading BOM), then `lstrip("\ufeff")` before `json.loads`.

**Related:** routing through `.cmd` mojibaked the en-dash. `hooks.json` now calls `python.exe .cursor/hooks/capture.py` directly.

## 6. Confirmation

Both intended canary sessions were captured by the hooks, not invented after the fact:

| Canary | Session | Prompt | Response |
| --- | --- | --- | --- |
| `CAPTURE TEST – 8x assignment, Anish Kumar` | `6ccc8ae3-…` | yes | yes |
| `CAPTURE TEST 2 – 8x assignment, Anish Kumar` | `2382b09e-…` | yes | yes |

No assignment or product work was started in this step.
