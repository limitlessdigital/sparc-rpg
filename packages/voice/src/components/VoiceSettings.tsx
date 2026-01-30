/**
 * Voice Settings Modal - Audio/Video configuration
 */

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMediaDevices } from '../hooks/use-media-devices';
import { useAudioLevel } from '../hooks/use-audio-level';
import type { VoiceSettingsProps, VoiceMode } from '../types';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Slider component
function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200"
      />
      {label && <span className="w-12 text-right text-sm text-slate-600">{label}</span>}
    </div>
  );
}

// Select component
function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Audio level meter
function AudioLevelMeter({ level }: { level: number }) {
  return (
    <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded bg-slate-200">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 transition-colors',
            i < level / 5
              ? i < 12
                ? 'bg-green-500'
                : i < 16
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              : 'bg-slate-300'
          )}
        />
      ))}
    </div>
  );
}

export function VoiceSettings({
  isOpen,
  onClose,
  audioSettings,
  videoSettings,
  onAudioSettingsChange,
  onVideoSettingsChange,
}: VoiceSettingsProps) {
  const {
    audioInputs,
    audioOutputs,
    videoInputs,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    selectAudioInput,
    selectAudioOutput,
    selectVideoInput,
    testAudioInput,
    testAudioOutput,
    requestPermissions,
    hasPermission,
  } = useMediaDevices();

  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');

  const { level: audioLevel, startMonitoring, stopMonitoring } = useAudioLevel();

  // Request permissions on open
  useEffect(() => {
    if (isOpen && !hasPermission) {
      requestPermissions(true, true);
    }
  }, [isOpen, hasPermission, requestPermissions]);

  // Handle audio input test
  const handleTestMicrophone = async () => {
    if (testStream) {
      stopMonitoring();
      testStream.getTracks().forEach((track) => track.stop());
      setTestStream(null);
    } else {
      const stream = await testAudioInput(selectedAudioInput || 'default');
      if (stream) {
        setTestStream(stream);
        startMonitoring(stream);
      }
    }
  };

  // Handle speaker test
  const handleTestSpeaker = () => {
    testAudioOutput(selectedAudioOutput || 'default');
  };

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && testStream) {
      stopMonitoring();
      testStream.getTracks().forEach((track) => track.stop());
      setTestStream(null);
    }
  }, [isOpen, testStream, stopMonitoring]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Voice & Video Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('audio')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'audio'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            🎤 Audio
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'video'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            📷 Video
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          {activeTab === 'audio' ? (
            <div className="space-y-6">
              {/* Microphone Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Microphone</label>
                <Select
                  value={selectedAudioInput || ''}
                  onChange={(deviceId) => {
                    selectAudioInput(deviceId);
                    onAudioSettingsChange({ ...audioSettings, inputDevice: deviceId });
                  }}
                  options={audioInputs.map((d) => ({ value: d.deviceId, label: d.label }))}
                  placeholder="Select microphone"
                />
              </div>

              {/* Audio Level Meter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Input Level</label>
                <AudioLevelMeter level={testStream ? audioLevel : 0} />
                <button
                  onClick={handleTestMicrophone}
                  className={cn(
                    'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                    testStream
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  )}
                >
                  {testStream ? 'Stop Test' : 'Test Microphone'}
                </button>
              </div>

              {/* Speaker Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Speaker</label>
                <Select
                  value={selectedAudioOutput || ''}
                  onChange={(deviceId) => {
                    selectAudioOutput(deviceId);
                    onAudioSettingsChange({ ...audioSettings, outputDevice: deviceId });
                  }}
                  options={audioOutputs.map((d) => ({ value: d.deviceId, label: d.label }))}
                  placeholder="Select speaker"
                />
                <button
                  onClick={handleTestSpeaker}
                  className="rounded bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200"
                >
                  Test Speaker
                </button>
              </div>

              {/* Volume Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Input Volume</label>
                <Slider
                  value={audioSettings.inputVolume}
                  onChange={(v) => onAudioSettingsChange({ ...audioSettings, inputVolume: v })}
                  label={`${audioSettings.inputVolume}%`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Output Volume</label>
                <Slider
                  value={audioSettings.outputVolume}
                  onChange={(v) => onAudioSettingsChange({ ...audioSettings, outputVolume: v })}
                  label={`${audioSettings.outputVolume}%`}
                />
              </div>

              {/* Voice Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Voice Mode</label>
                <div className="space-y-2">
                  {(['voice-activated', 'push-to-talk', 'always-on'] as VoiceMode[]).map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="voiceMode"
                        checked={audioSettings.voiceMode === mode}
                        onChange={() => onAudioSettingsChange({ ...audioSettings, voiceMode: mode })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">
                        {mode === 'voice-activated' && 'Voice Activated'}
                        {mode === 'push-to-talk' && 'Push to Talk'}
                        {mode === 'always-on' && 'Always On'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Voice Activation Threshold */}
              {audioSettings.voiceMode === 'voice-activated' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Voice Activation Sensitivity</label>
                  <Slider
                    value={audioSettings.voiceActivationThreshold}
                    onChange={(v) =>
                      onAudioSettingsChange({ ...audioSettings, voiceActivationThreshold: v })
                    }
                    label={`${audioSettings.voiceActivationThreshold}%`}
                  />
                </div>
              )}

              {/* Push to Talk Key */}
              {audioSettings.voiceMode === 'push-to-talk' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Push to Talk Key</label>
                  <input
                    type="text"
                    value={audioSettings.pushToTalkKey}
                    readOnly
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="Press a key..."
                    onKeyDown={(e) => {
                      e.preventDefault();
                      onAudioSettingsChange({ ...audioSettings, pushToTalkKey: e.code });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Camera Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Camera</label>
                <Select
                  value={selectedVideoInput || ''}
                  onChange={(deviceId) => {
                    selectVideoInput(deviceId);
                    onVideoSettingsChange({ ...videoSettings, cameraDevice: deviceId });
                  }}
                  options={videoInputs.map((d) => ({ value: d.deviceId, label: d.label }))}
                  placeholder="Select camera"
                />
              </div>

              {/* Video Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Video Quality</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'auto'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => onVideoSettingsChange({ ...videoSettings, videoQuality: quality })}
                      className={cn(
                        'flex-1 rounded px-3 py-2 text-sm font-medium capitalize transition-colors',
                        videoSettings.videoQuality === quality
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>

              {/* Self View Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Show self view</label>
                <button
                  onClick={() =>
                    onVideoSettingsChange({
                      ...videoSettings,
                      selfViewEnabled: !videoSettings.selfViewEnabled,
                    })
                  }
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    videoSettings.selfViewEnabled ? 'bg-blue-500' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                      videoSettings.selfViewEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
