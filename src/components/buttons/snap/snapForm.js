import {
	html
} from "https://esm.sh/lit-element";
import {
	UtBase
} from "../../../utilities/base.js";
import "./form/preview.js";
import "./form/region.js";
import "./form/rotation.js";
import "./form/qualityFormat.js";
import "./form/size.js";

export class CpSnapForm extends UtBase {
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
			quality: {
				type: String
			},
			format: {
				type: String
			},
			size: {
				type: String
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
		this.quality = "default";
		this.format = "jpg";
		this.size = "full";
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
					quality: this.quality,
					format: this.format,
					size: this.size,
				},
				bubbles: true,
				composed: true,
			})
		);
	}

	render() {
  return html`
    <div
      class="flex flex-col gap-4"
      style="min-width: 550px; margin: 0 auto; padding: 1rem;"
    >
      <div
        class="flex flex-row flex-wrap gap-6"
        style="align-items: flex-start;"
      >
        <cp-spregion
          class="flex-grow min-w-[220px] max-w-full"
          .region="${this.region}"
          .width="${this.width}"
          .height="${this.height}"
          .coordX1="${this.coordX1}"
          .coordY1="${this.coordY1}"
          .coordX2="${this.coordX2}"
          .coordY2="${this.coordY2}"
          @region-updated="${(e) => {
            const d = e.detail;
            this.region = d.region;
            this.coordX1 = d.coordX1;
            this.coordY1 = d.coordY1;
            this.coordX2 = d.coordX2;
            this.coordY2 = d.coordY2;
            this._emitChange();
          }}"
        ></cp-spregion>

        <cp-spsize
          class="flex-grow min-w-[220px] max-w-full"
          @size-updated="${(e) => {
            this.size = e.detail.size;
            this._emitChange();
          }}"
        ></cp-spsize>

        <cp-sprotation
          class="flex-grow min-w-[220px] max-w-full"
          .rotation="${this.rotation}"
          .mirror="${this.mirror}"
          @rotation-updated="${(e) => {
            this.rotation = e.detail.rotation;
            this.mirror = e.detail.mirror;
            this._emitChange();
          }}"
        ></cp-sprotation>

        <cp-spqltfrmt
          class="flex-grow min-w-[220px] max-w-full"
          .quality="${this.quality}"
          .format="${this.format}"
          @quality-updated="${(e) => {
            this.quality = e.detail.quality;
            this.format = e.detail.format;
            this._emitChange();
          }}"
        ></cp-spqltfrmt>
      </div>

      <div class="self-start max-w-[250px]">
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
          .quality="${this.quality}"
		  .size="${this.size}"
        ></cp-preview>
      </div>
    </div>
  `;
}

}

customElements.define("cp-snapform", CpSnapForm);