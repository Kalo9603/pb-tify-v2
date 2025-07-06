import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpAnTooltip extends UtBase {
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

  updated(changedProps) {
    if (changedProps.has("url")) {
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      this.scaledWidth = 0;
      this.scaledHeight = 0;
    }
  }

  firstUpdated() {
    this.updateComplete.then(() => {
      const img = this.renderRoot.querySelector("img");
      if (img) {
        img.onload = () => {
          const maxDim = 300;
          this.naturalWidth = img.naturalWidth;
          this.naturalHeight = img.naturalHeight;

          const ratio = Math.min(
            maxDim / this.naturalWidth,
            maxDim / this.naturalHeight
          );

          this.scaledWidth = this.naturalWidth * ratio;
          this.scaledHeight = this.naturalHeight * ratio;
          this.requestUpdate();
        };
      }
    });
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

    return html`
      <div
        class="relative p-1 bg-white border border-gray-300 rounded shadow-lg"
        style="width: ${this.scaledWidth}px; height: ${this.scaledHeight}px;"
      >
        <img
          src="${this.url}"
          class="w-full h-full object-contain block"
        />
        ${rect
          ? html`
              <div
                class="absolute border-2 border-blue-600 bg-blue-400/30 pointer-events-none"
                style="
                  left: ${rect.left}px;
                  top: ${rect.top}px;
                  width: ${rect.width}px;
                  height: ${rect.height}px;
                "
              ></div>
            `
          : null}
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-300"></div>
      </div>
    `;
  }
}

customElements.define("cp-antooltip", CpAnTooltip);