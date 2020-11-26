export type VideoQuality = 'low' | 'medium' | 'high'

export interface CameraResolution {
    width: number
    height: number
    name: string
    ratio: string
    quality: VideoQuality
}

export const cameraResolutions: CameraResolution[] = [
    {
        width: 160,
        height: 120,
        name: 'QQVGA',
        ratio: '4:3',
        quality: 'low'
    },
    {
        width: 176,
        height: 144,
        name: 'QCIF',
        ratio: '4:3',
        quality: 'low'
    },
    {
        width: 320,
        height: 240,
        name: 'QVGA',
        ratio: '4:3',
        quality: 'low'
    },
    {
        width: 352,
        height: 288,
        name: 'CIF',
        ratio: '4:3',
        quality: 'low'
    },
    {
        width: 640,
        height: 360,
        name: '360p(nHD)',
        ratio: '16:9',
        quality: 'medium'
    },
    {
        width: 640,
        height: 480,
        name: 'VGA',
        ratio: '4:3',
        quality: 'medium'
    },
    {
        width: 800,
        height: 600,
        name: 'SVGA',
        ratio: '4:3',
        quality: 'medium'
    },
    {
        width: 1280,
        height: 720,
        name: '720p(HD)',
        ratio: '16:9',
        quality: 'medium'
    },
    {
        width: 1600,
        height: 1200,
        name: 'UXGA',
        ratio: '4:3',
        quality: 'high'
    },
    {
        width: 1920,
        height: 1080,
        name: '1080p(FHD)',
        ratio: '16:9',
        quality: 'high'
    },
    {
        width: 3840,
        height: 2160,
        name: '4K(UHD)',
        ratio: '16:9',
        quality: 'high'
    },
]
