import { appVersion } from './app-version.js'

/**
 * Announces that the frontend actually ran.
 *
 * The document title is the one thing inside a WebView that Android exposes to
 * the outside: it becomes the accessibility name of the WebView node. Everything
 * else about this interface lives in shadow roots, which the accessibility tree
 * does not descend into, and console output does not reach logcat in a release
 * build — so without this there is no way to tell a working app from a live
 * process behind a blank window.
 */
export const markReady = (): void => {
  document.title = `Translation Editor ${appVersion} ready`
}
