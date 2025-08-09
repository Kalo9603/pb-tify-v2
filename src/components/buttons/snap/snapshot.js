import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";
import { parseImageAPI } from "../../../utilities/lib/parse.js";
import "./snapForm.js";

import {
  parseIIIFUrl,
  buildRegionString,
  getCurrentDateYYYYMMDD,
  sanitizeFilename,
  downloadImage,
  centerPopupPosition
} from "../../../utilities/lib/utils.js";

export class CpSnap extends UtBase {

  static get properties() {
    return {
      imageData: { type: Object },
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      showSnapshot: { type: Boolean },
      isHovered: { type: Boolean },
      regionSelection: { type: String },
      coordX1: { type: Number },
      coordY1: { type: Number },
      coordX2: { type: Number },
      coordY2: { type: Number },
      rotation: { type: Number },
      mirror: { type: Boolean },
      quality: { type: String },
      format: { type: String },
      size: { type: String },
      upscale: { type: Boolean },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.showSnapshot = false;
    this.isHovered = false;
    this.regionSelection = "full";
    this.coordX1 = 0;
    this.coordY1 = 0;
    this.coordX2 = 0;
    this.coordY2 = 0;
    this.rotation = 0;
    this.mirror = false;
    this.quality = "default";
    this.format = "jpg";
    this.size = "full";
    this.upscale = false;
  }

  toggleSnapshot() {
    this.showSnapshot = !this.showSnapshot;
  }

  handleMouseEnter() {
    this.isHovered = true;
  }

  handleMouseLeave() {
    this.isHovered = false;
  }

  get currentResource() {
    const canvases = this.manifestObject?.sequences?.[0]?.canvases ?? [];
    const canvas = canvases[this.canvasIndex];
    return canvas?.images?.[0]?.resource ?? null;
  }

  get parsedIIIFParts() {
    return parseIIIFUrl(this.currentResource?.["@id"]);
  }

  drawHighlightOnViewer() {
    if (!this._viewer?._tify?.app) return;

    const app = this._viewer._tify.app;
    const canvasEl = app?.canvas;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    setTimeout(() => {

      app.render();

      const W = canvasEl.width;
      const H = canvasEl.height;

      ctx.save();
      ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
      ctx.strokeStyle = "rgba(0, 120, 215, 0.9)";
      ctx.lineWidth = 3;

      if (this.regionSelection === "full") {
        ctx.fillRect(0, 0, W, H);
      } else if (this.regionSelection === "square") {
        const side = Math.min(W, H);
        const x = (W - side) / 2;
        const y = (H - side) / 2;
        ctx.fillRect(x, y, side, side);
        ctx.strokeRect(x, y, side, side);
      } else if (this.regionSelection === "coordinates" || this.regionSelection === "coordinates%") {
        let x1, y1, x2, y2;

        if (this.regionSelection === "coordinates") {
          x1 = (this.coordX1 / this.currentResource.width) * W;
          y1 = (this.coordY1 / this.currentResource.height) * H;
          x2 = (this.coordX2 / this.currentResource.width) * W;
          y2 = (this.coordY2 / this.currentResource.height) * H;
        } else {
          x1 = (this.coordX1 / 100) * W;
          y1 = (this.coordY1 / 100) * H;
          x2 = (this.coordX2 / 100) * W;
          y2 = (this.coordY2 / 100) * H;
        }

        const rectX = Math.min(x1, x2);
        const rectY = Math.min(y1, y2);
        const rectW = Math.abs(x2 - x1);
        const rectH = Math.abs(y2 - y1);

        ctx.fillRect(rectX, rectY, rectW, rectH);
        ctx.strokeRect(rectX, rectY, rectW, rectH);
      }
      ctx.restore();
    }, 50);
  }

  onSnapClick() {
    const parts = this.parsedIIIFParts;
    if (!parts) return;

    const regionStr = buildRegionString(
      this.regionSelection,
      this.coordX1,
      this.coordY1,
      this.coordX2,
      this.coordY2
    );

    let rotationStr = this.rotation === 0 ? "0" : this.rotation.toString();

    if (this.mirror) {
      rotationStr = "!" + rotationStr;
    }

    const newUrl = `${parts.prefix}/${parts.identifier}/${regionStr}/${this.size}/${rotationStr}/${this.quality}.${this.format}`;

    const dateStr = getCurrentDateYYYYMMDD();
    const safeTitle = sanitizeFilename(parts.identifier);
    const filename = `${safeTitle}_${dateStr}_${regionStr}_${this.size}_${rotationStr}_${this.quality}.${this.format}`;

    let regionWidth = 0;
    let regionHeight = 0;
    if (this.regionSelection === "full") {
      regionWidth = this.currentResource?.width ?? 0;
      regionHeight = this.currentResource?.height ?? 0;
    } else if (this.regionSelection === "square") {
      regionWidth = regionHeight = Math.min(this.currentResource?.width ?? 0, this.currentResource?.height ?? 0);
    } else if (this.regionSelection === "coordinates") {
      regionWidth = Math.abs(this.coordX2 - this.coordX1);
      regionHeight = Math.abs(this.coordY2 - this.coordY1);
    } else if (this.regionSelection === "coordinates%") {
      regionWidth = Math.abs(this.coordX2 - this.coordX1) * (this.currentResource?.width ?? 0) / 100;
      regionHeight = Math.abs(this.coordY2 - this.coordY1) * (this.currentResource?.height ?? 0) / 100;
    }

    const { left, top } = centerPopupPosition(regionWidth, regionHeight);

    const win = window.open(
      "",
      "_blank",
      `width=${regionWidth},height=${regionHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    win.document.write(`
      <html>
        <head><title>Snapshot | ${filename}</title></head>
        <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center;">
          <img src="${newUrl}" width="${regionWidth}" height="${regionHeight}" style="display:block;" />
        </body>
      </html>
    `);
    win.document.close();

    downloadImage(newUrl, filename);

    this.regionSelection = regionStr;
    this.requestUpdate();
    this.drawHighlightOnViewer();
  }


  async updated(changedProps) {

  if (changedProps.has("manifestObject")) {
    if (this.manifestObject) {
      try {
        this.imageData = await parseImageAPI(this.manifestObject);
      } catch (e) {
        console.error("Error fetching imageData:", e);
        this.imageData = null;
      }
      this.requestUpdate();
    }
  }

    if (
      changedProps.has("regionSelection") ||
      changedProps.has("coordX1") ||
      changedProps.has("coordY1") ||
      changedProps.has("coordX2") ||
      changedProps.has("coordY2")
    ) {
      this.drawHighlightOnViewer();
    }
  }

  render() {
    const resource = this.currentResource;
    const isActive = this.showSnapshot;
    const iconToShow = isActive && this.isHovered ? "close" : "camera";
    console.log(this.imageData);

    const color = isActive && this.isHovered
      ? "bg-red-600"
      : isActive
        ? "bg-orange-500"
        : "bg-blue-600";

    const hoverWidth = isActive ? "hover:w-28" : "hover:w-32";
    const parts = this.parsedIIIFParts;

    return html`
      <div class="relative flex flex-col items-start">
        <button
          @click="${this.toggleSnapshot}"
          @mouseenter="${this.handleMouseEnter}"
          @mouseleave="${this.handleMouseLeave}"
          title="Snapshot"
          class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 ${hoverWidth} overflow-hidden h-10
            ${color} text-white hover:shadow-md"
        >
          <div
            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
          >
            ${iconToShow === "camera"
              ? html`
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h4l2-3h6l2 3h4v12H3V7z" />
                  <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" />
                </svg>`
              : html`
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>`}

            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300
              opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >
              ${this.showSnapshot ? "Close" : "Snapshot"}
            </span>
          </div>
        </button>

        ${this.showSnapshot && resource && parts
            ? html`
                <div
                  class="absolute z-40 top-full mt-4 left-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-4xl w-fit animate-fadeIn break-words flex flex-col gap-2"
                >
                <cp-snapform
                    .imageData="${this.imageData}"
                    .region="${this.regionSelection}"
                    .width="${resource.width}"
                    .height="${resource.height}"
                    .coordX1="${this.coordX1}"
                    .coordY1="${this.coordY1}"
                    .coordX2="${this.coordX2}"
                    .coordY2="${this.coordY2}"
                    .rotation="${this.rotation}"
                    .mirror="${this.mirror}"
                    .quality="${this.quality}"
                    .format="${this.format}"
                    .size="${this.size}"
                    .upscale="${this.upscale}"

                    @region-change="${e => {

                    const detail = e.detail;
                    this.regionSelection = detail.region;
                    this.coordX1 = detail.coordX1;
                    this.coordY1 = detail.coordY1;
                    this.coordX2 = detail.coordX2;
                    this.coordY2 = detail.coordY2;
                    this.rotation = detail.rotation;
                    this.mirror = detail.mirror;
                    this.quality = detail.quality;
                    this.format = detail.format; 
                    this.size = detail.size;
                    this.upscale = detail.upscale ?? false;
                    this.requestUpdate();
                    }}"
                ></cp-snapform>

                <div class="flex justify-end">
                    <button
                    title="Snap!"
                    @click="${this.onSnapClick}"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 transition-all"
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h4l2-3h6l2 3h4v12H3V7z" />
                        <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span class="text-sm font-semibold">Snap!</span>
                    </button>
                </div>
                </div>
            `
            : null}
      </div>
    `;
  }
}

customElements.define("cp-snap", CpSnap);