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
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.scaledWidth = 0;
    this.scaledHeight = 0;
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
  }

  _onImageLoad(img) {
    const maxDim = 400;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;

    const ratio = Math.min(maxDim / this.naturalWidth, maxDim / this.naturalHeight);
    this.scaledWidth = this.naturalWidth * ratio;
    this.scaledHeight = this.naturalHeight * ratio;
    this.requestUpdate();
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

    return html`
      <div class="overflow-auto max-h-[80vh] border border-gray-200 rounded-xl p-4 mt-4 shadow-sm bg-white">
        <div class="text-lg font-semibold text-gray-800 mb-4">
          🧩 Annotation Frame
        </div>
        <div class="relative rounded-lg overflow-hidden shadow border border-gray-300 m-auto" style="width: ${width}px; height: ${height}px;">
          <img
            src="${this.url}"
            alt="Annotation image"
            class="absolute top-0 left-0 w-full h-full object-contain z-0"
          />
          ${rect
            ? html`<div
                class="absolute z-10 border-2 border-blue-600 bg-blue-600/30 rounded-sm pointer-events-none box-border"
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