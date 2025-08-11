import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";
import { parseImageAPI } from "../../../utilities/lib/parse.js";
import "./snapForm.js";

import { parseIIIFUrl } from "../../../utilities/lib/parse.js";

import {
  buildRegionString,
  getCurrentDateYYYYMMDD,
  sanitizeFilename,
  downloadImage,
  centerPopupPosition
} from "../../../utilities/lib/utils.js";
import { config } from "../../../utilities/config.js";

export class CpSnap extends UtBase {
  static get properties() {
    return {
      imageData: { type: Object },
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      showSnapshot: { type: Boolean },
      isHovered: { type: Boolean },
      regionSelection: { type: String },
      coords: { type: Object },
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
    this.canvasIndex = config.canvas.canvasIndexDefault;
    this.showSnapshot = false;
    this.isHovered = false;
    this.regionSelection = config.snapshot.region;
    this.coords = config.snapshot.coords;
    this.rotation = config.snapshot.rotation;
    this.mirror = config.snapshot.mirror;
    this.quality = config.snapshot.quality;
    this.format = config.snapshot.format;
    this.size = config.snapshot.size;
    this.upscale = config.snapshot.upscale;
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

  onSnapClick() {

    const parts = this.parsedIIIFParts;
    if (!parts) return;

    const regionStr = buildRegionString(
      this.regionSelection,
      this.coords.p1[0],
      this.coords.p1[1],
      this.coords.p2[0],
      this.coords.p2[1]
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
      regionWidth = Math.abs(this.coords.p2[0] - this.coords.p1[0]);
      regionHeight = Math.abs(this.coords.p2[1] - this.coords.p1[1]);
    } else if (this.regionSelection === "coordinates%") {
      regionWidth = Math.abs(this.coords.p2[0] - this.coords.p1[0]) * (this.currentResource?.width ?? 0) / 100;
      regionHeight = Math.abs(this.coords.p2[1] - this.coords.p1[1]) * (this.currentResource?.height ?? 0) / 100;
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
    this.requestUpdate();
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
  }

  render() {
    const resource = this.currentResource;
    const isActive = this.showSnapshot;
    const iconToShow = isActive && this.isHovered ? "close" : "camera";

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
          <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
            ${iconToShow === "camera"
              ? html`<i class="fa-solid fa-camera fa-lg"></i>`
              : html`<i class="fa-solid fa-xmark fa-lg"></i>`}

            <span class="text-sm font-medium whitespace-nowrap transition-all duration-300
              opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
              ${this.showSnapshot ? "Close" : "Snapshot"}
            </span>
          </div>
        </button>

        ${this.showSnapshot && resource && parts
          ? html`
              <div class="absolute z-40 top-full mt-4 left-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-4xl w-fit animate-fadeIn break-words flex flex-col gap-2">
                <cp-snapform
                  .imageData="${this.imageData}"
                  .region="${this.regionSelection}"
                  .width="${resource.width}"
                  .height="${resource.height}"
                  .coords="${this.coords}"
                  .rotation="${this.rotation}"
                  .mirror="${this.mirror}"
                  .quality="${this.quality}"
                  .format="${this.format}"
                  .size="${this.size}"
                  .upscale="${this.upscale}"
                  @region-change="${e => {
                    const detail = e.detail;
                    this.regionSelection = detail.region;
                    this.coords = detail.coords;
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
                    <i class="fa-solid fa-camera fa-sm mr-2"></i>
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