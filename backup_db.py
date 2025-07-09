#!/usr/bin/env python3
"""Nightly backup utility for Madani Maktab SQLite database.

This script copies the active SQLite database file (resolved from the
DATABASE_FILE environment variable or the default *madani_moktob.db*) to a
`backups/` folder alongside the project, appending the current date (YYYY-MM-DD)
so you retain a rolling history.  Run it via cron:

    0 2 * * * /usr/bin/python3 /path/to/project/backup_db.py
"""

from __future__ import annotations

import os
import shutil
from datetime import datetime
from pathlib import Path

DEFAULT_DB_FILE = "madani_moktob.db"


def main() -> None:
    db_file = Path(os.getenv("DATABASE_FILE", DEFAULT_DB_FILE)).expanduser()
    if not db_file.exists():
        raise SystemExit(f"Database file not found: {db_file}")

    backup_dir = Path("backups")
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d")
    backup_name = f"{db_file.stem}_{timestamp}{db_file.suffix}"
    dst = backup_dir / backup_name

    # If we already have a backup for today, skip to avoid redundant copies.
    if dst.exists():
        print(f"Backup already exists for today: {dst}")
        return

    shutil.copy2(db_file, dst)
    print(f"✅ Database backed up to {dst}")


if __name__ == "__main__":
    main()