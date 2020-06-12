"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.opera = window.opera || {};
class BrowserDetect {
    constructor(userAgent, appVersion) {
        this._browser = '';
        this._version = '';
        this._OS = '';
        this._versionSearchString = '';
        this._dataBrowser = [
            { string: navigator.userAgent, subString: 'Chrome', identity: 'Chrome' },
            { string: navigator.vendor, subString: 'Apple', identity: 'Safari', versionSearch: 'Version' },
            { prop: window.opera, identity: 'Opera', versionSearch: 'Version' },
            { string: navigator.userAgent, subString: 'Firefox', identity: 'Firefox' },
            { string: navigator.userAgent, subString: 'Netscape', identity: 'Netscape' },
            { string: navigator.userAgent, subString: 'MSIE', identity: 'Explorer', versionSearch: 'MSIE' },
            { string: navigator.userAgent, subString: 'Trident', identity: 'Explorer', versionSearch: 'rv' },
            { string: navigator.userAgent, subString: 'Edge', identity: 'Edge' },
            { string: navigator.userAgent, subString: 'Gecko', identity: 'Mozilla', versionSearch: 'rv' },
            { string: navigator.userAgent, subString: 'Mozilla', identity: 'Netscape', versionSearch: 'Mozilla' } // for older Netscapes (4-)
        ];
        this._dataOS = [
            { string: navigator.platform, subString: 'Win', identity: 'Windows' },
            { string: navigator.platform, subString: 'Mac', identity: 'Mac' },
            { string: navigator.userAgent, subString: 'iPhone', identity: 'iPhone/iPod' },
            { string: navigator.platform, subString: 'Linux', identity: 'Linux' }
        ];
        this._browser = this.searchString(this._dataBrowser) || 'An unknown browser';
        this._version = this.searchVersion(userAgent) || this.searchVersion(appVersion) || 'an unknown version';
        this._OS = this.searchString(this._dataOS) || 'an unknown OS';
    }
    get browser() {
        return this._browser;
    }
    get version() {
        return this._browser;
    }
    get OS() {
        return this._OS;
    }
    get isFirefox() {
        return this._browser === 'Firefox';
    }
    get isChrome() {
        return this._browser === 'Chrome';
    }
    get isSafari() {
        return this._browser === 'Safari';
    }
    get isOpera() {
        return this._browser === 'Opera';
    }
    searchString(data) {
        for (let i = 0; i < data.length; i++) {
            const dataString = data[i].string;
            const dataProp = data[i].prop;
            this._versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.includes(data[i].subString)) {
                    return data[i].identity;
                }
            }
            else if (dataProp) {
                return data[i].identity;
            }
        }
        return null;
    }
    searchVersion(dataString) {
        const index = dataString.indexOf(this._versionSearchString);
        if (index === -1) {
            return null;
        }
        return dataString.substring(index + this._versionSearchString.length + 1);
    }
}
exports.default = BrowserDetect;
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
