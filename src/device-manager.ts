import BrowserDetect from './browser-detect'

export default class MediaManager {
  private _devices: MediaDeviceInfo[] = []

  private _permissions: {[index: string]: PermissionState} = {
    camera: 'denied',
    microphone: 'denied'
  }

  private _listeners: Array<(() => void)> = []
  // private _videoPermissionChangedListener: (() => void) | null = null

  private _ready = false

  private _browserDetect: BrowserDetect = new BrowserDetect(navigator.userAgent, navigator.appVersion)

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

  // onVideoPermissionsChanged (callback: () => void) {
  //   this._videoPermissionChangedListener = callback
  // }

  async loadPermissions (): Promise<void> {
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

      const _this = this

      try {
        const status = await navigator.permissions.query({ name: 'camera' })
        this._permissions.camera = status.state

        status.onchange = function () {
          _this._permissions.camera = this.state
          // if (_this._videoPermissionChangedListener !== null) {
          //   _this._videoPermissionChangedListener()
          // }
        }
      } catch (err) {
        if (!this.hasVideoAccess()) {
          this._permissions.camera = 'prompt'
        }
      }

      try {
        const status = await navigator.permissions.query({ name: 'microphone' })
        this._permissions.microphone = status.state
        
        status.onchange = function () {
          _this._permissions.microphone = this.state
        }
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

    if (this._browserDetect.isFirefox) {
      this._permissions.camera = 'promt' as PermissionState
      this._permissions.microphone = 'promt' as PermissionState
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

  async getVideoSrc (device: MediaDeviceInfo | undefined): Promise<MediaStream> {
    if (this.getVideoInputDevices().length === 0) {
      return await navigator.mediaDevices.getUserMedia({ video: true })
    }

    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: (device ? device : this.getVideoInputDevices()[0]).deviceId
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
