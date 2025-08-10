import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { getMotivationIcon, sanitizeHTML, getColorVariant } from "../../utilities/lib/utils.js";
import { config } from "../../utilities/config.js";
import "./buttons/coordinates.js";

export class CpAnFrame extends UtBase {
  
  static get properties() {
    return {
      url: { type: String },
      annotations: { type: Array },
      zoom: { type: Number },
      _hoveredAnnotation: { type: Object },
      _tooltipPosition: { type: Object },
      mode: { type: String },
      draftRect: { type: Object },
      addRect: { type: Object },
      showCoordinates: { type: Boolean },
      _cursorCoords: { type: Object },
      _fixedPoint: { type: Object },
      _relativeCoords: { type: Object },
      _coordinateRect: { type: Object }
    };
  }

  constructor() {
    
    super();

    this.url = "";
    this.annotations = [];
    this.zoom = config.frame.zoom.default;
    this.mode = "";
    this.showCoordinates = false;
    
    this.naturalWidth = this.naturalHeight = 0;
    this.baseWidth = this.baseHeight = 0;
    
    this._hoveredAnnotation = null;
    this._tooltipPosition = { x: 0, y: 0 };
    this.draftRect = this.addRect = null;
    this._cursorCoords = this._fixedPoint = this._relativeCoords = this._coordinateRect = null;
    
    this._zoomIntervalId = this._autoScrollIntervalId = null;
    
    this._scrollMargin = config.frame.scroll.margin;
    this._scrollSpeed = config.frame.scroll.speed;
  }

  firstUpdated() {
    this.addEventListener("coordinates-toggle", this._handleCoordinatesToggle.bind(this));
  }

  willUpdate(changedProps) {
    if (changedProps.has("url") && this.url) {
      this.updateComplete.then(() => {
        const img = this.renderRoot.querySelector("img");
        if (img?.complete) this._onImageLoad(img);
        else if (img) img.onload = () => this._onImageLoad(img);
      });
    }
  }

  async _onImageLoad(img) {
    const maxDim = 400;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;
    
    const ratio = Math.min(maxDim / this.naturalWidth, maxDim / this.naturalHeight);
    this.baseWidth = this.naturalWidth * ratio;
    this.baseHeight = this.naturalHeight * ratio;

    await this.requestUpdate();
    await this.updateComplete;

    const container = this.renderRoot.querySelector(".image-scroll-container");
    if (container) {
      container.addEventListener("mousemove", this._onMouseMove.bind(this));
      container.addEventListener("mouseleave", this._onMouseLeave.bind(this));
      container.addEventListener("click", this._onImageClick.bind(this));
    }
  }

  _handleCoordinatesToggle(e) {
    this.showCoordinates = e.detail.active;
    if (!this.showCoordinates) {
      this._resetCoordinates();
      this._stopAutoScroll();
    }
  }

  _resetCoordinates() {
    this._cursorCoords = this._fixedPoint = this._relativeCoords = this._coordinateRect = null;
    this.requestUpdate();
  }

