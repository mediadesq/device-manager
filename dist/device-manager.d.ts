export default class MediaManager {
    private _devices;
    private _permissions;
    private _listeners;
    private _ready;
    private _browserDetect;
    constructor();
    onReady(callback: () => void): void;
    loadPermissions(): Promise<void>;
    loadDevices(): Promise<void>;
    requestVideoPermissions(): Promise<void>;
    requestAudioPermissions(): Promise<void>;
    requestPermissions(video?: boolean, audio?: boolean): Promise<void>;
    canAccessInput(): boolean;
    canAccessVideoInput(): boolean;
    canAccessAudioInput(): boolean;
    hasVideoAccess(): boolean;
    hasMicrophoneAccess(): boolean;
    needsInputAccess(): boolean;
    needsMicrophoneInputAccess(): boolean;
    needsVideoInputAccess(): boolean;
    getPermissions(): Object;
    getVideoSrc(device: MediaDeviceInfo | undefined): Promise<MediaStream>;
    getDevices(): MediaDeviceInfo[];
    getInputDevices(): MediaDeviceInfo[];
    getOutputDevices(): MediaDeviceInfo[];
    getVideoInputDevices(): MediaDeviceInfo[];
    getAudioInputDevices(): MediaDeviceInfo[];
    getAudioOutputDevices(): MediaDeviceInfo[];
}
