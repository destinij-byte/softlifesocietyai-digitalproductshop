#!/usr/bin/env python3
"""Deploy web/dist/ (the Vault's Vite build) to a cPanel document root over
FTPS, using only the Python standard library - no lftp or other tool needed.

Usage:
    cd web
    npm run build
    FTP_HOST=softlifesocietyai.com \
    FTP_USER=vault@softlifesocietyai.com \
    FTP_PASSWORD='...' \
    FTP_REMOTE_DIR=/ \
    python3 scripts/deploy_ftp.py [--delete] [--dry-run]

Credentials are read from environment variables only - never hardcode them
here, and never commit them.

Env vars:
    FTP_HOST          required
    FTP_USER          required
    FTP_PASSWORD      required
    FTP_REMOTE_DIR    remote directory to upload into (default: "/")
    FTP_PORT          default 21
    FTP_USE_TLS       "false" to use plain FTP instead of FTPS (default true)

Flags:
    --delete    also remove remote files/dirs that no longer exist locally
                (off by default - without it, this only adds/overwrites)
    --dry-run   print what would happen without changing anything remote
"""
import argparse
import ftplib
import os
import sys
from pathlib import Path

LOCAL_DIST = Path(__file__).resolve().parent.parent / "dist"


def connect() -> ftplib.FTP:
    host = os.environ.get("FTP_HOST")
    user = os.environ.get("FTP_USER")
    password = os.environ.get("FTP_PASSWORD")
    if not host or not user or not password:
        print("FTP_HOST, FTP_USER, and FTP_PASSWORD are all required.", file=sys.stderr)
        sys.exit(1)

    port = int(os.environ.get("FTP_PORT", "21"))
    use_tls = os.environ.get("FTP_USE_TLS", "true").lower() != "false"

    ftp_cls = ftplib.FTP_TLS if use_tls else ftplib.FTP
    ftp = ftp_cls()
    ftp.connect(host, port)
    ftp.login(user, password)
    if use_tls:
        ftp.prot_p()  # secure the data channel too, not just the login
    return ftp


def ensure_remote_dir(ftp: ftplib.FTP, remote_dir: str, dry_run: bool) -> None:
    parts = [p for p in remote_dir.split("/") if p]
    path = ""
    for part in parts:
        path += "/" + part
        try:
            ftp.mkd(path)
        except ftplib.error_perm:
            pass  # already exists
        if dry_run:
            continue


def remote_listing(ftp: ftplib.FTP, remote_dir: str) -> dict[str, bool]:
    """Returns {relative_path: is_dir} for everything under remote_dir."""
    entries: dict[str, bool] = {}

    def walk(current: str, prefix: str) -> None:
        try:
            names = ftp.nlst(current)
        except ftplib.error_perm:
            return
        for full_name in names:
            name = full_name.rsplit("/", 1)[-1]
            if name in (".", ".."):
                continue
            rel = f"{prefix}{name}"
            child_path = f"{current}/{name}"
            try:
                ftp.cwd(child_path)
                ftp.cwd(current)
                entries[rel] = True
                walk(child_path, rel + "/")
            except ftplib.error_perm:
                entries[rel] = False

    walk(remote_dir.rstrip("/") or "/", "")
    return entries


def upload_file(ftp: ftplib.FTP, local_path: Path, remote_path: str, dry_run: bool) -> None:
    print(f"  upload  {local_path.relative_to(LOCAL_DIST)} -> {remote_path}")
    if dry_run:
        return
    with open(local_path, "rb") as f:
        ftp.storbinary(f"STOR {remote_path}", f)


def deploy(remote_dir: str, delete: bool, dry_run: bool) -> None:
    if not LOCAL_DIST.is_dir():
        print(f"{LOCAL_DIST} doesn't exist - run `npm run build` first.", file=sys.stderr)
        sys.exit(1)

    ftp = connect()
    try:
        remote_dir = "/" + remote_dir.strip("/") if remote_dir.strip("/") else "/"

        local_files = {
            str(p.relative_to(LOCAL_DIST)): p.is_dir()
            for p in LOCAL_DIST.rglob("*")
        }

        # Create directories first (parents before children, guaranteed by sort).
        for rel, is_dir in sorted(local_files.items()):
            if is_dir:
                ensure_remote_dir(ftp, f"{remote_dir.rstrip('/')}/{rel}", dry_run)

        for rel, is_dir in sorted(local_files.items()):
            if not is_dir:
                remote_path = f"{remote_dir.rstrip('/')}/{rel}"
                upload_file(ftp, LOCAL_DIST / rel, remote_path, dry_run)

        if delete:
            remote_files = remote_listing(ftp, remote_dir)
            stale = [rel for rel in remote_files if rel not in local_files]
            for rel in sorted(stale, reverse=True):  # children before parents
                remote_path = f"{remote_dir.rstrip('/')}/{rel}"
                is_dir = remote_files[rel]
                print(f"  delete  {remote_path}")
                if dry_run:
                    continue
                if is_dir:
                    ftp.rmd(remote_path)
                else:
                    ftp.delete(remote_path)

        print("Done." if not dry_run else "Dry run complete - nothing was changed.")
    finally:
        ftp.quit()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--delete", action="store_true", help="remove remote files not present locally")
    parser.add_argument("--dry-run", action="store_true", help="preview without changing anything")
    args = parser.parse_args()

    remote_dir = os.environ.get("FTP_REMOTE_DIR", "/")
    deploy(remote_dir, delete=args.delete, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
