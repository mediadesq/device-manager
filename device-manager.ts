import BrowserDetect from './browser-detect'

class MediaManager {
  _devices: MediaDeviceInfo[] = []

  _permissions: {[index: string]: any} = {
    camera: 'denied',
    microphone: 'denied'
  }

  _listeners: Array<(() => void)> = []

  _ready = false

  _browserDetect: BrowserDetect = new BrowserDetect(navigator.userAgent, navigator.appVersion)

  _media: MediaStream | undefined = undefined

  constructor () {
    this.loadPermissions()
      .catch(async () => {
        await this.loadDevices()
      })
      .finally(() => {
        this._ready = true
        this._listeners.forEach(l => l())
      })
  }

  onReady (callback: () => void) {
    if (!this._ready) {
      this._listeners.push(callback)
      return
    }

    callback()
  }

  getBrowser (): string {
    return this._browserDetect.browser
  }

  async loadPermissions (): Promise<void> {
    if (navigator.permissions) {
      // for (const slug of ['camera', 'microphone']) {
      //   try {
      //     this._permissions[slug] = (await navigator.permissions.query({ name: slug as PermissionName })).state
      //   } catch (err) {
      //     this._permissions[slug] = 'prompt'
      //   }
      // }

      try {
        this._permissions.camera = (await navigator.permissions.query({ name: 'camera' })).state
      } catch (err) {
        if (!this.hasVideoAccess()) {
          this._permissions.camera = 'prompt'
        }
      }

      try {
        this._permissions.microphone = (await navigator.permissions.query({ name: 'microphone' })).state
      } catch (err) {
        if (!this.hasMicrophoneAccess()) {
          this._permissions.microphone = 'prompt'
        }
      }

      if (this.hasVideoAccess() || this.hasMicrophoneAccess()) {
        await this.loadDevices()
      }

      return
    }

    return new Promise((resolve, reject) => {
      reject(new Error('permissions api not available'))
    })
  }

  async loadDevices (): Promise<void> {
    try {
      this._devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.deviceId)
    } catch (err) {
      console.error(err)
    }
  }

  async requestVideoPermissions (): Promise<void> {
    return await this.requestPermissions(true, false)
  }

  async requestAudioPermissions (): Promise<void> {
    return await this.requestPermissions(false, true)
  }

  async requestPermissions (video = true, audio = true): Promise<void> {
    let loadable = true

    if (this._browserDetect.isFirefox()) {
      this._permissions.camera = 'promt'
      this._permissions.microphone = 'promt'
      return
    }

    try {
      const media = await navigator.mediaDevices.getUserMedia({ video, audio })
      media.getTracks().forEach(t => t.stop())

      if (video) {
        this._permissions.camera = 'granted'
      }

      if (audio) {
        this._permissions.microphone = 'granted'
      }
    } catch (err) {
      loadable = false
    }

    try {
      await this.loadPermissions()
    } catch (err) {
      // if loadable only permissions api is missing (safari)
      if (loadable) {
        this._permissions.camera = 'granted'
        this._permissions.microphone = 'granted'
      }
    }

    await this.loadDevices()
  }

  canAccessInput (): boolean {
    return this.canAccessVideoInput() && this.canAccessAudioInput()
  }

  canAccessVideoInput (): boolean {
    return this._permissions.camera !== 'denied'
  }

  canAccessAudioInput (): boolean {
    return this._permissions.microphone !== 'denied'
  }

  hasVideoAccess (): boolean {
    return this._permissions.camera === 'granted'
  }

  hasMicrophoneAccess (): boolean {
    return this._permissions.microphone === 'granted'
  }

  needsInputAccess (): boolean {
    return this.needsMicrophoneInputAccess() || this.needsVideoInputAccess()
  }

  needsMicrophoneInputAccess (): boolean {
    return !this.hasMicrophoneAccess()
  }

  needsVideoInputAccess (): boolean {
    return !this.hasVideoAccess()
  }

  getPermissions (): Object {
    return this._permissions
  }

  async getVideoSrc (): Promise<MediaStream> {
    if (this.getVideoInputDevices().length === 0) {
      return await navigator.mediaDevices.getUserMedia({ video: true })
    }

    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: this.getVideoInputDevices()[0].deviceId
      }
    })
  }

  getDevices (): MediaDeviceInfo[] {
    return this._devices
  }

  getInputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('input'))
  }

  getOutputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('output'))
  }

  getVideoInputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('videoinput'))
  }

  getAudioInputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('audioinput'))
  }

  getAudioOutputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('audiooutput'))
  }
}

export default (app: any, inject: any) => {
  inject('mediaManager', new MediaManager())
}
