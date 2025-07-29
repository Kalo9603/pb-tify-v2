import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { getMotivationIcon, sanitizeHTML, getColorVariant } from "../../utilities/lib/utils.js";

export class CpAnFrame extends UtBase {
  static get properties() {
    return {
      url: { type: String },
      annotations: { type: Array },
      zoom: { type: Number },
      _hoveredAnnotation: { type: Object },
      _tooltipPosition: { type: Object },
      mode: { type: String },
      draftRect: { type: Object }
    };
  }

  constructor() {
    super();
    this.url = "";
    this.annotations = [];
    this.zoom = 1;
    this.maxZoom = 5;
    this.minZoom = 0.5;
    this.zoomStep = 0.05;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
    this.mode = "";
    this.draftRect = null;

    this._hoveredAnnotation = null;
    this._tooltipPosition = { x: 0, y: 0 };
  }

  firstUpdated() {
    const container = this.renderRoot.querySelector(".image-scroll-container");
    container?.addEventListener("wheel", this._onWheel.bind(this), { passive: false });
  }

  willUpdate(changedProps) {
    if (changedProps.has("url") && this.url) {
      this.updateComplete.then(() => {
        const img = this.renderRoot.querySelector("img");
        if (img?.complete) {
          this._onImageLoad(img);
        } else if (img) {
          img.onload = () => this._onImageLoad(img);
        }
      });
    }
  }

  _onImageLoad(img) {
    const maxDim = 400;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;

    const ratio = Math.min(maxDim / this.naturalWidth, maxDim / this.naturalHeight);
    this.baseWidth = this.naturalWidth * ratio;
    this.baseHeight = this.naturalHeight * ratio;

    this.requestUpdate();
  }

  _onWheel(event) {
    event.preventDefault();

    const container = this.renderRoot.querySelector(".image-scroll-container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const offsetX = event.clientX - rect.left + container.scrollLeft;
    const offsetY = event.clientY - rect.top + container.scrollTop;

    const prevZoom = this.zoom;
    let newZoom = prevZoom;

    if (event.deltaY < 0) {
      newZoom = Math.min(prevZoom + this.zoomStep, this.maxZoom);
    } else {
      newZoom = Math.max(prevZoom - this.zoomStep, this.minZoom);
    }

    if (newZoom === prevZoom) return;

    const ratio = newZoom / prevZoom;
    this.zoom = +newZoom.toFixed(2);

    this.updateComplete.then(() => {
      container.scrollLeft = offsetX * ratio - (event.clientX - rect.left);
      container.scrollTop = offsetY * ratio - (event.clientY - rect.top);
    });
  }

  _zoomIn() { this._applyZoom(this.zoom + this.zoomStep); }
  _zoomOut() { this._applyZoom(this.zoom - this.zoomStep); }

  _applyZoom(newZoom) {
    newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    const prevZoom = this.zoom;
    const container = this.renderRoot.querySelector(".image-scroll-container");

    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const ratio = newZoom / prevZoom;

    this.zoom = +newZoom.toFixed(2);

    this.updateComplete.then(() => {
      container.scrollLeft = scrollLeft * ratio;
      container.scrollTop = scrollTop * ratio;
    });
  }

  get scaledRects() {
    if (!this.naturalWidth || !this.naturalHeight) return [];

    const scaleX = (this.baseWidth * this.zoom) / this.naturalWidth;
    const scaleY = (this.baseHeight * this.zoom) / this.naturalHeight;

    let rects = this.annotations.map(a => ({
      ...a,
      left: a.x * scaleX,
      top: a.y * scaleY,
      width: a.w * scaleX,
      height: a.h * scaleY
    }));

    if (this.draftRect) {
      rects.push({
        ...this.draftRect,
        left: this.draftRect.x * scaleX,
        top: this.draftRect.y * scaleY,
        width: this.draftRect.w * scaleX,
        height: this.draftRect.h * scaleY,
        isDraft: true
      });
    }

    return rects;
  }

  _showTooltip(e, ann) {
    const container = this.renderRoot.querySelector(".image-scroll-container");
    const containerRect = container.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();

    this._tooltipPosition = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top
    };
    this._hoveredAnnotation = ann;
  }

  _hideTooltip() { this._hoveredAnnotation = null; }

