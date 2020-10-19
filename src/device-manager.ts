export default async function createDeviceManager (): Promise<DeviceManager> {
  if (DeviceManagerImpl.manager !== undefined) {
    return DeviceManagerImpl.manager
  }

  DeviceManagerImpl.manager = new DeviceManagerImpl()

  await DeviceManagerImpl.manager.loadPermissions()

  await DeviceManagerImpl.manager.loadDevices()

  return DeviceManagerImpl.manager
}

export interface DeviceManager {
  loadDevices(): Promise<void>
  requestCameraPermissions(): Promise<boolean>
  requestCameraStream(device?: MediaDeviceInfo): Promise<MediaStream>
  requestCameraStreamWithConstraints(constraints: MediaStreamConstraints): Promise<MediaStream>
  getDefaultCameraDevice(): Promise<MediaDeviceInfo | undefined>
  stopCameraStreams(): void
  requestMicrophonePermissions(): Promise<boolean>
  requestMicrophoneStream (device?: MediaDeviceInfo): Promise<MediaStream>
  requestMicrophoneStreamWithConstraints(constraints: MediaStreamConstraints): Promise<MediaStream>
  getDefaultMicrophoneDevice(): Promise<MediaDeviceInfo | undefined>
  stopMicrophoneStreams(): void
  requestDisplayStream (audio?: boolean): Promise<MediaStream>
  stopDisplayStreams(): void
  hasCameraAccess (): boolean
  hasMicrophoneAccess (): boolean
  getDevices (): MediaDeviceInfo[]
  getInputDevices (): MediaDeviceInfo[]
  getOutputDevices (): MediaDeviceInfo[]
  getCameraDevices (): MediaDeviceInfo[]
  getAudioInputDevices (): MediaDeviceInfo[]
  getAudioOutputDevices (): MediaDeviceInfo[]
  supportsUserMediaApi (): boolean
  setVideoSrc(element: HTMLVideoElement, stream: MediaStream): void
}

export class DeviceManagerImpl implements DeviceManager {
  private _devices: MediaDeviceInfo[] = []

  private _permissions: {[index: string]: PermissionState} = {
    camera: 'denied',
    microphone: 'denied'
  }

  private cameraStreams: Array<MediaStream> = []
  private microphoneStreams: Array<MediaStream> = []
  private displayStreams: Array<MediaStream> = []

  static manager?: DeviceManagerImpl

  async requestCameraPermissions (): Promise<boolean> {
    try {
      if (this.hasCameraAccess()) {
        return true
      }

      const stream = await this.requestCameraStream()
      stream.getVideoTracks().forEach(t => t.stop())

      await this.loadDevices()

      return true
    } catch {
      return false
    }
  }

