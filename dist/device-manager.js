"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_detect_1 = __importDefault(require("./browser-detect"));
class MediaManager {
    constructor() {
        this._devices = [];
        this._permissions = {
            camera: 'denied',
            microphone: 'denied'
        };
        this._listeners = [];
        // private _videoPermissionChangedListener: (() => void) | null = null
        this._ready = false;
        this._browserDetect = new browser_detect_1.default(navigator.userAgent, navigator.appVersion);
        this.loadPermissions()
            .catch(async () => {
            await this.loadDevices();
        })
            .finally(() => {
            this._ready = true;
            this._listeners.forEach(l => l());
        });
    }
    onReady(callback) {
        if (!this._ready) {
            this._listeners.push(callback);
            return;
        }
        callback();
    }
    // onVideoPermissionsChanged (callback: () => void) {
    //   this._videoPermissionChangedListener = callback
    // }
    async loadPermissions() {
        if (navigator.permissions) {
            // const mappings = {
            //   camera: 'Video', 
            //   microphone: 'Microphone'
            // }
            // for (const mappingKey in mappings) {
            //   try {
            //     const status = await navigator.permissions.query({ name: mappingKey as PermissionName })
            //     this._permissions[mappingKey] = status.state
            //     const _this = this
            //     status.onchange = function () {
            //       _this._permissions[mappingKey] = this.state
            //     }
            //   } catch (err) {
            //     const val = mappings[mappingKey] as string
            //     const functionName = `has${val}Access`
            //     if (!this[functionName]()) {
            //       this._permissions[mappingKey] = 'prompt'
            //     }
            //   }
            // }
            // for (const (key, value) of {camera: 'camera', microphone: 'video'}) {
            // }
            // const _this = this
            try {
                const status = await navigator.permissions.query({ name: 'camera' });
                this._permissions.camera = status.state;
                // status.onchange = function () {
                //   _this._permissions.camera = this.state
                // if (_this._videoPermissionChangedListener !== null) {
                //   _this._videoPermissionChangedListener()
                // }
                // }
            }
            catch (err) {
                if (!this.hasVideoAccess()) {
                    this._permissions.camera = 'prompt';
                }
            }
            try {
                const status = await navigator.permissions.query({ name: 'microphone' });
                this._permissions.microphone = status.state;
                // status.onchange = function () {
                //   _this._permissions.microphone = this.state
                // }
            }
            catch (err) {
                if (!this.hasMicrophoneAccess()) {
                    this._permissions.microphone = 'prompt';
                }
            }
            if (this.hasVideoAccess() || this.hasMicrophoneAccess()) {
                await this.loadDevices();
            }
            return;
        }
        return new Promise((resolve, reject) => {
            reject(new Error('permissions api not available'));
        });
    }
    async loadDevices() {
        try {
            this._devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.deviceId);
        }
        catch (err) {
            console.error(err);
        }
    }
    async requestVideoPermissions() {
        return await this.requestPermissions(true, false);
    }
    async requestAudioPermissions() {
        return await this.requestPermissions(false, true);
    }
    async requestPermissions(video = true, audio = true) {
        let loadable = true;
        if (this._browserDetect.isFirefox) {
            this._permissions.camera = 'promt';
            this._permissions.microphone = 'promt';
            return;
        }
        try {
            const media = await navigator.mediaDevices.getUserMedia({ video, audio });
            media.getTracks().forEach(t => t.stop());
            if (video) {
                this._permissions.camera = 'granted';
            }
            if (audio) {
                this._permissions.microphone = 'granted';
            }
        }
        catch (err) {
            loadable = false;
        }
        try {
            await this.loadPermissions();
        }
        catch (err) {
            // if loadable only permissions api is missing (safari)
            if (loadable) {
                this._permissions.camera = 'granted';
                this._permissions.microphone = 'granted';
            }
        }
        await this.loadDevices();
    }
    canAccessInput() {
        return this.canAccessVideoInput() && this.canAccessAudioInput();
    }
    canAccessVideoInput() {
        return this._permissions.camera !== 'denied';
    }
    canAccessAudioInput() {
        return this._permissions.microphone !== 'denied';
    }
    hasVideoAccess() {
        return this._permissions.camera === 'granted';
    }
    hasMicrophoneAccess() {
        return this._permissions.microphone === 'granted';
    }
    needsInputAccess() {
        return this.needsMicrophoneInputAccess() || this.needsVideoInputAccess();
    }
    needsMicrophoneInputAccess() {
        return !this.hasMicrophoneAccess();
    }
    needsVideoInputAccess() {
        return !this.hasVideoAccess();
    }
    getPermissions() {
        return this._permissions;
    }
    async getVideoSrc(device) {
        if (this.getVideoInputDevices().length === 0) {
            return await navigator.mediaDevices.getUserMedia({ video: true });
        }
        return await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: (device ? device : this.getVideoInputDevices()[0]).deviceId
            }
        });
    }
    getDevices() {
        return this._devices;
    }
    getInputDevices() {
        return this.getDevices().filter(device => device.kind.includes('input'));
    }
    getOutputDevices() {
        return this.getDevices().filter(device => device.kind.includes('output'));
    }
    getVideoInputDevices() {
        return this.getDevices().filter(device => device.kind.includes('videoinput'));
    }
    getAudioInputDevices() {
        return this.getDevices().filter(device => device.kind.includes('audioinput'));
    }
    getAudioOutputDevices() {
        return this.getDevices().filter(device => device.kind.includes('audiooutput'));
    }
}
exports.default = MediaManager;
