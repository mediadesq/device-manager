declare global {
    interface Window {
        opera: any;
    }
}
export default class BrowserDetect {
    private _browser;
    get browser(): string;
    private _version;
    get version(): string;
    private _OS;
    get OS(): string;
    private _versionSearchString;
    private _dataBrowser;
    private _dataOS;
    get isFirefox(): boolean;
    get isChrome(): boolean;
    get isSafari(): boolean;
    get isOpera(): boolean;
    constructor(userAgent: string, appVersion: string);
    searchString(data: Array<any>): string | null;
    searchVersion(dataString: string): string | null;
}
