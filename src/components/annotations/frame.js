import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpAnFrame extends UtBase {
  static get properties() {
    return {
      url: { type: String },
      x: { type: Number },
      y: { type: Number },
      w: { type: Number },
      h: { type: Number },
      visible: { type: Boolean },
      color: { type: String },
    };
  }

  constructor() {
    super();
    this.url = "";
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.visible = false;
    this.color = "view";

    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.scaledWidth = 0;
    this.scaledHeight = 0;

    this.scaleFactor = 0.1;
    this.minScale = 1;
    this.maxScale = 10;
    this._wheelAttached = false;
  }

  willUpdate(changedProps) {
    if (changedProps.has("url") && this.url) {

      this.naturalWidth = 0;
      this.naturalHeight = 0;
      this.scaledWidth = 0;
      this.scaledHeight = 0;

      this.updateComplete.then(() => {
        const img = this.renderRoot.querySelector("img");
        if (img) {
          if (img.complete) {
            this._onImageLoad(img);
          } else {
            img.onload = () => this._onImageLoad(img);
          }
        }
      });
    }

    if (changedProps.has("color")) {
      this.requestUpdate();
    }
  }

  updated() {
    const container = this.renderRoot.querySelector(".image-container");
    if (container && !this._wheelAttached) {
      container.addEventListener("wheel", this._onWheel.bind(this), { passive: false });
      this._wheelAttached = true;
    }
  }

  _onImageLoad(img) {
    const maxDim = 400;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;

    const ratio = Math.min(maxDim / this.naturalWidth, maxDim / this.naturalHeight);
    this.minScale = ratio;
    this.scaleFactor = 1;

    this.scaledWidth = this.naturalWidth * this.scaleFactor * this.minScale;
    this.scaledHeight = this.naturalHeight * this.scaleFactor * this.minScale;

    this.requestUpdate();
  }

  _onWheel(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    let newScale = this.scaleFactor;

    if (delta < 0) {
      newScale *= 1.1;
    } else {
      newScale /= 1.1;
    }

    newScale = Math.max(1, Math.min(newScale, this.maxScale));

    if (newScale !== this.scaleFactor) {
      this.scaleFactor = newScale;
      this.scaledWidth = this.naturalWidth * this.scaleFactor * this.minScale;
      this.scaledHeight = this.naturalHeight * this.scaleFactor * this.minScale;
      this.requestUpdate();
    }
  }

  get scaledRect() {
    if (!this.naturalWidth || !this.naturalHeight) return null;
    const scaleX = this.scaledWidth / this.naturalWidth;
    const scaleY = this.scaledHeight / this.naturalHeight;
    return {
      left: this.x * scaleX,
      top: this.y * scaleY,
      width: this.w * scaleX,
      height: this.h * scaleY,
    };
  }

  render() {
    if (!this.visible || !this.url) return null;

    const rect = this.scaledRect;
    const width = this.scaledWidth || 300;
    const height = this.scaledHeight || 300;
    const colorClassMap = {
      add: 'border-green-600 bg-green-600/30',
      edit: 'border-orange-500 bg-orange-500/30',
      delete: 'border-red-600 bg-red-600/30',
      view: 'border-blue-600 bg-blue-600/30',
    };

    const colorClass = colorClassMap[this.color?.trim()] || colorClassMap['view'];

    return html`
      <div class="overflow-auto max-h-[80vh] border border-gray-200 rounded-xl p-4 mt-4 shadow-sm bg-white">
        <div class="text-lg font-semibold text-gray-800 mb-4">
          🧩 Annotation Frame
        </div>
        <div
          class="relative rounded-lg overflow-hidden shadow border border-gray-300 m-auto image-container"
          style="width: ${width}px; height: ${height}px;"
        >
          <img
            src="${this.url}"
            alt="Annotation image"
            class="absolute top-0 left-0 w-full h-full object-contain z-0"
          />
          ${rect
            ? html`<div
                class="absolute z-10 border-2 ${colorClass} rounded-sm pointer-events-none box-border"
                style="
                  left: ${rect.left}px;
                  top: ${rect.top}px;
                  width: ${rect.width}px;
                  height: ${rect.height}px;
                "
              ></div>`
            : null}
        </div>
      </div>
    `;
  }
}

customElements.define("cp-anframe", CpAnFrame);