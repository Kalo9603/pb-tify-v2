import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { generateId } from "../../utilities/lib/utils.js";
import { config } from "../../utilities/config.js";

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
      annotationToEdit: { type: Object },
      readonly: { type: Boolean },
      confirmDelete: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = config.canvas.canvasIndexDefault;
    this.mode = "add";
    this.x = config.annotations.defaultAnnotationXYWH[0];
    this.y = config.annotations.defaultAnnotationXYWH[1];
    this.w = config.annotations.defaultAnnotationXYWH[2];
    this.h = config.annotations.defaultAnnotationXYWH[3];
    this.color = "";
    this.motivation = "commenting";
    this.chars = "";
    this.format = "text/html";
    this.annotationToEdit = null;
    this.confirmDelete = false;
  }

  firstUpdated() {
    super.firstUpdated?.();
    document.addEventListener("coordinates-to-form", this._handleCoordinatesFromFrame.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("coordinates-to-form", this._handleCoordinatesFromFrame.bind(this));
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
    super.updated?.(changedProps);

    if (changedProps.has("annotationToEdit") && (this.mode === "edit" || this.mode === "delete") && this.annotationToEdit) {
      this.setAnnotationData(this.annotationToEdit);
    }

    if (["x", "y", "w", "h", "mode"].some(p => changedProps.has(p))) {
      this._dispatchFrame();
    }
  }

  _dispatchFrame() {
    const colorMap = {
      "add": "green",
      "edit": "orange",
      "delete": "red"
    };

    const frameColor = colorMap[this.mode] || "red";

    this.dispatchEvent(new CustomEvent("show-frame", {
      detail: {
        url: this.imageUrl,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        color: frameColor,
      },
      bubbles: true,
      composed: true
    }));

    this.dispatchEvent(new CustomEvent("draft-frame-update", {
      detail: {
        url: this.imageUrl,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        mode: this.mode,
        color: frameColor
      },
      bubbles: true,
      composed: true
    }));
  }

  _onInputChange(prop, value) {
    const intVal = Math.max(0, parseInt(value) || 0);
    const W = this.imageWidth;
    const H = this.imageHeight;

    if (prop === "x") {
      if (intVal > W) {
        this.showAlert("warning", "outOfRange", { value: prop, min: 0, max: W });
        this.x = W;
      } else {
        this.x = intVal;
        if (this.w > W - this.x) this.w = W - this.x;
      }
    }

    if (prop === "y") {
      if (intVal > H) {
        this.showAlert("warning", "outOfRange", { value: prop, min: 0, max: H });
        this.y = H;
      } else {
        this.y = intVal;
        if (this.h > H - this.y) this.h = H - this.y;
      }
    }

    if (prop === "w") {
      const maxW = W - this.x;
      if (intVal > maxW) {
        this.showAlert("warning", "outOfRange", { value: prop, min: 0, max: maxW });
        this.w = maxW;
      } else {
        this.w = intVal;
      }
    }

    if (prop === "h") {
      const maxH = H - this.y;
      if (intVal > maxH) {
        this.showAlert("warning", "outOfRange", { value: prop, min: 0, max: maxH });
        this.h = maxH;
      } else {
        this.h = intVal;
      }
    }
  }

  _handleCoordinatesFromFrame(e) {
    const { x, y, w, h } = e.detail;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.requestUpdate();
  }

  setAnnotationData(annotation) {

    const selector = annotation.on.selector?.value?.replace("xywh=", "").split(",").map(Number);

    this.x = selector?.[0] || 0;
    this.y = selector?.[1] || 0;
    this.w = selector?.[2] || 0;
    this.h = selector?.[3] || 0;
    this.motivation = annotation.motivation?.[0]?.replace(/^(oa:|sc:)/, '') || "commenting";
    this.format = annotation.resource?.[0]?.format || "text/html";
    this.chars = annotation.resource?.[0]?.chars || "";
  }

  _resetForm = () => {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.motivation = "commenting";
    this.format = "text/html";
    this.chars = "";
    this.annotationToEdit = null;
    this.requestUpdate();
  };

  _resetToOriginal = () => {
    if (!this.annotationToEdit) return;
    this.setAnnotationData(this.annotationToEdit);
    this.requestUpdate();
  };

  renderButtons() {
    const commonClasses = "group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-[105px] overflow-hidden h-10 text-white hover:shadow-md";

    const makeButton = (label, iconClass, colorClass, onClick) => html`
      <button
        title="${label}"
        class="${commonClasses} ${colorClass}"
        type="button"
        @click=${onClick}
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
          ${makeButton("Reset", "fa-solid fa-rotate-left", "bg-gray-600", this._resetForm)}
          ${makeButton("Add", "fa-solid fa-plus", "bg-green-600", this.addAnnotation.bind(this))}
        </div>
      `;
    }

    if (this.mode === "edit") {
      return html`
        <div class="flex items-center justify-center gap-6 pt-2 border-t border-gray-200">
          ${makeButton("Reset", "fa-solid fa-rotate-left", "bg-gray-600", this._resetForm)}
          ${makeButton("Edit", "fa-solid fa-pencil", "bg-orange-500", this.editAnnotation)}
        </div>
      `;
    }

    if (this.mode === "delete") {
      return html`
        <div class="flex items-center justify-center gap-6 pt-2 border-t border-gray-200">

          <button
            type="button"
            class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12
                  ${this.confirmDelete ? 'bg-green-600' : 'bg-gray-600'} text-white hover:shadow-md overflow-hidden h-10 hover:w-[150px]"
            @click=${() => {
          if (!this.confirmDelete) {
            this.confirmDelete = true;
            const btn = this.renderRoot.querySelector('#confirm-btn');
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-red-700');
            setTimeout(() => {
              btn.classList.remove('bg-red-700');
              btn.classList.add('bg-green-600');
              this.requestUpdate();
            }, 2000);
          } else {
            this.confirmDelete = false;
          }
        }}
            id="confirm-btn"
          >
            <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
              <i class="fa-solid ${this.confirmDelete ? 'fa-check' : 'fa-xmark'} flex-shrink-0 transition-transform duration-300"></i>
              <span
                class="text-sm font-medium whitespace-nowrap transition-all duration-300
                      opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
              >
                ${this.confirmDelete ? "I'm not sure" : "Confirm Delete"}
              </span>
            </div>
          </button>

          ${makeButton(
          "Delete",
          "fa-solid fa-trash",
          `bg-red-600 ${!this.confirmDelete ? "opacity-50 cursor-not-allowed" : ""}`,
          this.confirmDelete ? this.deleteAnnotation : () => { }
        )}
        </div> `

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

          <div class="flex flex-wrap items-end justify-center gap-6">
            ${["x", "y", "w", "h"].map(prop => html`
              <label class="flex flex-col text-sm text-gray-700 font-semibold items-center">
                ${prop}
                <input
                  type="number"
                  min="0"
                  max="${prop === 'x' ? this.imageWidth : prop === 'y' ? this.imageHeight : prop === 'w' ? this.imageWidth - this.x : this.imageHeight - this.y}"
                  .value=${this[prop]}
                  ?readonly=${this.readonly}
                  @input=${e => this._onInputChange(prop, e.target.value)}
                  class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal w-20 text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </label>
            `)}

            <label class="flex flex-col text-sm text-gray-700 font-semibold items-center">
              Motivation
              <select
                .value=${this.motivation}
                ?disabled=${this.readonly}
                @change=${e => this.motivation = e.target.value}
                class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal w-36 text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
              ${config.motivations.map(m => html`
                <option value="${m}">
                  ${config.motivationIcons[m] || config.motivationIcons.default} ${m}
                </option>
              `)}
              </select>
            </label>

            <label class="flex flex-col text-sm text-gray-700 font-semibold items-center">
              Format
              <select
                .value=${this.format}
                ?disabled=${this.readonly}
                @change=${e => this.format = e.target.value}
                class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal w-32 text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
              ?readonly=${this.readonly}
              @input=${e => this.chars = e.target.value}
              class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm font-normal resize-y max-h-48 focus:ring-2 focus:ring-blue-600 focus:outline-none gap-6"
            ></textarea>
          </label>

          ${this.renderButtons()}
        </div>
      </div>
    `;
  }

  addAnnotation() {

    let prefix = this.motivation == "painting" ? "sc:" : "oa:";

    const annotation = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": generateId("annotation"),
      "@type": "oa:Annotation",
      "motivation": [`${prefix}${this.motivation}`],
      "on": {
        "@type": "oa:SpecificResource",
        "full": this.imageUrl,
        "selector": {
          "@type": "oa:FragmentSelector",
          "value": `xywh=${this.x},${this.y},${this.w},${this.h}`
        },
        "within": {
          "@type": "sc:Manifest",
          "@id": this.manifestObject["@id"]
        }
      },
      "resource": [
        {
          "@type": "dctypes:Text",
          "format": this.format,
          "chars": this.chars
        }
      ]
    };

    this.dispatchEvent(new CustomEvent("add-annotation-submit", {
      detail: { annotation },
      bubbles: true,
      composed: true
    }));

    this._resetForm();
  }


  editAnnotation = () => {
    if (!this.annotationToEdit) return;

    let prefix = this.motivation == "painting" ? "sc:" : "oa:";

    const edited = {
      ...this.annotationToEdit,
      motivation: [`${prefix}${this.motivation}`],
      on: {
        ...this.annotationToEdit.on,
        selector: {
          "@type": "oa:FragmentSelector",
          "value": `xywh=${this.x},${this.y},${this.w},${this.h}`
        }
      },
      resource: [
        {
          "@type": "dctypes:Text",
          "format": this.format,
          "chars": this.chars
        }
      ]
    };

    this.dispatchEvent(new CustomEvent("edit-annotation-submit", {
      detail: { original: this.annotationToEdit, edited },
      bubbles: true,
      composed: true
    }));

    this.dispatchEvent(new CustomEvent("hide-all-annotations", {
      bubbles: true,
      composed: true
    }));

    this._resetForm();
  };

  deleteAnnotation = () => {
    if (!this.annotationToEdit) return;

    this.dispatchEvent(new CustomEvent("delete-annotation-submit", {
      detail: { annotation: this.annotationToEdit },
      bubbles: true,
      composed: true
    }));

    this.dispatchEvent(new CustomEvent("hide-all-annotations", {
      bubbles: true,
      composed: true
    }));

    this._resetForm();

  };

}

customElements.define("cp-anform", CpAnForm);