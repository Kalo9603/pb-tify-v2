import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormQltFrmt extends UtBase {
  
  static get properties() {
    return {
      qualities: { type: Array },
      formats: { type: Array },
      quality: { type: String },
      format: { type: String },
    };
  }

  constructor() {
    super();
    this.qualities = [];
    this.formats = [];
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("quality-updated", {
        detail: {
          quality: this.quality,
          format: this.format,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  onQualityChange(e) {
    this.quality = e.target.value;
    this._emitChange();
  }

  onFormatChange(e) {
    this.format = e.target.value;
    this._emitChange();
  }

  firstUpdated() {
    if (this.quality || this.format) {
      this._emitChange();
    }
  }

  render() {
    if (
      (!this.qualities || this.qualities.length === 0) &&
      (!this.formats || this.formats.length === 0)
    ) {
      return html``;
    }

    return html`
      <div class="flex flex-col gap-5 w-full">
        ${this.qualities && this.qualities.length > 0
          ? html`
              <div>
                <label
                  for="quality"
                  class="block mb-2 text-lg font-bold text-gray-900"
                  >Quality</label
                >
                <select
                  id="quality"
                  .value="${this.quality || ''}"
                  @change="${this.onQualityChange}"
                  class="w-40 rounded border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  ${this.qualities.map(
                    (q) => html`<option value="${q}" ?selected="${q === this.quality}">${q}</option>`
                  )}
                </select>
              </div>
            `
          : null}

        ${this.formats && this.formats.length > 0
          ? html`
              <div>
                <label
                  for="format"
                  class="block mb-2 text-lg font-bold text-gray-900"
                  >Format</label
                >
                <select
                  id="format"
                  .value="${this.format || ''}"
                  @change="${this.onFormatChange}"
                  class="w-40 rounded border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  ${this.formats.map(
                    (f) => html`<option value="${f}" ?selected="${f === this.format}">${f}</option>`
                  )}
                </select>
              </div>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("cp-spqltfrmt", CpSnapFormQltFrmt);