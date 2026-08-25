import { Option, pipe } from 'effect'
import type { AppState } from '../ui/store/app-state.js'
import type { LogContext } from '../core/log/types.js'
import { appVersion } from './app-version.js'

/** Indexed by `Number(native)`, so naming the platform needs no branch. */
const PLATFORMS = ['browser', 'tauri'] as const

/**
 * The facts that make the entries beneath them mean anything: which build, which
 * platform, which provider, which document. These are precisely the questions
 * that otherwise get asked one at a time over chat.
 */
export const logContext = (state: AppState, native: boolean): LogContext => ({
  version: appVersion,
  platform: PLATFORMS[Number(native)] ?? 'browser',
  userAgent: navigator.userAgent,
  provider: state.settings.providerId,
  model: state.settings.model,
  languages: `${state.settings.defaultLanguages.from}>${state.settings.defaultLanguages.to}`,
  project: pipe(
    state.project,
    Option.map((project) => `${project.name} (${String(project.source.length)} blocks)`),
    Option.getOrElse(() => 'none open'),
  ),
})
