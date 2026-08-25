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

say "wait for a WebView to be on screen"
webview=""
for _ in $(seq 1 30); do
  adb exec-out uiautomator dump /dev/tty > /tmp/ui.xml 2>/dev/null || true
  grep -q "android.webkit.WebView" /tmp/ui.xml 2>/dev/null && { webview="yes"; break; }
  sleep 2
done
[ -n "$webview" ] || { echo "no WebView was ever attached"; bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"; exit 1; }

say "wait for the frontend to report itself ready"
# A WebView on screen only proves the native shell came up. The interface itself
# lives in shadow roots, which the accessibility tree does not descend into, and
# console output does not reach logcat in a release build — so the app sets its
# document title on boot, which Android surfaces as the WebView's accessibility
# name. That title is the only honest evidence the frontend ran.
ready=""
for _ in $(seq 1 45); do
  adb exec-out uiautomator dump /dev/tty > /tmp/ui.xml 2>/dev/null || true
  grep -q "Translation Editor .* ready" /tmp/ui.xml 2>/dev/null && { ready="yes"; break; }
  sleep 2
done

if [ -z "$ready" ]; then
  echo "the frontend never reported itself ready"
  echo "--- what the WebView node says instead ---"
  grep -o 'class="android.webkit.WebView"[^/]*text="[^"]*"' /tmp/ui.xml 2>/dev/null | head -3 \
    || grep -o 'text="[^"]*"' /tmp/ui.xml 2>/dev/null | head -10 \
    || echo "(no view hierarchy was captured)"
  bash "$(dirname "$0")/android-diagnose.sh" "$PACKAGE"
  exit 1
fi

say "the title the app set"
grep -o 'text="Translation Editor [^"]*"' /tmp/ui.xml | head -1

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
