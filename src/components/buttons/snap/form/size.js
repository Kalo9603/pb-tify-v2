import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormSize extends UtBase {
  static get properties() {
    return {
      mode: { type: String },
      width: { type: Number },
      height: { type: Number },
      percent: { type: Number },
      upscale: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.mode = "full";
    this.width = 0;
    this.height = 0;
    this.percent = 100;
    this.upscale = false;
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
    const needsWidth = ["width", "bestfit", "exact"].includes(this.mode);
    const needsHeight = ["height", "bestfit", "exact"].includes(this.mode);
    const needsPct = this.mode === "pct";
    const supportsUpscale = ["width", "height", "pct", "bestfit", "exact", "max"].includes(this.mode);

    return html`
      <div class="flex flex-col gap-3 w-full">
        <label class="text-lg font-bold text-gray-900">Scale</label>

        <select
          class="w-40 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"
          @change="${e => {
            this.mode = e.target.value;
            this._emitChange();
          }}"
        >
          <option value="full">full</option>
          <option value="max">max</option>
          <option value="width">width</option>
          <option value="height">height</option>
          <option value="pct">percentage</option>
          <option value="bestfit">best fit</option>
          <option value="exact">exact</option>
        </select>

        ${needsPct ? html`
          <label class="text-sm text-gray-800 font-semibold flex items-center gap-1">
            <input
              type="number"
              .value="${this.percent}"
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
                    .value="${this.width}"
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
                    .value="${this.height}"
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
              .checked="${this.upscale}"
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