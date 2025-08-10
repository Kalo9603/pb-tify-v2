import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormSize extends UtBase {
  static get properties() {
    return {
      sizes: { type: Object },
      mode: { type: String },
      width: { type: Number },
      height: { type: Number },
      percent: { type: Number },
      upscale: { type: Boolean },
    };
  }

  constructor() {
    super();
  }

  firstUpdated() {
    if (this.size) {
      this._parseSizeToMode(this.size);
    }
    this._emitChange();
  }

  _emitChange() {
    let size = "full";
    const up = this.upscale ? "^" : "";

    switch (this.mode) {
      case "max":
        size = `${up}max`;
        break;
      case "width":
        size = `${up}${this.width},`;
        break;
      case "height":
        size = `${up},${this.height}`;
        break;
      case "pct":
        size = `${up}pct:${this.percent}`;
        break;
      case "bestfit":
        size = `${up}!${this.width},${this.height}`;
        break;
      case "exact":
        size = `${up}${this.width},${this.height}`;
        break;
    }

    this.dispatchEvent(new CustomEvent("size-updated", {
      detail: {
        size,
        upscale: this.upscale,
        mode: this.mode,
        width: this.width,
        height: this.height,
        percent: this.percent,
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.sizes) return html`Loading...`;

    const supports = this.sizes.supports || [];

    const modeSupportsMap = {
      full: true,
      max: true,
      width: supports.includes("sizeByW"),
      height: supports.includes("sizeByH"),
      pct: supports.includes("sizeByPct"),
      bestfit: supports.includes("sizeByConfinedWh"),
      exact: supports.some(s =>
        ["sizeByWh", "sizeByDistortedWh", "sizeByForcedWh"].includes(s)
      ),
    };

    const modesToShow = Object.entries(modeSupportsMap)
      .filter(([mode, supported]) => supported)
      .map(([mode]) => mode);

    const needsWidth = ["width", "bestfit", "exact"].includes(this.mode);
    const needsHeight = ["height", "bestfit", "exact"].includes(this.mode);
    const needsPct = this.mode === "pct";
    const supportsUpscale = ["width", "height", "pct", "bestfit", "exact", "max"].includes(this.mode);

    return html`
      <div class="flex flex-col gap-3 w-full">
        <label class="text-lg font-bold text-gray-900">Scale</label>

        <select
          class="w-40 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"
          .value="${this.mode || 'full'}"
          @change="${e => {
            this.mode = e.target.value;
            this._emitChange();
          }}"
        >
          ${modesToShow.map(mode => html`
            <option value="${mode}" ?selected=${this.mode === mode}>${mode}</option>
          `)}
        </select>

        ${needsPct ? html`
          <label class="text-sm text-gray-800 font-semibold flex items-center gap-1">
            <input
              type="number"
              .value="${this.percent || 100}"
              @input="${e => {
                this.percent = Number(e.target.value);
                this._emitChange();
              }}"
              class="w-24 rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
            />
            <span class="font-normal text-gray-700">%</span>
          </label>
        ` : null}

        ${needsWidth || needsHeight ? html`
          <div class="flex gap-4">
            ${needsWidth ? html`
              <label class="text-sm text-gray-800 font-semibold flex flex-col gap-1">
                <span>Width</span>
                <div class="flex items-center gap-1">
                  <input
                    type="number"
                    .value="${this.width || 0}"
                    @input="${e => {
                      this.width = Number(e.target.value);
                      this._emitChange();
                    }}"
                    class="w-24 rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
                  />
                  <span class="font-normal text-gray-700">px</span>
                </div>
              </label>` : null}

            ${needsHeight ? html`
              <label class="text-sm text-gray-800 font-semibold flex flex-col gap-1">
                <span>Height</span>
                <div class="flex items-center gap-1">
                  <input
                    type="number"
                    .value="${this.height || 0}"
                    @input="${e => {
                      this.height = Number(e.target.value);
                      this._emitChange();
                    }}"
                    class="w-24 rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
                  />
                  <span class="font-normal text-gray-700">px</span>
                </div>
              </label>` : null}
          </div>
        ` : null}

        ${supportsUpscale ? html`
          <label class="text-sm text-gray-800 font-semibold flex items-center gap-2">
            <input
              type="checkbox"
              .checked="${this.upscale || false}"
              @change="${e => {
                this.upscale = e.target.checked;
                this._emitChange();
              }}"
              class="rounded border-gray-300"
            />
            Upscale
          </label>
        ` : null}
      </div>
    `;
  }
}

customElements.define("cp-spsize", CpSnapFormSize);