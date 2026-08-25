#!/usr/bin/env bash
# Aligns and signs a release APK so a phone will install it.
#
# All three signature schemes are enabled on purpose. v2/v3 alone are enough for
# Android 7 and later by the specification, but some OEM installers still refuse
# a package with no v1 (JAR) signature — and "There was a problem parsing the
# package" is all they say about it. v1 costs nothing, so it stays on.
set -euo pipefail

APK_IN="${1:?usage: sign-apk.sh <unsigned.apk> <output.apk> [keystore]}"
APK_OUT="${2:?usage: sign-apk.sh <unsigned.apk> <output.apk> [keystore]}"
KEYSTORE="${3:-$HOME/.android/debug.keystore}"
KS_PASS="${KS_PASS:-android}"
KEY_ALIAS="${KEY_ALIAS:-androiddebugkey}"

BUILD_TOOLS="$(find "${ANDROID_HOME:?ANDROID_HOME is not set}/build-tools" -maxdepth 1 -mindepth 1 -type d | sort -V | tail -1)"

# The Windows SDK ships apksigner as a .bat and zipalign as an .exe; on Linux and
# macOS both are extensionless. Pick whichever is actually present.
zipalign_bin="$BUILD_TOOLS/zipalign"
apksigner_bin="$BUILD_TOOLS/apksigner"
[ -x "$zipalign_bin" ] || zipalign_bin="$BUILD_TOOLS/zipalign.exe"
[ -x "$apksigner_bin" ] || apksigner_bin="$BUILD_TOOLS/apksigner.bat"

ALIGNED="$(mktemp -u).apk"

"$zipalign_bin" -p -f 4 "$APK_IN" "$ALIGNED"

"$apksigner_bin" sign \
  --ks "$KEYSTORE" \
  --ks-pass "pass:$KS_PASS" \
  --key-pass "pass:$KS_PASS" \
  --ks-key-alias "$KEY_ALIAS" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$APK_OUT" \
  "$ALIGNED"

rm -f "$ALIGNED"

"$apksigner_bin" verify --verbose "$APK_OUT" | grep -E "Verifies|scheme"
printf 'sha256: %s\n' "$(sha256sum "$APK_OUT" | cut -d' ' -f1)"
