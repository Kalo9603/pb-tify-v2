import {
  LitElement,
  html,
  css
} from "https://esm.sh/lit-element";
import {
  validateCoordinates
} from "../../../utilities/lib/utils.js";
import "./preview.js";

export class CpSnapForm extends LitElement {
  static get properties() {
    return {
      region: {
        type: String
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      coordX1: {
        type: Number
      },
      coordY1: {
        type: Number
      },
      coordX2: {
        type: Number
      },
      coordY2: {
        type: Number
      },
      rotation: {
        type: Number
      },
      mirror: {
        type: Boolean
      },
    };
  }

  constructor() {
    super();
    this.region = "full";
    this.width = 0;
    this.height = 0;
    this.coordX1 = 0;
    this.coordY1 = 0;
    this.coordX2 = 0;
    this.coordY2 = 0;
    this.rotation = 0;
    this.mirror = false;
  }

  onRegionChange(e) {
    this.region = e.target.value;
    if (this.region !== "coordinates" && this.region !== "coordinates%") {
      this.coordX1 = 0;
      this.coordY1 = 0;
      this.coordX2 = 0;
      this.coordY2 = 0;
    }
    this._emitChange();
  }

  onCoordChange(e, coordName) {
    let val = Number(e.target.value);
    this[coordName] = val;

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

  onRotationChange(e) {
    let val = Number(e.target.value);
    if (val < 0) val = 0;
    if (val > 360) val = 360;
    this.rotation = val;
    this._emitChange();
  }

  onMirrorChange(e) {
    this.mirror = e.target.checked;
    this._emitChange();
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("region-change", {
        detail: {
          region: this.region,
          coordX1: this.coordX1,
          coordY1: this.coordY1,
          coordX2: this.coordX2,
          coordY2: this.coordY2,
          rotation: this.rotation,
          mirror: this.mirror,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css `
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }

    cp-preview {
      margin-top: 1.5rem;
      margin-left: 0;
      align-self: flex-start;
    }

    .form-row {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: nowrap;
      margin-bottom: 1rem;
    }

    label {
      display: flex;
      align-items: center;
      font-weight: 500;
      min-width: 5em;
      margin-bottom: 0.3em;
    }

    select,
    input[type="number"] {
      padding: 0.25em 0.5em;
      font-size: 1em;
      border-radius: 4px;
      border: 1px solid #ccc;
      max-width: 150px;
    }

    .coordinates-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: flex-start;
      margin-top: 1rem;
    }

    .coords-group {
      display: flex;
      flex-direction: column;
      gap: 0.3em;
    }

    input[type="number"] {
      width: 5em;
    }

    .subscript {
      font-size: 0.6em;
      vertical-align: sub;
      margin-left: 0.1em;
    }

    .rotation-mirror {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 0.8em;
      min-width: 100px;
    }

    .rotation-input {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }

    .mirror-label {
      display: flex;
      align-items: center;
      gap: 0.3em;
      font-weight: 600;
    }

    .mirror-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
  `;

  render() {

    const stepVal = this.region === "coordinates%" ? 0.01 : 1;

    return html `
      <div class="form-row">

        <div class="region-coordinates-block">
          <div class="region-select">
            <label for="r-select">Region</label>
            <select id="r-select" @change="${this.onRegionChange}" .value="${this.region}">
              <option value="full">full</option>
              <option value="square">square</option>
              <option value="coordinates">coordinates</option>
              <option value="coordinates%">coordinates %</option>
            </select>
          </div>

          ${(this.region === "coordinates" || this.region === "coordinates%") ? html`
            <div class="coordinates-container">
              <div class="coords-group">
                <label>
                  x<span class="subscript">1</span>:
                  <input
                    type="number"
                    min="0"
                    max="${this.region === "coordinates%" ? 100 : this.width}"
                    step="${stepVal}"
                    .value="${this.coordX1}"
                    @input="${(e) => this.onCoordChange(e, "coordX1")}"
                  />
                </label>
                <label>
                  y<span class="subscript">1</span>:
                  <input
                    type="number"
                    min="0"
                    max="${this.region === "coordinates%" ? 100 : this.height}"
                    step="${stepVal}"
                    .value="${this.coordY1}"
                    @input="${(e) => this.onCoordChange(e, "coordY1")}"
                  />
                </label>
              </div>

              <div class="coords-group">
                <label>
                  x<span class="subscript">2</span>:
                  <input
                    type="number"
                    min="0"
                    max="${this.region === "coordinates%" ? 100 : this.width}"
                    step="${stepVal}"
                    .value="${this.coordX2}"
                    @input="${(e) => this.onCoordChange(e, "coordX2")}"
                  />
                </label>
                <label>
                  y<span class="subscript">2</span>:
                  <input
                    type="number"
                    min="0"
                    max="${this.region === "coordinates%" ? 100 : this.height}"
                    step="${stepVal}"
                    .value="${this.coordY2}"
                    @input="${(e) => this.onCoordChange(e, "coordY2")}"
                  />
                </label>
              </div>
            </div>
          ` : html``}
        </div>

        <div class="rotation-mirror">
          <div class="rotation-input">
            <label for="rotation-input">Rotation</label>
            <input
              id="rotation-input"
              type="number"
              min="0"
              max="360"
              .value="${this.rotation}"
              @input="${this.onRotationChange}"
              style="width: 4em;"
            />
          </div>

          <label class="mirror-label">
            <input
              type="checkbox"
              .checked="${this.mirror}"
              @change="${this.onMirrorChange}"
            />
            Flip before rotation
          </label>
        </div>
      </div>

      <cp-preview
        .region="${this.region}"
        .width="${this.width}"
        .height="${this.height}"
        .coordX1="${this.coordX1}"
        .coordY1="${this.coordY1}"
        .coordX2="${this.coordX2}"
        .coordY2="${this.coordY2}"
        .rotation="${this.rotation}"
        .mirror="${this.mirror}"
      ></cp-preview>
`;
  }
}

customElements.define("cp-snapform", CpSnapForm);