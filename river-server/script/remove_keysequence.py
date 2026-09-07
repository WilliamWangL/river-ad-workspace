#!/usr/bin/env python3
"""
移除所有 DO 类上的 @KeySequence 注解及其 import。
迁移到 MySQL 8 后，主键使用 AUTO_INCREMENT，无需序列。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # river-server/

KEYSEQ_IMPORT_RE = re.compile(
    r"^import\s+com\.baomidou\.mybatisplus\.annotation\.KeySequence;\s*\n",
    re.MULTILINE,
)
KEYSEQ_ANNOTATION_RE = re.compile(
    r"^\s*@KeySequence\([^)]*\)(\s*//.*)?\s*\n",
    re.MULTILINE,
)

files = list(ROOT.rglob("*.java"))
modified = []
for path in files:
    text = path.read_text(encoding="utf-8")
    if "@KeySequence" not in text:
        continue
    new_text = KEYSEQ_IMPORT_RE.sub("", text)
    new_text = KEYSEQ_ANNOTATION_RE.sub("", new_text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        modified.append(str(path.relative_to(ROOT)))

print(f"Modified {len(modified)} files:")
for p in modified:
    print(f"  - {p}")
