#!/usr/bin/env bash
#
# Build the static artifact and mirror it to engel-wolf.com.
#
#   ./scripts/deploy.sh            # dry run — shows what WOULD change
#   ./scripts/deploy.sh --live     # actually uploads
#
# Credentials are read from an env file that is NOT part of this repo. By
# default it reuses the existing engel-wolf.com account already configured for
# the music_blog project:
#
#   ../music_blog/.env    FTP_IP  FTP_USER  FTP_PWD
#
# Override with MICROWAR_ENV_FILE=/path/to/.env if you keep them elsewhere.
#
# Note this repo deliberately does NOT use FTP_FOLDER from that file — that
# points at the music_blog document root. MicroWar has its own target, set
# below and overridable with MICROWAR_REMOTE_PATH.

set -euo pipefail

cd "$(dirname "$0")/.."

BASE_PATH="/documents/micro-war"
ENV_FILE="${MICROWAR_ENV_FILE:-../music_blog/.env}"
# The FTP login lands in "/", not in the docroot — the site lives under
# /domains/engel-wolf.com/public_html (see music_blog/wiki/Technical-Know-How.md).
REMOTE_PATH="${MICROWAR_REMOTE_PATH:-/domains/engel-wolf.com/public_html/documents/micro-war}"

LIVE=0
[[ "${1:-}" == "--live" ]] && LIVE=1

# ── Credentials ──────────────────────────────────────────────────────────────

# The env file is shared with other tooling and is not guaranteed to be valid
# shell (unquoted values with spaces, etc.), so it is parsed rather than
# sourced. Only the FTP_* keys are read, verbatim, everything after the first
# `=`; surrounding single or double quotes are stripped.
if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: env file not found: $ENV_FILE" >&2
  echo "       set MICROWAR_ENV_FILE to point at one containing FTP_IP/FTP_USER/FTP_PWD" >&2
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
  [[ "$line" == *=* ]] || continue
  key="${line%%=*}"
  key="${key//[[:space:]]/}"
  key="${key#export}"
  val="${line#*=}"
  case "$key" in
    FTP_IP|FTP_USER|FTP_PWD|FTP_FOLDER|FTP_PROTOCOL|FTP_SSL_ALLOW)
      if [[ "$val" == \"*\" || "$val" == \'*\' ]]; then
        val="${val:1:${#val}-2}"
      fi
      printf -v "$key" '%s' "$val"
      ;;
  esac
done < "$ENV_FILE"

# music_blog stores the host with an ftp:// prefix that ftplib/lftp do not want.
FTP_IP="${FTP_IP#*://}"
FTP_IP="${FTP_IP%%/*}"

missing=()
for var in FTP_IP FTP_USER FTP_PWD; do
  [[ -z "${!var:-}" ]] && missing+=("$var")
done
if (( ${#missing[@]} )); then
  echo "error: missing in $ENV_FILE: ${missing[*]}" >&2
  exit 1
fi

# ── Guard rails ──────────────────────────────────────────────────────────────
#
# `mirror --delete` removes remote files that are absent locally. Pointed at
# the wrong directory it would delete the rest of the website — and this
# account also serves music_blog. These checks make that very hard to do by
# accident.

if [[ "${REMOTE_PATH%/}" != *micro-war ]]; then
  echo "error: remote path must end in 'micro-war'. got: ${REMOTE_PATH}" >&2
  echo "       guard exists because --delete would wipe whatever is there." >&2
  exit 1
fi

if [[ -n "${FTP_FOLDER:-}" && "${REMOTE_PATH%/}" == "${FTP_FOLDER%/}" ]]; then
  echo "error: remote path equals FTP_FOLDER (the music_blog root). refusing." >&2
  exit 1
fi

depth=$(printf '%s' "${REMOTE_PATH#/}" | tr -cd '/' | wc -c | tr -d ' ')
if (( depth < 2 )); then
  echo "error: remote path looks too shallow: ${REMOTE_PATH}" >&2
  echo "       expected something like /domains/<site>/public_html/documents/micro-war" >&2
  exit 1
fi

command -v lftp >/dev/null 2>&1 || {
  echo "error: lftp not installed. run:  brew install lftp" >&2
  exit 1
}

# ── Build ────────────────────────────────────────────────────────────────────

echo "▸ building static export (basePath=${BASE_PATH})"
rm -rf out
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" npm run build

[[ -f out/index.html ]] || { echo "error: build produced no out/index.html" >&2; exit 1; }

# A subpath deploy fails silently if assets are not prefixed, and the symptom
# (unstyled page, no JS) is easily misdiagnosed as a server problem.
if grep -qo '"/_next/' out/index.html; then
  echo "error: out/index.html has unprefixed /_next asset URLs." >&2
  echo "       NEXT_PUBLIC_BASE_PATH did not reach the build." >&2
  exit 1
fi

echo "▸ built $(find out -type f | wc -l | tr -d ' ') files"

PROTOCOL="${FTP_PROTOCOL:-ftp}"   # ftp | ftps | sftp

# ── Upload ───────────────────────────────────────────────────────────────────

mirror_flags="-R --delete --verbose --parallel=4"
if (( LIVE == 0 )); then
  mirror_flags="$mirror_flags --dry-run"
  echo "▸ DRY RUN — nothing will be uploaded. re-run with --live to deploy."
else
  echo "▸ LIVE — mirroring out/ → ${FTP_IP}:${REMOTE_PATH}"
fi

# lftp reads its commands from stdin, so the credentials never appear in argv
# (`ps`) or shell history. Values are double-quoted for lftp's parser, with
# backslashes and quotes escaped, so passwords with spaces or symbols work.
lq() { local v=${1//\\/\\\\}; v=${v//\"/\\\"}; printf '"%s"' "$v"; }

# lftp echoes full URLs (user:password@host) in verbose and dry-run output, so
# everything it prints is passed through a redaction filter.
redact() { sed -E 's#://([^:/@]+):[^@]+@#://\1:***@#g'; }

lftp 2>&1 <<LFTP | redact
set cmd:fail-exit true
set ssl:verify-certificate no
# This host accepts TLS on the control channel (so the password is not sent
# in clear) but resets every TLS data connection, so data goes plain.
set ftp:ssl-allow ${FTP_SSL_ALLOW:-true}
set ftp:ssl-protect-data false
set ftp:ssl-protect-list false
# SIZE is refused by this host; mirror compares against listings instead.
set ftp:use-size false
set net:max-retries 2
set net:timeout 30
open -u $(lq "$FTP_USER"),$(lq "$FTP_PWD") ${PROTOCOL}://${FTP_IP}
mkdir -pf ${REMOTE_PATH}
mirror ${mirror_flags} out/ ${REMOTE_PATH}
bye
LFTP

if (( LIVE == 1 )); then
  echo "✓ deployed → https://engel-wolf.com${REMOTE_PATH#/domains/engel-wolf.com/public_html}/index.html"
else
  echo "✓ dry run complete"
fi
