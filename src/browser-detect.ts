declare global {
  interface Window { opera: any; }
}

window.opera = window.opera || {};

export default class BrowserDetect {
  private _browser = ''

  public get browser (): string {
    return this._browser
  }

  private _version = ''

  public get version (): string {
    return this._browser
  }

  private _OS = ''

  public get OS () : string {
    return this._OS
  }

  private _versionSearchString = ''

  private _dataBrowser = [
    { string: navigator.userAgent, subString: 'Chrome', identity: 'Chrome' },
    { string: navigator.vendor, subString: 'Apple', identity: 'Safari', versionSearch: 'Version' },
    { prop: window.opera, identity: 'Opera', versionSearch: 'Version' },
    { string: navigator.userAgent, subString: 'Firefox', identity: 'Firefox' },
    { string: navigator.userAgent, subString: 'Netscape', identity: 'Netscape' }, // for newer Netscapes (6+)
    { string: navigator.userAgent, subString: 'MSIE', identity: 'Explorer', versionSearch: 'MSIE' },
    { string: navigator.userAgent, subString: 'Trident', identity: 'Explorer', versionSearch: 'rv' },
    { string: navigator.userAgent, subString: 'Edge', identity: 'Edge' },
    { string: navigator.userAgent, subString: 'Gecko', identity: 'Mozilla', versionSearch: 'rv' },
    { string: navigator.userAgent, subString: 'Mozilla', identity: 'Netscape', versionSearch: 'Mozilla' } // for older Netscapes (4-)
  ]

  private _dataOS = [
    { string: navigator.platform, subString: 'Win', identity: 'Windows' },
    { string: navigator.platform, subString: 'Mac', identity: 'Mac' },
    { string: navigator.userAgent, subString: 'iPhone', identity: 'iPhone/iPod' },
    { string: navigator.platform, subString: 'Linux', identity: 'Linux' }
  ]
  
  public get isFirefox (): boolean {
    return this._browser === 'Firefox'
  }

  public get isChrome (): boolean {
      return this._browser === 'Chrome'
  }

  public get isSafari (): boolean {
      return this._browser === 'Safari'
  }

  public get isOpera (): boolean {
      return this._browser === 'Opera'
  }
  
  constructor (userAgent: string, appVersion: string) {
    this._browser = this.searchString(this._dataBrowser) || 'An unknown browser'
    this._version = this.searchVersion(userAgent) || this.searchVersion(appVersion) || 'an unknown version'
    this._OS = this.searchString(this._dataOS) || 'an unknown OS'
  }

  searchString (data: Array<any>): string | null {
    for (let i = 0; i < data.length; i++) {
      const dataString = data[i].string
      const dataProp = data[i].prop
      this._versionSearchString = data[i].versionSearch || data[i].identity
      if (dataString) {
        if (dataString.includes(data[i].subString)) {
          return data[i].identity
        }
      } else if (dataProp) {
        return data[i].identity
      }
    }

    return null
  }

  searchVersion (dataString: string): string | null {
    const index = dataString.indexOf(this._versionSearchString)
    if (index === -1) {
      return null
    }

    return dataString.substring(index + this._versionSearchString.length + 1)
  }
}

// mobile
// const isMobile = {
//     Android () {
//       return navigator.userAgent.match(/Android/i)
//     },
//     iOS () {
//       return navigator.userAgent.match(/iPhone|iPad|iPod/i)
//     },
//     Opera () {
//       return navigator.userAgent.match(/Opera Mini/i)
//     },
//     any () {
//       return (isMobile.Android() || isMobile.iOS() || isMobile.Opera())
//     }
// }
  