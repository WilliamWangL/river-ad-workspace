#!/usr/bin/env python3
"""
移除代码生成测试期望输出中的 @KeySequence 注解行。
DO 模板已改为 MySQL 风格，不再生成 @KeySequence。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # river-server/
TEST_RESOURCES = ROOT / "river-module-infra" / "src" / "test" / "resources" / "codegen"

ANNOTATION_RE = re.compile(
    r"^@KeySequence\([^)]*\)\s*//.*数据库的主键自增.*\n",
    re.MULTILINE,
)

files = list(TEST_RESOURCES.rglob("*DO"))
modified = []
for path in files:
    text = path.read_text(encoding="utf-8")
    new_text = ANNOTATION_RE.sub("", text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        modified.append(str(path.relative_to(ROOT)))

print(f"Modified {len(modified)} test fixtures:")
for p in modified:
    print(f"  - {p}")
