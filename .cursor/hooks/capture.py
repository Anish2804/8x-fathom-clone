#!/usr/bin/env python3
"""Append prompt/response pairs to .agent-logs/ for the 8x assignment."""

from __future__ import annotations

import json
import os
import re
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

PROJECT = "8x-fathom-clone"
TOOL = "cursor"
AUTHOR = os.environ.get("AGENT_LOG_AUTHOR", "Anish-Kumar")
DEFAULT_MODEL = "Cursor Grok 4.6"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_ms(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{int(dt.microsecond / 1000):03d}Z"


def read_stdin() -> dict:
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return {}
    text = raw.decode("utf-8-sig", errors="replace").lstrip("\ufeff").strip()
    if not text:
        return {}
    return json.loads(text)


def repo_root() -> Path:
    here = Path(__file__).resolve()
    return here.parents[2]


def logs_dir() -> Path:
    path = repo_root() / ".agent-logs"
    path.mkdir(parents=True, exist_ok=True)
    return path


def index_path() -> Path:
    return logs_dir() / ".session-index.json"


def load_index() -> dict:
    path = index_path()
    if not path.exists():
        return {"conversations": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"conversations": {}}


def save_index(index: dict) -> None:
    path = index_path()
    path.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8", newline="\n")


def short_id(session_id: str) -> str:
    return session_id.replace("-", "")[:8]


def model_name(payload: dict) -> str:
    value = payload.get("model")
    if not value or value == "default":
        return DEFAULT_MODEL
    return str(value)


def session_id_from(payload: dict) -> str:
    for key in ("conversation_id", "session_id"):
        value = payload.get(key)
        if value:
            return str(value)
    return "unknown-session"


def record_error(exc: BaseException) -> None:
    path = Path(__file__).resolve().parent / "last-error.txt"
    path.write_text(
        f"{utc_now().isoformat()}\n{''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))}",
        encoding="utf-8",
        newline="\n",
    )


def ensure_session(payload: dict, now: datetime) -> Path:
    index = load_index()
    conversations = index.setdefault("conversations", {})
    sid = session_id_from(payload)
    existing = conversations.get(sid)
    if existing:
        path = logs_dir() / existing["file"]
        if path.exists():
            return path
    stamp = now.strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{stamp}_{sid}.md"
    path = logs_dir() / filename
    conversations[sid] = {
        "file": filename,
        "created": iso_ms(now),
    }
    save_index(index)
    if not path.exists():
        write_new_session(path, sid, now, model_name(payload))
    return path


def write_new_session(path: Path, sid: str, now: datetime, model: str) -> None:
    ts = iso_ms(now)
    date = now.strftime("%Y-%m-%d")
    body = f"""---
session_id: {sid}
date: {date}
author: {AUTHOR}
model: {model}
tool: {TOOL}
project: {PROJECT}
total_exchanges: 0
first_prompt_time: {ts}
last_prompt_time: {ts}
---

# Session Log - {date}

Session: `{short_id(sid)}` | Project: `{PROJECT}` | Author: `{AUTHOR}`

---
"""
    path.write_text(body, encoding="utf-8", newline="\n")


FRONT_RE = re.compile(r"^---\r?\n(?P<fm>.*?)\r?\n---\r?\n", re.S)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    match = FRONT_RE.match(text)
    if not match:
        return {}, text
    meta: dict[str, str] = {}
    for line in match.group("fm").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()
    return meta, text[match.end() :]


def dump_frontmatter(meta: dict) -> str:
    order = [
        "session_id",
        "date",
        "author",
        "model",
        "tool",
        "project",
        "total_exchanges",
        "first_prompt_time",
        "last_prompt_time",
    ]
    lines = ["---"]
    seen = set()
    for key in order:
        if key in meta:
            lines.append(f"{key}: {meta[key]}")
            seen.add(key)
    for key, value in meta.items():
        if key not in seen:
            lines.append(f"{key}: {value}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def next_prompt_num(body: str) -> int:
    nums = [int(n) for n in re.findall(r"\[LOG_ENTRY type=PROMPT num=(\d+)", body)]
    return (max(nums) + 1) if nums else 1


def last_prompt_num(body: str) -> int:
    nums = [int(n) for n in re.findall(r"\[LOG_ENTRY type=PROMPT num=(\d+)", body)]
    return nums[-1] if nums else 1


def append_entry(path: Path, payload: dict, event: str, now: datetime) -> None:
    text = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)
    sid = meta.get("session_id") or session_id_from(payload)
    model = model_name(payload)
    ts = iso_ms(now)
    meta.setdefault("session_id", sid)
    meta.setdefault("date", now.strftime("%Y-%m-%d"))
    meta.setdefault("author", AUTHOR)
    meta["model"] = model
    meta.setdefault("tool", TOOL)
    meta.setdefault("project", PROJECT)
    meta.setdefault("first_prompt_time", ts)
    meta["last_prompt_time"] = ts

    if event == "beforeSubmitPrompt":
        num = next_prompt_num(body)
        meta["total_exchanges"] = str(num)
        content = payload.get("prompt") or ""
        entry = (
            f"\n[LOG_ENTRY type=PROMPT num={num} session={short_id(sid)}]\n"
            f"timestamp: {ts}\n"
            f"model: {model}\n"
            f"\n{content}\n"
        )
    elif event == "afterAgentResponse":
        num = last_prompt_num(body)
        content = payload.get("text") or ""
        entry = (
            f"\n[LOG_ENTRY type=RESPONSE num={num} session={short_id(sid)}]\n"
            f"timestamp: {ts}\n"
            f"model: {model}\n"
            f"\n{content}\n"
        )
    else:
        return

    updated = dump_frontmatter(meta) + body.rstrip() + "\n" + entry
    path.write_text(updated, encoding="utf-8", newline="\n")


def respond(event: str) -> None:
    if event == "beforeSubmitPrompt":
        sys.stdout.write(json.dumps({"continue": True}))
    else:
        sys.stdout.write("{}")


def main() -> int:
    try:
        payload = read_stdin()
    except json.JSONDecodeError as exc:
        record_error(exc)
        sys.stdout.write(json.dumps({"continue": True}))
        return 0

    event = str(payload.get("hook_event_name") or "")
    now = utc_now()
    try:
        path = ensure_session(payload, now)
        if event in {"beforeSubmitPrompt", "afterAgentResponse"}:
            append_entry(path, payload, event, now)
    except Exception as exc:
        record_error(exc)
        respond(event)
        return 0

    respond(event)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
