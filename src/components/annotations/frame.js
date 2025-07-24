import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { getMotivationIcon } from "../../utilities/lib/utils.js";

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
      zoom: { type: Number },
      motivation: { type: String },
      chars: { type: String }
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
    this.zoom = 1;
    this.maxZoom = 5;
    this.minZoom = 0.5;
    this.zoomStep = 0.05;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.baseWidth = 0;
    this.baseHeight = 0;
    this.motivation = "";
    this.chars = "";
    this.showTooltip = false;
    this.tooltipPosition = { x: 0, y: 0 };
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

  _zoomIn() {
    this._applyZoom(this.zoom + this.zoomStep);
  }

  _zoomOut() {
    this._applyZoom(this.zoom - this.zoomStep);
  }

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

  _onAnnotationHover(event) {
    const container = this.renderRoot.querySelector(".image-scroll-container");
    const containerRect = container.getBoundingClientRect();
    const annotationRect = event.currentTarget.getBoundingClientRect();
    
    this.tooltipPosition = {
      x: annotationRect.left + annotationRect.width / 2 - containerRect.left,
      y: annotationRect.top - containerRect.top
    };
    
    this.showTooltip = true;
    this.requestUpdate();
  }

  _onAnnotationLeave() {
    this.showTooltip = false;
    this.requestUpdate();
  }

  get scaledRect() {
    if (!this.naturalWidth || !this.naturalHeight) return null;
    const scaleX = (this.baseWidth * this.zoom) / this.naturalWidth;
    const scaleY = (this.baseHeight * this.zoom) / this.naturalHeight;
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

    const zoomedWidth = this.baseWidth * this.zoom;
    const zoomedHeight = this.baseHeight * this.zoom;

    const colorClassMap = {
      add: "border-green-600 bg-green-600/30",
      edit: "border-orange-500 bg-orange-500/30",
      delete: "border-red-600 bg-red-600/30",
      view: "border-blue-600 bg-blue-600/30",
    };
    const colorClass = colorClassMap[this.color?.trim()] || colorClassMap["view"];

    const motivationIcon = getMotivationIcon(this.motivation);

    return html`
      <div
        class="border border-gray-200 rounded-xl p-4 mt-4 shadow-sm bg-white max-w-full"
        style="position: relative;"
      >
        <style>
          @keyframes tooltipFadeIn {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(8px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          
          @keyframes tooltipFadeOut {
            0% {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(8px) scale(0.95);
            }
          }
          
          .tooltip-animate-in {
            animation: tooltipFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .tooltip-animate-out {
            animation: tooltipFadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        </style>

        <div class="text-lg font-semibold text-gray-800 mb-4">🧩 Annotation Frame</div>

        <div
          class="image-scroll-container overflow-auto border border-gray-300 rounded-lg shadow mb-4"
          style="max-width: 100%; height: 405px; background: #f9fafb; position: relative;"
        >
          <div
            style="position: relative; width: ${zoomedWidth}px; height: ${zoomedHeight}px;"
          >
            <img
              src="${this.url}"
              style="width: 100%; height: 100%; display: block;"
              alt="image"
            />
            ${rect
              ? html`
                  <div
                    class="absolute z-10 rounded-sm pointer-events-auto box-border border-2 
                      ${colorClass} 
                      hover:shadow-xl 
                      hover:ring-4 hover:ring-white-200 hover:ring-opacity-50 
                      transition-all duration-300 ease-in-out
                      bg-opacity-30 hover:bg-opacity-20 hover:scale-105"
                    style="
                      left: ${rect.left}px;
                      top: ${rect.top}px;
                      width: ${rect.width}px;
                      height: ${rect.height}px;
                    "
                    @mouseenter="${this._onAnnotationHover}"
                    @mouseleave="${this._onAnnotationLeave}"
                  >
                  </div>
                `
              : null}
          </div>
        </div>

        ${this.showTooltip && this.chars ? html`
          <div
            class="absolute px-3 py-2 text-xs text-white bg-gray-800 rounded-md shadow-lg pointer-events-none min-w-[10rem] max-w-[18rem] text-center break-words
                  transition-all duration-300 ease-in-out transform"
            style="
              left: ${this.tooltipPosition.x}px;
              top: ${this.tooltipPosition.y - 30}px;  /* 30px sopra il rettangolo, regola a piacere */
              transform: translateX(-50%);
              z-index: 1000;
              backdrop-filter: blur(4px);
              background: linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
              border: 1px solid rgba(255, 255, 255, 0.1);
              animation: ${this.showTooltip ? 'tooltipFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'tooltipFadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'};
            "
          >
            <span class="mr-1 text-sm">${motivationIcon}</span>
            <span class="font-medium">${unsafeHTML(this.chars || '')}</span>
            
            <div 
              class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                    border-l-[6px] border-r-[6px] border-t-[6px] 
                    border-l-transparent border-r-transparent 
                    transition-all duration-300 ease-in-out
                    filter drop-shadow-sm"
              style="
                border-top-color: rgba(31, 41, 55, 0.95);
                margin-top: -1px;
              "
            ></div>
          </div>
        ` : null}

        <div style="display: flex; justify-content: center; gap: 1em;">
        <div class="flex items-center justify-center gap-4">
          <button
            @click="${this._zoomOut}"
            class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300"
            type="button"
            aria-label="Zoom out"
          >
            <i class="fa-solid fa-minus"></i>
          </button>

          <span class="font-medium text-gray-700 select-none">
            ${(this.zoom * 100).toFixed(0)}%
          </span>

          <button
            @click="${this._zoomIn}"
            class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300"
            type="button"
            aria-label="Zoom in"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        </div>
      </div>
    `;
  }
}

customElements.define("cp-anframe", CpAnFrame);