/**
 * Recording Consent Dialog - Shown when Seer starts recording
 */

import type { RecordingConsentDialogProps } from '../types';

export function RecordingConsentDialog({
  isOpen,
  seerName,
  onConsent,
  onDecline,
  onLeave,
}: RecordingConsentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Recording Starting</h2>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <p className="text-slate-600">
            The Seer (<span className="font-medium">{seerName}</span>) has started recording this
            session.
          </p>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Recording will include:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                All audio from participants
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Video feeds (if enabled)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Screen shares
              </li>
            </ul>
          </div>

          <p className="text-sm text-slate-500">
            The recording will be available to the Seer after the session for recap and highlight
            creation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConsent}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 font-medium text-white hover:bg-green-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            I Consent
          </button>

          <button
            onClick={onDecline}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            Decline & Mute
          </button>

          <button
            onClick={onLeave}
            className="mt-2 w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Leave Session
          </button>
        </div>

        {/* Note */}
        <p className="mt-4 text-xs text-slate-400">
          Note: Declining will mute your audio and hide your video from the recording. You can still
          participate in the session normally.
        </p>
      </div>
    </div>
  );
}