  async requestCameraStream (device?: MediaDeviceInfo): Promise<MediaStream> {
    const accessWasNotGranted = this._permissions.camera !== 'granted'
    let stream
    if (!device) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: (device).deviceId
        },
        audio: false
      })
    }

    this.cameraStreams.push(stream)

    this._permissions.camera = 'granted'

    if (accessWasNotGranted) {
      await this.loadDevices()
    }

    return stream
  }

  async requestCameraStreamWithConstraints (constraints: MediaStreamConstraints): Promise<MediaStream> {
    const accessWasNotGranted = this._permissions.camera !== 'granted'
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    this.cameraStreams.push(stream)

    this._permissions.camera = 'granted'

    if (accessWasNotGranted) {
      await this.loadDevices()
    }

    return stream
  }

  async getDefaultCameraDevice (): Promise<MediaDeviceInfo | undefined> {
    if (this.hasCameraAccess()) {
      const devices = this.getCameraDevices()
      return devices.length > 0 ? devices[0] : undefined
    }

    const canAccessCamera = await this.requestCameraPermissions()
    if (canAccessCamera) {
      return await this.getDefaultCameraDevice()
    }
  }

  // stopCameraStream (device: MediaDeviceInfo) {
  //   this.cameraStreams.forEach(stream => stream.getTracks().forEach(track => track.stop()))
  // }

  stopCameraStreams () {
    this.cameraStreams.forEach(stream => stream.getTracks().forEach(track => track.stop()))
  }

  async requestMicrophonePermissions (): Promise<boolean> {
    try {
      if (this.hasMicrophoneAccess()) {
        return true
      }

      const stream = await this.requestMicrophoneStream()
      stream.getAudioTracks().forEach(t => t.stop())

      await this.loadDevices()

      return true
    } catch {
      return false
    }
  }

  async requestMicrophoneStream (device?: MediaDeviceInfo): Promise<MediaStream> {
    const accessWasNotGranted = this._permissions.camera !== 'granted'
    let stream
    if (!device) {
      stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: (device).deviceId
        }
      })
    }

    this.microphoneStreams.push(stream)

    this._permissions.microphone = 'granted'

    if (accessWasNotGranted) {
      await this.loadDevices()
    }

    return stream
  }

  async requestMicrophoneStreamWithConstraints (constraints: MediaStreamConstraints): Promise<MediaStream> {
    const accessWasNotGranted = this._permissions.camera !== 'granted'
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    this.microphoneStreams.push(stream)

    this._permissions.microphone = 'granted'

    if (accessWasNotGranted) {
      await this.loadDevices()
    }

    return stream
  }

  async getDefaultMicrophoneDevice (): Promise<MediaDeviceInfo | undefined> {
    if (this.hasMicrophoneAccess()) {
      const devices = this.getAudioInputDevices()
      return devices.length > 0 ? devices[0] : undefined
    }

    const canAccessMicrophone = await this.requestMicrophonePermissions()
    if (canAccessMicrophone) {
      return await this.getDefaultMicrophoneDevice()
    }
  }

  stopMicrophoneStreams () {
    this.microphoneStreams.forEach(stream => stream.getTracks().forEach(track => track.stop()))
  }

  async requestDisplayStream (audio: boolean = false): Promise<MediaStream> {
    const mediaDevices = navigator.mediaDevices as any

    const stream = await mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always'
      },
      audio
    })

    this.displayStreams.push(stream)

    return stream
  }

  stopDisplayStreams () {
    this.displayStreams.forEach(stream => stream.getTracks().forEach(track => track.stop()))
  }

  private async requestUserMedia (constraints: MediaStreamConstraints, device?: MediaDeviceInfo) : Promise<MediaStream> {
    let stream
    if (!device) {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } else {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    }

    return stream
  }

  async loadPermissions (): Promise<void> {
    if (!navigator.permissions) {
      return
    }

    try {
      this._permissions.camera = (await navigator.permissions.query({ name: 'camera' })).state
      this._permissions.microphone = (await navigator.permissions.query({ name: 'microphone' })).state
    } catch (err) {
      this._permissions.camera = this._permissions.microphone = 'prompt'
    }
  }

  async loadDevices (): Promise<void> {
    try {
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.deviceId && d.label)
      if (devices.length > 0) {
        this._devices = devices
      }

      // if devices can be loaded access was granted
      if (this._devices.length > 0) {
        if (!this.hasCameraAccess() && this.getCameraDevices().length > 0) {
          this._permissions.camera = 'granted'
        }

        if (!this.hasMicrophoneAccess() && this.getAudioInputDevices().length > 0) {
          this._permissions.microphone = 'granted'
        }
      }
    } catch (err) {}
  }

  hasCameraAccess (): boolean {
    return this._permissions.camera === 'granted'
  }

  hasMicrophoneAccess (): boolean {
    return this._permissions.microphone === 'granted'
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

  getCameraDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('videoinput'))
  }

  getAudioInputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('audioinput'))
  }

  getAudioOutputDevices (): MediaDeviceInfo[] {
    return this.getDevices().filter(device => device.kind.includes('audiooutput'))
  }

  supportsUserMediaApi (): boolean {
    return navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined
  }

  setVideoSrc(element: HTMLVideoElement, stream: MediaStream): void {
    if ('srcObject' in element) {
      element.srcObject = stream;
    } else {
      // @ts-ignore
      element.src = window.URL.createObjectURL(stream);
    }
    element.onloadedmetadata = (e) => {
      element.play()
    }
  }
}