  _checkAutoScroll(clientX, clientY) {
    const container = this.renderRoot.querySelector(".image-scroll-container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let scrollX = 0, scrollY = 0;

    if (clientX < rect.left + this._scrollMargin && container.scrollLeft > 0) scrollX = -1;
    else if (clientX > rect.right - this._scrollMargin && container.scrollLeft < container.scrollWidth - container.clientWidth) scrollX = 1;
    
    if (clientY < rect.top + this._scrollMargin && container.scrollTop > 0) scrollY = -1;
    else if (clientY > rect.bottom - this._scrollMargin && container.scrollTop < container.scrollHeight - container.clientHeight) scrollY = 1;

    if (scrollX || scrollY) this._startAutoScroll(scrollX, scrollY);
    else this._stopAutoScroll();
  }

  _startAutoScroll(scrollX, scrollY) {
    if (this._autoScrollIntervalId) return;
    this._autoScrollIntervalId = setInterval(() => {
      const container = this.renderRoot.querySelector(".image-scroll-container");
      if (!container) return;

      const newLeft = Math.max(0, Math.min(container.scrollWidth - container.clientWidth, 
        container.scrollLeft + scrollX * this._scrollSpeed));
      const newTop = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, 
        container.scrollTop + scrollY * this._scrollSpeed));

      container.scrollLeft = newLeft;
      container.scrollTop = newTop;

      if ((scrollX > 0 && newLeft >= container.scrollWidth - container.clientWidth) ||
          (scrollX < 0 && newLeft <= 0) ||
          (scrollY > 0 && newTop >= container.scrollHeight - container.clientHeight) ||
          (scrollY < 0 && newTop <= 0)) {
        this._stopAutoScroll();
      }
    }, 50);
  }

  _stopAutoScroll() {
    if (this._autoScrollIntervalId) {
      clearInterval(this._autoScrollIntervalId);
      this._autoScrollIntervalId = null;
    }
  }

  _onMouseMove(e) {
    this._checkAutoScroll(e.clientX, e.clientY);
    
    if (!this.showCoordinates || !this.naturalWidth || !this.naturalHeight) return;

    const container = this.renderRoot.querySelector(".image-scroll-container");
    const imageRect = container.firstElementChild.getBoundingClientRect();
    const offsetX = e.clientX - imageRect.left;
    const offsetY = e.clientY - imageRect.top;
    
    const zoomedWidth = this.baseWidth * this.zoom;
    const zoomedHeight = this.baseHeight * this.zoom;
    const scaleX = this.naturalWidth / zoomedWidth;
    const scaleY = this.naturalHeight / zoomedHeight;
    
    const absoluteX = Math.round(offsetX * scaleX);
    const absoluteY = Math.round(offsetY * scaleY);

    if (absoluteX < 0 || absoluteY < 0 || absoluteX > this.naturalWidth || absoluteY > this.naturalHeight) {
      this._cursorCoords = this._relativeCoords = this._coordinateRect = null;
      return;
    }

    this._cursorCoords = { x: absoluteX, y: absoluteY, screenX: offsetX, screenY: offsetY };

    if (this._fixedPoint) {
      const dx = absoluteX - this._fixedPoint.x;
      const dy = absoluteY - this._fixedPoint.y;
      this._relativeCoords = { dx, dy };
      
      const x1 = Math.min(this._fixedPoint.x, absoluteX);
      const y1 = Math.min(this._fixedPoint.y, absoluteY);
      this._coordinateRect = {
        x: x1, y: y1, w: Math.max(this._fixedPoint.x, absoluteX) - x1, 
        h: Math.max(this._fixedPoint.y, absoluteY) - y1, color: this._fixedPoint.color
      };
    } else {
      this._relativeCoords = this._coordinateRect = null;
    }
    this.requestUpdate();
  }

  _onMouseLeave() {
    this._stopAutoScroll();
    if (this.showCoordinates) {
      this._cursorCoords = this._relativeCoords = null;
      if (!this._fixedPoint) this._coordinateRect = null;
      this.requestUpdate();
    }
  }

  _onImageClick(e) {
    if (!this.showCoordinates || !this._cursorCoords) return;
    
    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'cyan'];
    this._fixedPoint = {
      ...this._cursorCoords,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    this._coordinateRect = null;
    this.requestUpdate();
  }

  _applyZoom(newZoom) {
    newZoom = Math.max(config.frame.zoom.min, Math.min(config.frame.zoom.max, newZoom));
    const container = this.renderRoot.querySelector(".image-scroll-container");
    const ratio = newZoom / this.zoom;
    
    this.zoom = +newZoom.toFixed(2);
    this.updateComplete.then(() => {
      container.scrollLeft *= ratio;
      container.scrollTop *= ratio;
    });
  }

  _zoomIn() { this._applyZoom(this.zoom + config.frame.zoom.step); }
  _zoomOut() { this._applyZoom(this.zoom - config.frame.zoom.step); }
  _zoomReset() { this._applyZoom(config.frame.zoom.default); }

  _startZoom(direction) {
    if (this._zoomIntervalId) return;
    direction === 'in' ? this._zoomIn() : this._zoomOut();
    this._zoomIntervalId = setInterval(() => direction === 'in' ? this._zoomIn() : this._zoomOut(), 100);
  }

  _stopZoom() {
    if (this._zoomIntervalId) {
      clearInterval(this._zoomIntervalId);
      this._zoomIntervalId = null;
    }
  }

  get scaledRects() {
    if (!this.naturalWidth || !this.naturalHeight) return [];

    const scaleX = (this.baseWidth * this.zoom) / this.naturalWidth;
    const scaleY = (this.baseHeight * this.zoom) / this.naturalHeight;

    let rects = this.annotations.map(a => ({
      ...a, left: a.x * scaleX, top: a.y * scaleY, 
      width: a.w * scaleX, height: a.h * scaleY, isAnnotation: true
    }));

    if (this.addRect && (this.mode === "add" || this.mode === "edit")) {
      rects.push({
        ...this.addRect, left: this.addRect.x * scaleX, top: this.addRect.y * scaleY,
        width: this.addRect.w * scaleX, height: this.addRect.h * scaleY,
        isAddRect: true, color: this.mode === "add" ? "green" : "orange"
      });
    }

    if (this.draftRect) {
      rects.push({
        ...this.draftRect, left: this.draftRect.x * scaleX, top: this.draftRect.y * scaleY,
        width: this.draftRect.w * scaleX, height: this.draftRect.h * scaleY, isDraft: true
      });
    }

    if (this._coordinateRect && this.showCoordinates) {
      rects.push({
        ...this._coordinateRect, left: this._coordinateRect.x * scaleX, top: this._coordinateRect.y * scaleY,
        width: this._coordinateRect.w * scaleX, height: this._coordinateRect.h * scaleY, isCoordinateRect: true
      });
    }

    return rects;
  }

  setAddRect(x, y, w, h) {
    if ((this.mode === "add" || this.mode === "edit") && [x, y, w, h].every(v => v !== undefined)) {
      this.addRect = { x, y, w, h };
      this.requestUpdate();
    }
  }

  clearAddRect() {
    this.addRect = null;
    this.requestUpdate();
  }

  resetFrame() {
    this._resetCoordinates();
    this.clearAddRect();
    this.draftRect = null;
    this._stopAutoScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoScroll();
    this._stopZoom();
  }

  _showTooltip(e, ann) {
    if (ann.isDraft || ann.isAddRect || ann.isCoordinateRect) return;
    this._tooltipPosition = { x: ann.left + ann.width / 2, y: ann.top - 12 };
    this._hoveredAnnotation = ann;
  }

  _hideTooltip() { this._hoveredAnnotation = null; }

  _getDraftStyle(color) {
    const styles = {
      green: "border-green-700 bg-green-500/40", orange: "border-orange-700 bg-orange-500/40",
      red: "border-red-700 bg-red-500/40", blue: "border-blue-700 bg-blue-500/40",
      purple: "border-purple-700 bg-purple-500/40", pink: "border-pink-700 bg-pink-500/40",
      yellow: "border-yellow-700 bg-yellow-500/40", cyan: "border-cyan-700 bg-cyan-500/40"
    };
    return styles[color] || styles.red;
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

        <div class="flex justify-between items-center mb-4">
          <div class="text-lg font-semibold text-gray-800">🧩 Annotation Frame</div>
          <cp-ancoords .active="${this.showCoordinates}"></cp-ancoords>
        </div>

        <div class="image-scroll-container overflow-auto border border-gray-300 rounded-lg shadow mb-4"
             style="max-width: 100%; height: 405px; background: #eee; position: relative;">
          <div style="position: relative; width: ${zoomedWidth}px; height: ${zoomedHeight}px; transition: width 0.3s ease, height 0.3s ease; cursor: ${this.showCoordinates ? 'crosshair' : 'default'};">
            <img src="${this.url}" draggable="false" style="width: 100%; height: 100%; display: block; pointer-events: none; user-select: none" />

            ${this.scaledRects.map(rect => {
              const baseClasses = "absolute z-10 rounded-sm box-border border-2";
              
              if (rect.isDraft) {
                return html`<div class="${baseClasses} border-dashed opacity-70 ${this._getDraftStyle(rect.color || "red")} transition-all duration-300 ease-in-out pointer-events-auto"
                  style="left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"
                  @mouseenter="${e => this._showTooltip(e, rect)}" @mouseleave="${this._hideTooltip}"></div>`;
              } else if (rect.isAddRect) {
                return html`<div class="${baseClasses} ${this._getDraftStyle(rect.color)} opacity-80 transition-opacity duration-200 pointer-events-none"
                  style="left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"></div>`;
              } else if (rect.isCoordinateRect) {
                return html`<div class="${baseClasses} z-20 border-dashed ${this._getDraftStyle(rect.color)} opacity-60 transition-opacity duration-200 pointer-events-none"
                  style="left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"></div>`;
              } else {
                return html`<div class="${baseClasses} ${rect.color || "border-red-600"} hover:shadow-xl transition-all duration-300 ease-in-out pointer-events-auto"
                  style="left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;"
                  @mouseenter="${e => this._showTooltip(e, rect)}" @mouseleave="${this._hideTooltip}"></div>`;
              }
            })}

            ${this.showCoordinates && this._fixedPoint ? html`
              <div class="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg pointer-events-none z-30 bg-${this._fixedPoint.color}-500"
                style="left: ${(this._fixedPoint.x / this.naturalWidth) * zoomedWidth - 6}px; top: ${(this._fixedPoint.y / this.naturalHeight) * zoomedHeight - 6}px;"></div>
              <div class="absolute px-2 py-1 text-xs bg-black/90 text-white rounded shadow pointer-events-none select-none z-30"
                style="left: ${(this._fixedPoint.x / this.naturalWidth) * zoomedWidth}px; top: ${(this._fixedPoint.y / this.naturalHeight) * zoomedHeight - 30}px; transform: translateX(-50%); white-space: nowrap;">
                (${this._fixedPoint.x}px, ${this._fixedPoint.y}px)</div>` : null}

            ${this.showCoordinates && !this._fixedPoint && this._cursorCoords ? html`
              <div class="absolute px-2 py-1 text-xs bg-black/80 text-white rounded shadow pointer-events-none select-none z-20"
                style="left: ${this._cursorCoords.screenX + 10}px; top: ${this._cursorCoords.screenY + 10}px; white-space: nowrap;">
                (${this._cursorCoords.x}px, ${this._cursorCoords.y}px)</div>` : null}

            ${this.showCoordinates && this._relativeCoords && this._cursorCoords ? html`
              <div class="absolute px-2 py-1 text-xs bg-yellow-700 text-white rounded shadow pointer-events-none select-none z-20"
                style="left: ${this._cursorCoords.screenX + 10}px; top: ${this._cursorCoords.screenY + 30}px; white-space: nowrap;">
                (${this._relativeCoords.dx < 0 ? '-' : ''}${this._relativeCoords.dx}px, ${this._relativeCoords.dy < 0 ? '-' : ''}${this._relativeCoords.dy}px)</div>` : null}

            ${this._hoveredAnnotation && !this._hoveredAnnotation.isDraft && !this._hoveredAnnotation.isAddRect && !this._hoveredAnnotation.isCoordinateRect ? html`
              <div class="absolute tooltip-animate-in px-3 py-2 text-xs text-white rounded-md shadow-lg pointer-events-none min-w-[10rem] max-w-[24rem] text-center break-words z-30
                ${getColorVariant(this._hoveredAnnotation.color, 'bg', 200)} ${getColorVariant(this._hoveredAnnotation.color, 'border', 300)}"
                style="left: ${this._tooltipPosition.x}px; top: ${this._tooltipPosition.y - 30}px;">
                <span class="mr-1 text-sm">${getMotivationIcon(this._hoveredAnnotation.motivation)}</span>
                <span class="font-medium">${unsafeHTML(sanitizeHTML(this._hoveredAnnotation.chars || ''))}</span>
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent"
                     style="border-top-color: rgba(31, 41, 55, 0.95); margin-top: -1px;"></div></div>` : null}
          </div>
        </div>

        <div class="flex flex-wrap justify-center items-center gap-4">
          <button @click="${this._zoomOut}" @mousedown="${() => this._startZoom('out')}" @mouseup="${this._stopZoom}" @mouseleave="${this._stopZoom}"
            ?disabled="${this.zoom <= config.frame.zoom.min}"
            class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fa-solid fa-minus"></i></button>

          <div class="inline-flex items-center border border-gray-300 rounded px-2 py-1 bg-white">
            <input type="number" min="${config.frame.zoom.min * 100}" max="${config.frame.zoom.max * 100}" .value="${(this.zoom * 100).toFixed(0)}"
              @change="${(e) => {
                const val = parseFloat(e.target.value);
                this._applyZoom((!isNaN(val) && val >= config.frame.zoom.min * 100 && val <= config.frame.zoom.max * 100) ? val / 100 : 1);
              }}" class="w-16 text-right font-medium text-gray-700 focus:outline-none" style="border: none; outline: none;" />
            <span class="ml-1 text-gray-600 font-semibold">%</span></div>

          <button @click="${this._zoomIn}" @mousedown="${() => this._startZoom('in')}" @mouseup="${this._stopZoom}" @mouseleave="${this._stopZoom}"
            ?disabled="${this.zoom >= config.frame.zoom.max}"
            class="rounded-full bg-blue-600 text-white shadow-md px-4 py-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fa-solid fa-plus"></i></button>

          <button @click="${this._zoomReset}"
            class="rounded-full bg-gray-500 text-white shadow-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300">
            <i class="fa-solid fa-rotate-left"></i></button>
        </div>
      </div>
    `;
  }
}

customElements.define("cp-anframe", CpAnFrame);