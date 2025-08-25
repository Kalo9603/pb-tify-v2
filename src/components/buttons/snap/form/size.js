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
      imageWidth: { type: Number },
      imageHeight: { type: Number },
    };
  }

  constructor() {
    super();
  }

  firstUpdated() {
    if (this.mode || this.upscale !== undefined) {
      this._emitChange();
    }
  }

  _shouldShowUpscale() {
    const imageWidth = this.imageWidth || 0;
    const imageHeight = this.imageHeight || 0;

    switch (this.mode) {
      case "max":
        return true;
      case "width":
        return this.width > imageWidth;
      case "height":
        return this.height > imageHeight;
      case "pct":
        return this.percent > 100;
      case "bestfit":
      case "exact":
        return this.width > imageWidth || this.height > imageHeight;
      default:
        return false;
    }
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
    const supportsUpscale = this._shouldShowUpscale();

    return html`
      <div class="flex flex-col gap-3 w-full">
        <label class="text-lg font-bold text-gray-900">Scale</label>

        <div class="flex items-center gap-3">
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

          ${supportsUpscale
            ? html`
                <div class="relative group flex items-center justify-center w-max">
                  <button
                    @click="${() => {
                      this.upscale = !this.upscale;
                      this._emitChange();
                    }}"
                    class="flex items-center rounded-full shadow-xl transition-all duration-200 ease-linear px-3 py-2 w-12 hover:w-32 overflow-hidden h-10
                          ${this.upscale ? "bg-orange-700" : "bg-green-500"} 
                          ${this.upscale ? "hover:bg-red-700" : "hover:bg-green-600"} 
                          text-white"
                    aria-describedby="upscale-tooltip"
                  >
                    <div
                      class="flex items-center justify-center w-full transition-all duration-200 ease-linear group-hover:justify-start group-hover:gap-2"
                    >
                      <i
                        class="fa-solid fa-angles-up text-lg flex-shrink-0 transition-transform duration-200 ease-linear"
                        style="${this.upscale ? 'transform: rotate(180deg);' : 'transform: rotate(0deg);'}"
                      ></i>
                      <span
                        class="text-sm font-medium whitespace-nowrap transition-all duration-200 ease-linear opacity-0 w-0 overflow-hidden
                            group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                      >
                        ${!this.upscale ? "Upscale" : "Downscale" }
                      </span>
                    </div>
                  </button>

                  <div
                    id="upscale-tooltip"
                    role="tooltip"
                    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 text-sm text-white bg-gray-800 rounded shadow-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-linear w-fit min-w-[14rem] text-center break-words pointer-events-none"
                  >
                    Required for sizes larger than original
                  </div>
                </div>
              `
            : null}
        </div>

        ${needsPct ? html`
          <label class="text-sm text-gray-800 font-semibold flex items-center gap-1">
            <span class="mr-2">Percentage</span>
            <input
              type="number"
              .value="${this.percent || 100}"
              @input="${e => {
                this.percent = Number(e.target.value);
                this._emitChange();
              }}"
              class="w-[60px] rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
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
                    class="w-[60px] rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
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
                    class="w-[60px] rounded border border-gray-300 px-2 py-1 font-normal text-sm text-gray-900"
                  />
                  <span class="font-normal text-gray-700">px</span>
                </div>
              </label>` : null}
          </div>
        ` : null}
      </div>
    `;
  }
}

customElements.define("cp-spsize", CpSnapFormSize);