  _getDraftStyle(color) {
    const colorMap = {
      "green": {
        border: "border-green-700",
        bg: "bg-green-500/40"
      },
      "orange": {
        border: "border-orange-700", 
        bg: "bg-orange-500/40"
      },
      "red": {
        border: "border-red-700",
        bg: "bg-red-500/40"
      }
    };

    return colorMap[color] || colorMap["red"];
  }

  render() {
    if (!this.url) return null;

    const zoomedWidth = this.baseWidth * this.zoom;
    const zoomedHeight = this.baseHeight * this.zoom;

    return html`
      <div class="border border-gray-200 rounded-xl p-4 mt-4 shadow-sm bg-white max-w-full" style="position: relative;">
        <style>
          @keyframes tooltipFadeIn {
            0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.95); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          }
          .tooltip-animate-in { animation: tooltipFadeIn 0.2s ease forwards; }
        </style>

        <div class="text-lg font-semibold text-gray-800 mb-4">🧩 Annotation Frame</div>

        <div class="image-scroll-container overflow-auto border border-gray-300 rounded-lg shadow mb-4"
             style="max-width: 100%; height: 405px; background: #f9fafb; position: relative;">
          <div style="position: relative; width: ${zoomedWidth}px; height: ${zoomedHeight}px; transition: width 0.3s ease, height 0.3s ease;">
            <img src="${this.url}" style="width: 100%; height: 100%; display: block;" />

            ${this.scaledRects.map(rect => {
              if (rect.isDraft) {
                const draftStyles = this._getDraftStyle(rect.color || "red");
                
                return html`
                  <div
                    class="absolute z-10 rounded-sm pointer-events-auto box-border border-2
                      border-dashed opacity-70 ${draftStyles.border} ${draftStyles.bg}
                      transition-all duration-300 ease-in-out"
                    style="
                      left: ${rect.left}px;
                      top: ${rect.top}px;
                      width: ${rect.width}px;
                      height: ${rect.height}px;
                    "
                    @mouseenter="${e => this._showTooltip(e, rect)}"
                    @mouseleave="${this._hideTooltip}">
                  </div>
                `;
              } else {
                const rectColor = rect.color || "red";
                
                return html`
                  <div
                    class="absolute z-10 rounded-sm pointer-events-auto box-border border-2
                      ${rectColor} hover:shadow-xl transition-all duration-300 ease-in-out"
                    style="
                      left: ${rect.left}px;
                      top: ${rect.top}px;
                      width: ${rect.width}px;
                      height: ${rect.height}px;
                    "
                    @mouseenter="${e => this._showTooltip(e, rect)}"
                    @mouseleave="${this._hideTooltip}">
                  </div>
                `;
              }
            })}

            ${this._hoveredAnnotation ? html`
                <div
                  class="absolute tooltip-animate-in px-3 py-2 text-xs text-white rounded-md shadow-lg pointer-events-none min-w-[10rem] max-w-[24rem] text-center break-words
                    ${getColorVariant(this._hoveredAnnotation.color, 'bg', 200)} ${getColorVariant(this._hoveredAnnotation.color, 'border', 300)}"
                  style="
                    left: ${this._tooltipPosition.x}px;
                    top: ${this._tooltipPosition.y - 30}px;
                    transform: translateX(-50%);
                    z-index: 1000;
                  ">
                <span class="mr-1 text-sm">${getMotivationIcon(this._hoveredAnnotation.motivation)}</span>
                <span class="font-medium">
                  ${unsafeHTML(sanitizeHTML(this._hoveredAnnotation.chars || ''))}
                </span>

                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                            border-l-[6px] border-r-[6px] border-t-[6px] 
                            border-l-transparent border-r-transparent"
                     style="border-top-color: rgba(31, 41, 55, 0.95); margin-top: -1px;"></div>
              </div>
            ` : null}
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1em;">
          <div class="flex items-center justify-center gap-4">
            <button @click="${this._zoomOut}"
              class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300">
              <i class="fa-solid fa-minus"></i>
            </button>

            <span class="font-medium text-gray-700 select-none">
              ${(this.zoom * 100).toFixed(0)}%
            </span>

            <button @click="${this._zoomIn}"
              class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("cp-anframe", CpAnFrame);