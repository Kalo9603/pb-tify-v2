import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormQltFrmt extends UtBase {
  static get properties() {
    return {
      quality: { type: String },
      format: { type: String },
    };
  }

  constructor() {
    super();
    this.quality = "default";
    this.format = "jpg";
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

  render() {
    return html`
      <div class="flex flex-col gap-5 w-full">
        <div>
          <label
            for="quality"
            class="block mb-2 text-lg font-bold text-gray-900"
            >Quality</label
          >
          <select
            id="quality"
            .value="${this.quality}"
            @change="${this.onQualityChange}"
            class="w-40 rounded border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          >
            <option value="default">default</option>
            <option value="color">color</option>
            <option value="gray">gray</option>
            <option value="bitonal">bitonal</option>
          </select>
        </div>

        <div>
          <label
            for="format"
            class="block mb-2 text-lg font-bold text-gray-900"
            >Format</label
          >
          <select
            id="format"
            .value="${this.format}"
            @change="${this.onFormatChange}"
            class="w-40 rounded border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          >
            <option value="jpg">jpg</option>
            <option value="png">png</option>
            <option value="gif">gif</option>
            <option value="jp2">jp2</option>
            <option value="tif">tif</option>
            <option value="webp">webp</option>
            <option value="pdf">pdf</option>
          </select>
        </div>
      </div>
    `;
  }
}

customElements.define("cp-spqltfrmt", CpSnapFormQltFrmt);