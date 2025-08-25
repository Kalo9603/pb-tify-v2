import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";
import { parseImageData } from "../../../utilities/lib/parse.js";
import { config } from "../../../utilities/config.js";
import "./form/preview.js";
import "./form/region.js";
import "./form/rotation.js";
import "./form/qualityFormat.js";
import "./form/size.js";

export class CpSnapForm extends UtBase {
  static get properties() {
    return {
      imageData: { type: Object },
      region: { type: String },
      width: { type: Number },
      height: { type: Number },
      coords: { type: Object },
      rotation: { type: Number },
      mirror: { type: Boolean },
      quality: { type: String },
      format: { type: String },
      size: { type: String },
      regions: { type: Array },
      rotations: { type: Array },
      sizes: { type: Array },
      qualities: { type: Array },
      formats: { type: Array },
      upscale: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.region = config.snapshot.region;
    this.width = config.snapshot.initialDimensions.width;
    this.height = config.snapshot.initialDimensions.height;
    this.coords = config.snapshot.coords;
    this.rotation = config.snapshot.rotation;
    this.mirror = config.snapshot.mirror;
    this.quality = config.snapshot.quality;
    this.format = config.snapshot.format;
    this.size = config.snapshot.size;
    this.upscale = config.snapshot.upscale;
    this.regions = [];
    this.rotations = [];
    this.sizes = [];
    this.qualities = [];
    this.formats = [];
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("region-change", {
        detail: {
          region: this.region,
          coords: this.coords,
          rotation: this.rotation,
          mirror: this.mirror,
          quality: this.quality,
          format: this.format,
          size: this.size,
          upscale: this.upscale
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  updated(changedProps) {
    if (changedProps.has('imageData')) {
      this.qualities = parseImageData(this.imageData, "quality");
      this.formats = parseImageData(this.imageData, "format");
      this.regions = parseImageData(this.imageData, "region");
      this.rotations = parseImageData(this.imageData, "rotation");
      this.sizes = parseImageData(this.imageData, "size");
      console.log(this.sizes);
    }
  }

  render() {
    return html`
      <div style="display: flex; gap: 5rem; max-width: 700px; margin: 0 auto; padding: 1rem;">
        <div style="display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; width: fit-content; height: fit-content;">
          <div style="display: flex; flex-direction: column; gap: 2.5rem;">
            ${this.regions ? html`
              <cp-spregion
                .regionData="${this.regions}"
                .region="${this.region}"
                .width="${this.width}"
                .height="${this.height}"
                .coords="${this.coords}"
                @region-updated="${(e) => {
                  const d = e.detail;
                  this.region = d.region;
                  this.coords = d.coords;
                  this._emitChange();
                }}"
              ></cp-spregion>
            ` : null}

            ${this.rotations ? html`
              <cp-sprotation
                .rotationData="${this.rotations}"
                .rotation="${this.rotation}"
                .mirror="${this.mirror}"
                @rotation-updated="${(e) => {
                  this.rotation = e.detail.rotation;
                  this.mirror = e.detail.mirror;
                  this._emitChange();
                }}"
              ></cp-sprotation>
            ` : null}
          </div>
          
          <cp-preview
            .region="${this.region}"
            .width="${this.width}"
            .height="${this.height}"
            .coords="${this.coords}"
            .rotation="${this.rotation}"
            .mirror="${this.mirror}"
            .quality="${this.quality}"
            .size="${this.size}"
            style="margin-top: 2rem;"
          ></cp-preview>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2.5rem; min-width: 220px; max-width: 320px; align-items: flex-start;">
          ${this.sizes ? html`
            <cp-spsize
              .sizes="${this.sizes}"
              .imageWidth="${this.width}"
              .imageHeight="${this.height}"
              @size-updated="${(e) => {
                this.size = e.detail.size;
                this.upscale = e.detail.upscale;
                this._emitChange();
              }}"
            ></cp-spsize>
          ` : null}

          ${this.qualities || this.formats ? html`
            <cp-spqltfrmt
              .qualities="${this.qualities}"
              .formats="${this.formats}"
              .quality="${this.quality}"
              .format="${this.format}"
              @quality-updated="${(e) => {
                this.quality = e.detail.quality;
                this.format = e.detail.format;
                this._emitChange();
              }}"
            ></cp-spqltfrmt>
          ` : null}
        </div>
      </div>
    `;
  }
}

customElements.define("cp-snapform", CpSnapForm);