#!/usr/bin/env bash
# Prints the part of logcat that is about our app.
#
# A raw `logcat -d` on a Google-APIs image is thousands of lines of unrelated
# system chatter, which buries the one line that explains the failure — that is
# exactly what happened on the first CI run.
set -euo pipefail

PACKAGE="${1:?usage: android-diagnose.sh <package>}"

printf '\n--- crashes and errors ---\n'
adb logcat -d -v brief \
  | grep -aiE "FATAL EXCEPTION|AndroidRuntime|${PACKAGE}|Tauri|wry|chromium|WebView|linker|dlopen" \
  | grep -avE "tenor|MDD |abkp |datadownload" \
  | tail -60

printf '\n--- last words from the app process ---\n'
adb logcat -d -v brief --pid="$(adb shell pidof "$PACKAGE" 2>/dev/null | tr -d '\r')" 2>/dev/null | tail -30 || true
