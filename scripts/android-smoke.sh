#!/usr/bin/env bash
# Installs the APK on a running emulator, launches it, and proves the WebView
# actually rendered the application rather than a blank page or a crash.
#
# Everything here is deliberately assertive: a silent pass is what let a broken
# build reach a real phone, so each step either proves something or fails.
set -euo pipefail

APK="${1:?usage: android-smoke.sh <path-to-apk>}"

say() { printf '\n=== %s ===\n' "$1"; }

BUILD_TOOLS="$(find "${ANDROID_HOME:?ANDROID_HOME is not set}/build-tools" -maxdepth 1 -mindepth 1 -type d | sort -V | tail -1)"
AAPT="$BUILD_TOOLS/aapt2"

# Read the identity out of the package rather than assuming it: a debug build
# carries an application id suffix, so a hardcoded release name does not exist
# on the device and `am start` fails with a misleading "class does not exist".
BADGING="$("$AAPT" dump badging "$APK")"
PACKAGE="$(printf '%s' "$BADGING" | sed -n "s/^package: name='\([^']*\)'.*/\1/p")"
LAUNCHER="$(printf '%s' "$BADGING" | sed -n "s/^launchable-activity: name='\([^']*\)'.*/\1/p")"
ABIS="$(printf '%s' "$BADGING" | sed -n "s/^native-code: //p")"
: "${PACKAGE:?could not read the package name from the APK}"
: "${LAUNCHER:?could not read the launcher activity from the APK}"

say "package under test"
printf 'package:  %s\nactivity: %s\nabi:      %s\n' "$PACKAGE" "$LAUNCHER" "${ABIS:-none declared}"

say "device"
adb wait-for-device
printf 'android:  %s\nabi:      %s\n' "$(adb shell getprop ro.build.version.release | tr -d '\r')" \
  "$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"

say "install"
adb logcat -c || true
# A malformed package fails here, with the installer's own reason rather than
# the "problem parsing the package" a phone shows its user.
adb install -r -d "$APK"

say "launch"
adb shell am start -W -n "$PACKAGE/$LAUNCHER"

say "wait for the process"
for _ in $(seq 1 30); do
  adb shell pidof "$PACKAGE" >/dev/null 2>&1 && break
  sleep 1
done
adb shell pidof "$PACKAGE" >/dev/null 2>&1 || { echo "the app is not running"; bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"; exit 1; }

say "wait for the interface to render"
found=""
for _ in $(seq 1 45); do
  adb exec-out uiautomator dump /dev/tty > /tmp/ui.xml 2>/dev/null || true
  grep -q "Import .docx" /tmp/ui.xml 2>/dev/null && { found="yes"; break; }
  sleep 2
done

if [ -z "$found" ]; then
  # A Tauri app that fails to load its frontend still has a live process and a
  # blank window, so the view hierarchy is the only honest proof it came up.
  echo "the application shell never appeared on screen"
  echo "--- last view hierarchy ---"; tail -c 2000 /tmp/ui.xml || true
  bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"
  exit 1
fi

say "crash check"
if adb logcat -d | grep -qE "FATAL EXCEPTION|E AndroidRuntime"; then
  echo "the app logged a fatal error"
  bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"
  exit 1
fi

say "still alive after settling"
sleep 5
adb shell pidof "$PACKAGE" >/dev/null 2>&1 || { echo "the app died after starting"; bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"; exit 1; }

printf '\nthe app installed, launched and rendered its interface\n'
