import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";
import { validateCoordinates } from "../../../../utilities/lib/utils.js";

export class CpSnapFormRegion extends UtBase {
  static get properties() {
    return {
      region: { type: String },
      width: { type: Number },
      height: { type: Number },
      coordX1: { type: Number },
      coordY1: { type: Number },
      coordX2: { type: Number },
      coordY2: { type: Number },
      regionData: { type: Object }
    };
  }

  constructor() {
    super();
    this.region = "full";
    this.width = this.height = 0;
    this.coordX1 = this.coordY1 = this.coordX2 = this.coordY2 = 0;
    this.regionData = { supports: [] };
  }

  updated(changedProps) {
    if (changedProps.has('regionData') || changedProps.has('region')) {
      this._validateRegion();
    }
  }

  _validateRegion() {
    const supports = this.regionData?.supports || [];
    if (this.region === "square" && !supports.includes("regionSquare")) {
      this.region = "full";
    } else if (this.region === "coordinates" && !supports.includes("regionByPx")) {
      this.region = "full";
    } else if (this.region === "coordinates%" && !supports.includes("regionByPct")) {
      this.region = "full";
    }
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("region-updated", {
        detail: {
          region: this.region,
          coordX1: this.coordX1,
          coordY1: this.coordY1,
          coordX2: this.coordX2,
          coordY2: this.coordY2,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  onRegionChange(e) {
    this.region = e.target.value;
    if (this.region !== "coordinates" && this.region !== "coordinates%") {
      this.coordX1 = this.coordY1 = this.coordX2 = this.coordY2 = 0;
    }
    this._emitChange();
  }

  onCoordChange(e, coordName) {
    this[coordName] = Number(e.target.value);
    const coords = validateCoordinates(
      this.region,
      this.width,
      this.height,
      this.coordX1,
      this.coordY1,
      this.coordX2,
      this.coordY2
    );
    this.coordX1 = coords.x1;
    this.coordY1 = coords.y1;
    this.coordX2 = coords.x2;
    this.coordY2 = coords.y2;
    this._emitChange();
  }

  render() {
    const stepVal = this.region === "coordinates%" ? 0.01 : 1;
    const unit = this.region === "coordinates%" ? "%" : "px";

    const supports = this.regionData?.supports || [];

    const options = [
      { value: "full", label: "full" },
      supports.includes("regionSquare") ? { value: "square", label: "square" } : null,
      supports.includes("regionByPx") ? { value: "coordinates", label: "coordinates" } : null,
      supports.includes("regionByPct") ? { value: "coordinates%", label: "coordinates %" } : null,
    ].filter(Boolean);

    if (!options.find(o => o.value === this.region)) {
      this.region = "full";
    }

    return html`
      <div class="w-full">
        <label
          for="r-select"
          class="block mb-2 text-lg font-bold text-gray-900"
        >
          Region
        </label>
        <select
          id="r-select"
          @change="${this.onRegionChange}"
          .value="${this.region}"
          class="w-40 rounded-md border-2 border-blue-600 bg-white px-2 py-1 text-sm text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-600 hover:border-blue-700 transition-colors"
        >
          ${options.map(
            (opt) => html`<option value="${opt.value}">${opt.label}</option>`
          )}
        </select>
      </div>

      ${["coordinates", "coordinates%"].includes(this.region)
        ? html`
            <div class="mt-4 flex gap-4 w-full">
              <div class="flex flex-col gap-3 flex-1">
                <label class="text-gray-800 text-sm font-semibold">
                  x<sub>1</sub>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      .value="${this.coordX1}"
                      step="${stepVal}"
                      @input="${(e) => this.onCoordChange(e, "coordX1")}"
                      class="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 font-normal
                        focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <span class="text-sm font-normal text-gray-600">${unit}</span>
                  </div>
                </label>

                <label class="text-gray-800 text-sm font-semibold">
                  y<sub>1</sub>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      .value="${this.coordY1}"
                      step="${stepVal}"
                      @input="${(e) => this.onCoordChange(e, "coordY1")}"
                      class="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 font-normal
                        focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <span class="text-sm font-normal text-gray-600">${unit}</span>
                  </div>
                </label>
              </div>

              <div class="flex flex-col gap-3 flex-1">
                <label class="text-gray-800 text-sm font-semibold">
                  x<sub>2</sub>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      .value="${this.coordX2}"
                      step="${stepVal}"
                      @input="${(e) => this.onCoordChange(e, "coordX2")}"
                      class="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 font-normal
                        focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <span class="text-sm font-normal text-gray-600">${unit}</span>
                  </div>
                </label>

                <label class="text-gray-800 text-sm font-semibold">
                  y<sub>2</sub>
                  <div class="flex items-center gap-1">
                    <input
                      type="number"
                      .value="${this.coordY2}"
                      step="${stepVal}"
                      @input="${(e) => this.onCoordChange(e, "coordY2")}"
                      class="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 font-normal
                        focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <span class="text-sm font-normal text-gray-600">${unit}</span>
                  </div>
                </label>
              </div>
            </div>
          `
        : null}
    `;
  }
}

customElements.define("cp-spregion", CpSnapFormRegion);