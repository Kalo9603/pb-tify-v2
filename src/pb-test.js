import { html } from "https://esm.sh/lit-element";
import { UtBase } from "./utilities/base.js";
import { detectIIIFVersion, convertV3toV2, getLanguages } from "./utilities/lib/manifest.js";

import "./components/load/inputBar.js";
import "./components/load/manifestImport.js";
import "./components/buttons/manifestExport.js";
import "./components/buttons/manifestURLCopy.js";
import "./components/buttons/close.js";
import "./components/buttons/languageSelector.js";
import "./components/buttons/snapshot.js";

import "./components/viewer/tifyWrapper.js";
import "./components/viewer/metadata.js";
import "./components/viewer/pageMetadata.js";
import "./components/viewer/title.js";

export class PbTest extends UtBase {
  static get properties() {
    return {
      manifestUrl: { type: String },
      manifestObject: { type: Object },
      isLocalManifest: { type: Boolean },
      selectedLanguage: { type: String },
      availableLanguages: { type: Array },
      currentCanvasIndex: { type: Number },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestUrl = "";
    this.manifestObject = null;
    this.isLocalManifest = false;
    this.selectedLanguage = "";
    this.availableLanguages = [];
    this.currentCanvasIndex = 0;

    this.handleURLSubmit = this.handleURLSubmit.bind(this);
    this.handleManifestLoad = this.handleManifestLoad.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this._onCanvasChange = this._onCanvasChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("URLsubmit", this.handleURLSubmit);
    this.addEventListener("manifestload", this.handleManifestLoad);
    this.addEventListener("languagechange", this.handleLanguageChange);
    this.addEventListener("canvaschange", this._onCanvasChange);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("URLsubmit", this.handleURLSubmit);
    this.removeEventListener("manifestload", this.handleManifestLoad);
    this.removeEventListener("languagechange", this.handleLanguageChange);
    this.removeEventListener("canvaschange", this._onCanvasChange);
  }

  async handleURLSubmit(e) {
    const url = e.detail.url;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch manifest");
      const manifest = await res.json();
      this.loadManifest(manifest, url, false);
    } catch (err) {
      console.error(err);
      this.clearManifest();
    }
  }

  handleManifestLoad(e) {
    const manifest = e.detail.manifestData;
    this.loadManifest(manifest, "", true);
  }

  handleLanguageChange(e) {
    this.selectedLanguage = e.detail.language;
  }

  _onCanvasChange(e) {
    this.currentCanvasIndex = e.detail.canvasIndex;
  }

  loadManifest(manifest, url = "", isLocal = false) {
    const version = detectIIIFVersion(manifest);
    let processed;
    if (version === "3") processed = convertV3toV2(manifest);
    else if (version === "2") processed = manifest;
    else {
      console.warn("Unknown IIIF version");
      this.clearManifest();
      return;
    }

    this.manifestObject = processed;
    this.isLocalManifest = isLocal;
    this.manifestUrl = isLocal
      ? this.extractFirstId(processed) || ""
      : url;

    const langs = getLanguages(processed);
    this.availableLanguages = langs;
    this.selectedLanguage = langs[0] || "";
    this.currentCanvasIndex = 0;
  }

  clearManifest() {
    this.manifestUrl = "";
    this.manifestObject = null;
    this.isLocalManifest = false;
    this.availableLanguages = [];
    this.selectedLanguage = "";
    this.currentCanvasIndex = 0;
  }

  extractFirstId(m) {
    if (m["@id"]) return m["@id"];
    if (m.items?.[0]?.["@id"]) return m.items[0]["@id"];
    const seq = m.sequences?.[0];
    if (seq?.canvases?.[0]?.["@id"]) return seq.canvases[0]["@id"];
    return "";
  }

  handleClose() {
    this.clearManifest();
    this.requestUpdate();
  }

  render() {
    const isLoaded = !!this.manifestObject;
    const showLangSelector = this.availableLanguages.length > 1;

    return html`
      <div class="p-8">
        <div class="flex items-center justify-center gap-4">
          <cp-input-bar class="flex-grow max-w-[60%]" @URLsubmit></cp-input-bar>
          <cp-mimport></cp-mimport>
        </div>
      
        <div class=${isLoaded ? "w-[85%] mx-auto my-8" : "hidden"}>
          <div class="mb-4 border rounded p-2 flex items-center justify-between">
            <div class="flex items-center gap-4">
              ${this.isLocalManifest ? html`
                <div class="relative group flex items-center justify-center w-12 h-12 text-blue-600">
                  <i class="fas fa-folder-open text-3xl"></i>
                  <div class="absolute bottom-full mb-2 px-4 py-2 text-sm text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    This manifest has been imported locally.
                  </div>
                </div>` : null}
              <cp-mexport .manifestObject=${this.manifestObject}></cp-mexport>
              <cp-url-copy .url=${this.manifestUrl}></cp-url-copy>
            </div>
            <div class="flex items-center gap-4">
              ${showLangSelector ? html`<cp-lselector .availableLanguages=${this.availableLanguages} .selectedLanguage=${this.selectedLanguage}></cp-lselector>` : null}
              <cp-close @close=${this.handleClose}></cp-close>
            </div>
          </div>

          <div class="flex items-center justify-center mb-4">
            <cp-title .manifestObject=${this.manifestObject} .selectedLanguage=${this.selectedLanguage}></cp-title>
          </div>

          <div class="flex gap-6">
            <div class="flex-1 max-w-[65%]">
              <cp-tf-wrapper
                .manifestObject=${this.manifestObject}
                .canvasIndex=${this.currentCanvasIndex}
                @canvaschange=${(e) => { this.currentCanvasIndex = e.detail.canvasIndex; }}
              ></cp-tf-wrapper>
            </div>
            <div class="w-[35%]">
              <cp-mdata .manifestObject=${this.manifestObject} .selectedLanguage=${this.selectedLanguage}></cp-mdata>
              <cp-pgmdata
                .manifestObject=${this.manifestObject}
                .canvasIndex=${this.currentCanvasIndex}
              ></cp-pgmdata>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("pb-test", PbTest);