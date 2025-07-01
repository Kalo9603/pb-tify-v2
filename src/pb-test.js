import { html } from "https://esm.sh/lit-element";
import { UtBase } from "./utilities/base.js";

import {
  detectIIIFVersion,
  convertV3toV2,
} from "./utilities/lib/manifest.js";

import "./components/load/inputBar.js";
import "./components/load/manifestImport.js";
import "./components/buttons/manifestExport.js";
import "./components/buttons/manifestURLCopy.js";
import "./components/buttons/close.js";
import "./components/viewer/tifyWrapper.js";
import "./components/viewer/metadata.js";

export class PbTest extends UtBase {
  static get properties() {
    return {
      manifestUrl: { type: String },
      manifestObject: { type: Object },
      isLocalManifest: { type: Boolean },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestUrl = "";
    this.manifestObject = null;
    this.isLocalManifest = false;
    this.handleURLSubmit = this.handleURLSubmit.bind(this);
    this.handleManifestLoad = this.handleManifestLoad.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("URLsubmit", this.handleURLSubmit);
    this.addEventListener("manifestload", this.handleManifestLoad);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("URLsubmit", this.handleURLSubmit);
    this.removeEventListener("manifestload", this.handleManifestLoad);
  }

  async handleURLSubmit(e) {
    const url = e.detail.url;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch manifest");
      const manifest = await res.json();
      this.loadManifest(manifest, url, false); 
    } catch (err) {
      console.error("Error loading manifest:", err);
      this.manifestUrl = "";
      this.manifestObject = null;
      this.isLocalManifest = false;
    }
  }

  handleManifestLoad(e) {
    const manifest = e.detail.manifestData;
    this.loadManifest(manifest, "", true); 
  }

  loadManifest(manifest, url = "", isLocal = false) {
    const version = detectIIIFVersion(manifest);

    console.log("Manifest caricato:", manifest);

    if (version === "3") {
      const converted = convertV3toV2(manifest);
      this.manifestObject = converted;

      if (isLocal) {
        this.manifestUrl = this.extractFirstId(converted) || "";
        this.isLocalManifest = true;
      } else {
        this.manifestUrl = url;
        this.isLocalManifest = false;
      }
    } else if (version === "2") {
      this.manifestObject = manifest;

      if (isLocal) {
        this.manifestUrl = this.extractFirstId(manifest) || "";
        this.isLocalManifest = true;
      } else {
        this.manifestUrl = url;
        this.isLocalManifest = false;
      }
    } else {
      console.warn("Unknown IIIF version");
      this.manifestObject = null;
      this.manifestUrl = "";
      this.isLocalManifest = false;
    }
  }

  extractFirstId(manifest) {
    if (manifest["@id"]) return manifest["@id"];

    if (manifest.items && manifest.items.length > 0 && manifest.items[0]["@id"]) {
      return manifest.items[0]["@id"];
    }

    if (
      manifest.sequences &&
      manifest.sequences.length > 0 &&
      manifest.sequences[0].canvases &&
      manifest.sequences[0].canvases.length > 0 &&
      manifest.sequences[0].canvases[0]["@id"]
    ) {
      return manifest.sequences[0].canvases[0]["@id"];
    }
    return "";
  }

  handleClose() {
    this.manifestObject = null;
    this.manifestUrl = "";
    this.isLocalManifest = false;
    this.requestUpdate();
  }

  render() {
    const isLoaded = !!this.manifestObject;

    return html`

      <div class="p-8 flex items-center justify-center gap-4" style="height: 48px;">
        <cp-input-bar targetPath="/view" class="flex-grow max-w-[60%]"></cp-input-bar>
        <cp-mimport></cp-mimport>
      </div>

      <div class=${isLoaded ? 'w-[85%] mx-auto my-8' : 'hidden'}>

      <div class="mb-4 border rounded p-2 flex items-center justify-between">

        <div class="flex items-center gap-4">

          ${this.isLocalManifest ? html`
            <div class="relative group flex items-center justify-center w-12 h-12 text-blue-600 cursor-default">
              <i class="fas fa-folder-open text-3xl"></i>
              <div
                class="absolute bottom-full mb-2 px-4 py-2 text-sm text-white bg-gray-800 rounded shadow-lg
                opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300
                pointer-events-none z-10 min-w-[220px] text-center"
              >
                This manifest has been imported locally.
              </div>
            </div>
          ` : null}

          <cp-mexport .manifestObject=${this.manifestObject}></cp-mexport>
          <cp-url-copy .url=${this.manifestUrl}></cp-url-copy>

        </div>

        <div class="flex items-center gap-4">

          <cp-close @close=${this.handleClose}></cp-close>

        </div>

      </div>

        <div class="flex gap-6">
          <div class="flex-1 max-w-[65%]">
            <cp-tf-wrapper .manifestObject=${this.manifestObject}></cp-tf-wrapper>
          </div>
          <div class="w-[35%]">
            <cp-mdata .manifestObject=${this.manifestObject}></cp-mdata>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("pb-test", PbTest);