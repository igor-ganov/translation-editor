#!/usr/bin/env bash
# Installs the APK on a running emulator, launches it, and proves the WebView
# actually rendered the application rather than a blank page or a crash.
#
# Everything here is deliberately assertive: a silent pass is what let a broken
# build reach a real phone, so each step either proves something or fails.
set -euo pipefail

APK="${1:?usage: android-smoke.sh <path-to-apk>}"
PACKAGE="dev.ganov.translationeditor"
ACTIVITY="${PACKAGE}/.MainActivity"

say() { printf '\n=== %s ===\n' "$1"; }

say "device"
adb wait-for-device
adb shell getprop ro.build.version.release
adb shell getprop ro.product.cpu.abi

say "install"
adb logcat -c || true
# -r replaces an existing install; a parse failure surfaces here with its reason.
adb install -r -d "$APK"

say "launch"
adb shell am start -W -n "$ACTIVITY"

say "wait for the process"
for _ in $(seq 1 30); do
  if adb shell pidof "$PACKAGE" >/dev/null 2>&1; then break; fi
  sleep 1
done
adb shell pidof "$PACKAGE" >/dev/null 2>&1 || { echo "the app is not running"; adb logcat -d | tail -80; exit 1; }

say "wait for the interface to render"
found=""
for _ in $(seq 1 45); do
  adb exec-out uiautomator dump /dev/tty > /tmp/ui.xml 2>/dev/null || true
  if grep -q "Import .docx" /tmp/ui.xml 2>/dev/null; then found="yes"; break; fi
  sleep 2
done

if [ -z "$found" ]; then
  echo "the application shell never appeared on screen"
  echo "--- last ui dump ---"; tail -c 2000 /tmp/ui.xml || true
  echo "--- logcat ---"; adb logcat -d | grep -iE "translationeditor|AndroidRuntime|chromium|FATAL" | tail -60
  exit 1
fi

say "crash check"
if adb logcat -d | grep -qE "FATAL EXCEPTION|E AndroidRuntime"; then
  echo "the app logged a fatal error"
  adb logcat -d | grep -A20 -E "FATAL EXCEPTION|E AndroidRuntime" | tail -60
  exit 1
fi

say "still alive after settling"
sleep 5
adb shell pidof "$PACKAGE" >/dev/null 2>&1 || { echo "the app died after starting"; adb logcat -d | tail -80; exit 1; }

echo
echo "the app installed, launched and rendered its interface"
