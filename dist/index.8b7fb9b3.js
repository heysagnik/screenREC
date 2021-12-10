// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"cSv3F":[function(require,module,exports) {
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "4a236f9275d0a351";
module.bundle.HMR_BUNDLE_ID = "21352e468b7fb9b3";
"use strict";
function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F() {
            };
            return {
                s: F,
                n: function n() {
                    if (i >= o.length) return {
                        done: true
                    };
                    return {
                        done: false,
                        value: o[i++]
                    };
                },
                e: function e(_e) {
                    throw _e;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {
        s: function s() {
            it = o[Symbol.iterator]();
        },
        n: function n() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
        },
        e: function e(_e2) {
            didErr = true;
            err = _e2;
        },
        f: function f() {
            try {
                if (!normalCompletion && it.return != null) it.return();
            } finally{
                if (didErr) throw err;
            }
        }
    };
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function accept(fn) {
            this._acceptCallbacks.push(fn || function() {
            });
        },
        dispose: function dispose(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == 'https:' && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? 'wss' : 'ws';
    var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/'); // $FlowFixMe
    ws.onmessage = function(event) {
        checkedAssets = {
        };
        acceptedAssets = {
        };
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === 'update') {
            // Remove error overlay if there is one
            if (typeof document !== 'undefined') removeErrorOverlay();
            var assets = data.assets.filter(function(asset) {
                return asset.envHash === HMR_ENV_HASH;
            }); // Handle HMR Update
            var handled = assets.every(function(asset) {
                return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                assets.forEach(function(asset) {
                    hmrApply(module.bundle.root, asset);
                });
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else window.location.reload();
        }
        if (data.type === 'error') {
            // Log parcel errors to console
            var _iterator = _createForOfIteratorHelper(data.diagnostics.ansi), _step;
            try {
                for(_iterator.s(); !(_step = _iterator.n()).done;){
                    var ansiDiagnostic = _step.value;
                    var stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                    console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
                }
            } catch (err) {
                _iterator.e(err);
            } finally{
                _iterator.f();
            }
            if (typeof document !== 'undefined') {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn('[parcel] 🚨 Connection to the HMR server was lost');
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log('[parcel] ✨ Error resolved');
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    var errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    var _iterator2 = _createForOfIteratorHelper(diagnostics), _step2;
    try {
        for(_iterator2.s(); !(_step2 = _iterator2.n()).done;){
            var diagnostic = _step2.value;
            var stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
            errorHTML += "\n      <div>\n        <div style=\"font-size: 18px; font-weight: bold; margin-top: 20px;\">\n          \uD83D\uDEA8 ".concat(diagnostic.message, "\n        </div>\n        <pre>").concat(stack, "</pre>\n        <div>\n          ").concat(diagnostic.hints.map(function(hint) {
                return '<div>💡 ' + hint + '</div>';
            }).join(''), "\n        </div>\n        ").concat(diagnostic.documentation ? "<div>\uD83D\uDCDD <a style=\"color: violet\" href=\"".concat(diagnostic.documentation, "\" target=\"_blank\">Learn more</a></div>") : '', "\n      </div>\n    ");
        }
    } catch (err) {
        _iterator2.e(err);
    } finally{
        _iterator2.f();
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', link.getAttribute('href').split('?')[0] + '?' + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(window.location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        var deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            var fn = new Function('require', 'module', 'exports', asset.output);
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) return true;
    var parents = getParents(module.bundle.root, id); // If no parents, the asset is new. Prevent reloading the page.
    if (!parents.length) return true;
    return parents.some(function(v) {
        return hmrAcceptCheck(v[0], v[1], null);
    });
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {
    };
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}],"3auaO":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _recorder = require("./components/recorder");
var _recorderDefault = parcelHelpers.interopDefault(_recorder);
var _themeToggler = require("./components/themeToggler");
var _themeTogglerDefault = parcelHelpers.interopDefault(_themeToggler);
const screenHive = {
};
//instance
screenHive.recorder = new _recorderDefault.default();
screenHive.theme = new _themeTogglerDefault.default();
// init
screenHive.recorder.init();
screenHive.theme.init();

},{"./components/recorder":"4BzfS","./components/themeToggler":"8ZSHi","@parcel/transformer-js/src/esmodule-helpers.js":"ciiiV"}],"4BzfS":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
class recorderClass {
    constructor(){
        if (!recorderClass.instance) {
            this.set = {
                // TODO: LOADING ANIMATION
                // logo: document.querySelector(".sh__logo"),
                // logoImg: document.querySelector(".sh__logo--img"),
                // logoText: document.querySelector(".sh__logo--text"),
                // progress: document.querySelector(".sh__progress"),
                // themeToggler: document.querySelector(".sh__toggler"),
                // footer: document.querySelector(".sh__footer"),
                start: document.getElementById("start"),
                stop: document.getElementById("stop"),
                preview: document.querySelector("#preview"),
                download: document.querySelector("#download"),
                mimeChoiceWrapper: document.querySelector(".sh__choice"),
                videoWrapper: document.querySelector(".sh__video--wrp"),
                videoOpacitySheet: document.querySelector(".sh__video--sheet"),
                dropdownToggle: document.querySelector(".sh__dropdown--btn"),
                dropdownList: document.querySelector(".sh__dropdown__list"),
                dropdownDefaultOption: document.querySelector(".sh__dropdown--defaultOption"),
                dropdownOptions: document.querySelectorAll(".sh__dropdown__list--item"),
                dropdownChevron: document.querySelector(".sh__dropdown--icon.chevron"),
                headerText: document.querySelector(".sh__header"),
                toast: document.querySelector(".sh__toast"),
                mime: null,
                mediaRecorder: null
            };
            recorderClass.instance = this;
        }
        return recorderClass.instance;
    }
    toggleDropdown() {
        this.set.dropdownToggle.classList.toggle("toggled");
        this.set.dropdownChevron.classList.toggle("toggled");
        this.set.dropdownList.classList.toggle("open");
    }
    getSelectedValue(el1) {
        let selectedElement = el1;
        let selectedAttrValue = selectedElement.getAttribute("data-value");
        selectedAttrValue !== "" ? this.set.start.classList.add("visible") : this.set.start.classList.remove("visible");
        this.set.dropdownDefaultOption.textContent = selectedElement.innerText;
        this.set.mime = selectedAttrValue;
    }
    getRandomString(length) {
        let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for(let i = 0; i < length; i++)result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        return result;
    }
    appendStatusNotification(actionType) {
        const notificationText = actionType === "start" ? "Started recording" : actionType === "stop" ? "Stopped recording" : "";
        this.set.toast.textContent = notificationText;
        this.set.toast.classList.add("active");
        setTimeout(()=>{
            this.set.toast.classList.remove("active");
        }, 2000);
    }
    createRecorder(stream1) {
        // the stream data is stored in this array
        let recordedChunks = [];
        this.set.mediaRecorder = new MediaRecorder(stream1);
        this.set.mediaRecorder.ondataavailable = (e)=>{
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        this.set.mediaRecorder.onstop = ()=>{
            this.bakeVideo(recordedChunks);
            recordedChunks = [];
        };
        this.set.mediaRecorder.start(15); // For every 200ms the stream data will be stored in a separate chunk.
        return this.set.mediaRecorder;
    }
    async recordScreen() {
        return await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: {
                mediaSource: "screen"
            }
        });
    }
    bakeVideo(recordedChunks) {
        const blob = new Blob(recordedChunks, {
            type: "video/" + this.set.mime
        });
        let filename = this.getRandomString(15);
        this.set.download.href = URL.createObjectURL(blob);
        this.set.download.download = `${filename}.${this.set.mime}`;
        this.set.videoOpacitySheet.remove();
        this.set.preview.autoplay = false;
        this.set.preview.controls = true;
        this.set.preview.src = URL.createObjectURL(blob);
        URL.revokeObjectURL(blob); // clear from memory
    }
    init() {
        // TODO: LOADING ANIMATION
        // const tl = new TimelineLite({ duration: .8, delay: .4, ease: "back.out(2)", opacity: 0 });
        //
        // tl
        //     .to(this.set.progress,  { duration: 7, width: "101vw" } )
        //     .fromTo(this.set.logo, { duration: 1, opacity: 0, xPercent: -50, yPercent: 300 }, { opacity: 1, yPercent: -50, xPercent: -50, scale: .9 }, "<" )
        //     .from(".sh__logo--text .letter", { opacity: 0, x: 20, stagger: { amount: 0.80, from: "start" }}, "<")
        //     .to(this.set.logo, { scale: .7, yPercent: 3, top: "1.5%" }, "-=2")
        //     .from(this.set.themeToggler,{ yPercent: -200 } )
        //     .from(this.set.footer,{ yPercent: 200 }, "<" )
        //     .fromTo(this.set.headerText,{ opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "+=.8" )
        //     .fromTo(this.set.dropdownToggle, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=.7" )
        this.set.dropdownToggle.addEventListener("click", ()=>{
            this.toggleDropdown();
        });
        document.addEventListener("click", (e)=>{
            if (this.set.dropdownToggle.classList.contains("toggled")) {
                if (!e.target.closest(".sh__dropdown--btn")) this.toggleDropdown();
            }
        });
        this.set.dropdownOptions.forEach((el)=>{
            el.addEventListener("click", ()=>{
                this.getSelectedValue(el);
                this.toggleDropdown();
            });
        });
        this.set.start.addEventListener("click", async ()=>{
            let stream = await this.recordScreen();
            let mimeType = "video/" + this.set.mime;
            this.set.mediaRecorder = this.createRecorder(stream, mimeType);
            this.set.preview.srcObject = stream;
            this.set.preview.captureStream = this.set.preview.captureStream || this.set.preview.mozCaptureStream;
            this.set.mimeChoiceWrapper.classList.add("hide");
            this.set.headerText.classList.add("is-recording");
            this.set.preview.classList.add("visible");
            this.set.stop.classList.add("visible");
            this.appendStatusNotification("start");
        });
        this.set.stop.addEventListener("click", ()=>{
            this.set.mediaRecorder.stop();
            this.set.preview.srcObject = null;
            this.set.headerText.classList.remove("is-recording");
            this.set.headerText.classList.add("is-reviewing");
            this.set.stop.classList.remove("visible");
            this.set.download.classList.add("visible");
            this.appendStatusNotification("stop");
        });
    }
}
exports.default = recorderClass;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"ciiiV"}],"ciiiV":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"8ZSHi":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
class themeTogglerClass {
    constructor(){
        if (!themeTogglerClass.instance) {
            this.set = {
                toggler: document.querySelector(".sh__toggler"),
                icons: document.querySelectorAll(".sh__toggler--icon"),
                moon: document.querySelector(".sh__toggler-btn--moon"),
                sun: document.querySelector(".sh__toggler-btn--sun")
            };
            themeTogglerClass.instance = this;
        }
        return themeTogglerClass.instance;
    }
    activateDarkMode() {
        document.body.dataset.theme = "dark";
        this.set.moon.classList.remove("active");
        this.set.sun.classList.add("active");
    }
    activateLightMode() {
        document.body.dataset.theme = "light";
        this.set.sun.classList.remove("active");
        this.set.moon.classList.add("active");
    }
    getPreferredTheme() {
        window.matchMedia("(prefers-color-scheme: dark)").matches ? this.activateDarkMode() : this.activateLightMode();
    }
    init() {
        this.getPreferredTheme();
        this.set.toggler.addEventListener("click", ()=>{
            if (document.body.dataset.theme) {
                if (document.body.dataset.theme === "light") this.activateDarkMode();
                else this.activateLightMode();
            }
        });
        // Listen for OS theme changes
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e)=>{
            if (e.matches) this.activateDarkMode();
            else this.activateLightMode();
        });
    }
}
exports.default = themeTogglerClass;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"ciiiV"}]},["cSv3F","3auaO"], "3auaO", "parcelRequire4bdf")

//# sourceMappingURL=index.8b7fb9b3.js.map
