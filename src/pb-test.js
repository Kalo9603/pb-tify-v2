import { html } from "https://esm.sh/lit-element";
import { UtBase } from "./utilities/base.js";
import { detectIIIFVersion, getLanguages } from "./utilities/lib/manifest.js";

import "./components/load/inputBar.js";
import "./components/load/manifestImport.js";

export class PbTest extends UtBase {
  static get properties() {
    return {
      result: { type: String },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.result = "Waiting for input...";
    this.handleURLSubmit = this.handleURLSubmit.bind(this);
    this.handleManifestLoad = this.handleManifestLoad.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('URLsubmit', this.handleURLSubmit);
    this.addEventListener('manifestload', this.handleManifestLoad);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('URLsubmit', this.handleURLSubmit);
    this.removeEventListener('manifestload', this.handleManifestLoad);
  }

  handleManifestLoad(e) {
    const manifest = e.detail.manifestData;
    const version = detectIIIFVersion(manifest);
    const langs = getLanguages(manifest);
    this.result = `Loaded from file → IIIF Version: ${version}, ${langs.length} language(s)`;
  }

  handleURLSubmit(e) {
    const url = e.detail.url;
    this.result = "Loading from URL...";

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(manifest => {
        const version = detectIIIFVersion(manifest);
        const langs = getLanguages(manifest);
        this.result = `Loaded from URL → IIIF Version: ${version}, ${langs.length} language(s)`;
      })
      .catch(err => {
        this.result = `Error loading manifest: ${err.message}`;
      });
  }

  render() {
    return html`
      <div class="p-8">
        <cp-input-bar targetPath="/view"></cp-input-bar>
        <cp-mimport></cp-mimport>
      </div>
      <div class="my-8 flex items-center justify-center text-xl">
        ${this.result}
      </div>
    `;
  }
}

customElements.define('pb-test', PbTest);