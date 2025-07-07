import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnForm extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      mode: { type: String },
      x: { type: Number },
      y: { type: Number },
      w: { type: Number },
      h: { type: Number },
      color: { type: String },
      motivation: { type: String },
      chars: { type: String },
      format: { type: String },
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.mode = "add";
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.color = "";
    this.motivation = "commenting";
    this.chars = "";
    this.format = "text/html";
  }

  get imageUrl() {
    const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
    return canvas?.images?.[0]?.resource?.["@id"] ?? "";
  }

  get imageWidth() {
    return this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex]?.images?.[0]?.resource?.width ?? 0;
  }

  get imageHeight() {
    return this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex]?.images?.[0]?.resource?.height ?? 0;
  }

  updated(changedProps) {
    if (["x", "y", "w", "h", "mode"].some(p => changedProps.has(p))) {
      this._dispatchFrame();
    }
  }

  _dispatchFrame() {
    this.dispatchEvent(new CustomEvent("show-frame", {
      detail: {
        url: this.imageUrl,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        color: this.mode,
      },
      bubbles: true,
      composed: true
    }));
  }

  _onInputChange(prop, value) {
    const intVal = Math.max(0, parseInt(value) || 0);
    const W = this.imageWidth;
    const H = this.imageHeight;

    if (prop === "x" && intVal <= W) {
      this.x = intVal;
      if (this.w > W - intVal) this.w = W - intVal;
    }
    if (prop === "y" && intVal <= H) {
      this.y = intVal;
      if (this.h > H - intVal) this.h = H - intVal;
    }
    if (prop === "w" && intVal <= W - this.x) {
      this.w = intVal;
    }
    if (prop === "h" && intVal <= H - this.y) {
      this.h = intVal;
    }
  }

  renderButtons() {
    const commonClasses = "group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-[105px] overflow-hidden h-10 text-white hover:shadow-md";

    const makeButton = (label, iconClass, colorClass) => html`
      <button
        title="${label}"
        class="${commonClasses} ${colorClass}"
        type="button"
      >
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="${iconClass}"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            ${label}
          </span>
        </div>
      </button>
    `;

    if (this.mode === "add") {
      return html`
        <div class="flex items-center justify-center gap-6 pt-2 border-t border-gray-200">
          ${makeButton("Reset", "fa-solid fa-rotate-left", "bg-gray-600")}
          ${makeButton("Add", "fa-solid fa-plus", "bg-green-600")}
        </div>
      `;
    }

    if (this.mode === "edit") {
      return html`
        <div class="flex items-center justify-center gap-6 pt-2 border-t border-gray-200">
          ${makeButton("Reset", "fa-solid fa-rotate-left", "bg-gray-600")}
          ${makeButton("Clear", "fa-solid fa-eraser", "bg-yellow-500")}
          ${makeButton("Edit", "fa-solid fa-pencil", "bg-orange-500")}
        </div>
      `;
    }

    if (this.mode === "delete") {
      return html`
        <div class="flex items-center justify-center gap-6 pt-2 border-t border-gray-200">
          ${makeButton("Delete", "fa-solid fa-trash", "bg-red-600")}
        </div>
      `;
    }

    return null;
  }

  render() {
    const titleMap = {
      add: "➕ Add Annotation",
      edit: "✏️ Edit Annotation",
      delete: "🗑️ Delete Annotation",
    };

    return html`
      <div class="w-full">
        <div class="flex flex-col gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm w-full">
          <div class="text-base font-semibold text-gray-800 mb-1">${titleMap[this.mode]}</div>

          <div class="grid grid-cols-[auto_auto_auto] gap-4 items-end justify-center">
            ${["x", "y"].map(prop => html`
              <label class="flex flex-col text-sm text-gray-700 font-semibold">
                ${prop}
                <input
                  type="number"
                  min="0"
                  max="${prop === 'x' ? this.imageWidth : this.imageHeight}"
                  .value=${this[prop]}
                  @input=${e => this._onInputChange(prop, e.target.value)}
                  class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal w-20 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </label>
            `)}

            <label class="flex flex-col text-sm text-gray-700 font-semibold w-full">
              Motivation
              <select
                .value=${this.motivation}
                @change=${e => this.motivation = e.target.value}
                class="mt-1 w-40 mx-auto rounded border border-gray-300 px-2 py-1 text-sm font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                ${["commenting", "describing", "tagging", "linking"].map(m => html`
                  <option value="${m}">${m}</option>
                `)}
              </select>
            </label>
          </div>

          <div class="grid grid-cols-[auto_auto_auto] gap-4 items-end justify-center">
            ${["w", "h"].map(prop => html`
              <label class="flex flex-col text-sm text-gray-700 font-semibold">
                ${prop}
                <input
                  type="number"
                  min="0"
                  max="${prop === 'w' ? this.imageWidth - this.x : this.imageHeight - this.y}"
                  .value=${this[prop]}
                  @input=${e => this._onInputChange(prop, e.target.value)}
                  class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal w-20 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </label>
            `)}

            <label class="flex flex-col text-sm text-gray-700 font-semibold w-full">
              Format
              <select
                .value=${this.format}
                @change=${e => this.format = e.target.value}
                class="mt-1 w-40 mx-auto rounded border border-gray-300 px-2 py-1 text-sm font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                ${["text/html", "text/plain", "text/markdown"].map(f => html`
                  <option value="${f}">${f}</option>
                `)}
              </select>
            </label>
          </div>

          <label class="flex flex-col text-sm text-gray-700 font-semibold">
            Annotation Text
            <textarea
              .value=${this.chars}
              @input=${e => this.chars = e.target.value}
              class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal resize-y max-h-48 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            ></textarea>
          </label>

          ${this.renderButtons()}
        </div>
      </div>
    `;
  }
}

customElements.define("cp-anform", CpAnForm);