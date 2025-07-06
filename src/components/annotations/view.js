import { html, css } from "https://esm.sh/lit-element";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { UtBase } from "../../utilities/base.js";
import "./tooltip.js";

export class CpAnViewer extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      annotations: { type: Array },
      activeAnnotationIndex: { type: Number },
      ...super.properties
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.annotations = [];
    this.activeAnnotationIndex = null;
    this._currentAnnotationURL = null;
  }

  updated(changedProps) {
    if (changedProps.has("manifestObject") || changedProps.has("canvasIndex")) {
      this.fetchAnnotations();
    }
  }

  extractChars(resource) {
    if (!resource) return "";
    if (typeof resource === "string") return resource;
    if (Array.isArray(resource)) {
      return resource
        .map(r => r?.chars || r?.["@value"] || "")
        .filter(Boolean)
        .join(" ");
    }
    return resource.chars || resource["@value"] || "";
  }

  _parseXYWH(region) {
    if (!region || typeof region !== "string") return { x: 0, y: 0, w: 0, h: 0 };

    const coords = region.replace("xywh=", "").split(",").map(n => parseInt(n));
    if (coords.length !== 4 || coords.some(isNaN)) {
      console.warn("⚠️ Invalid xywh format:", region);
      return { x: 0, y: 0, w: 0, h: 0 };
    }

    const [x, y, w, h] = coords;
    return { x, y, w, h };
  }

  async fetchAnnotations() {
    if (!this.manifestObject) return;

    const canvas = this.manifestObject.sequences?.[0]?.canvases?.[this.canvasIndex];
    if (!canvas) return (this.annotations = []);

    const annList = canvas.otherContent?.find(c => c["@type"] === "sc:AnnotationList");
    if (!annList?.["@id"]) return (this.annotations = []);

    const rawUrl = annList["@id"];
    const proxiedUrl = "https://corsproxy.io/?" + encodeURIComponent(rawUrl);

    if (rawUrl === this._currentAnnotationURL) return;
    this._currentAnnotationURL = rawUrl;

    try {
      const res = await fetch(proxiedUrl);
      if (!res.ok) throw new Error(`Failed to fetch annotations from ${rawUrl}`);
      const data = await res.json();

      this.annotations = (data.resources || []).map(a => {
        const chars = this.extractChars(a.resource);
        const region =
          typeof a.on === "string"
            ? a.on.split("#xywh=")[1] ?? null
            : a.on?.selector?.value ?? null;

        return {
          motivation: a.motivation,
          chars,
          region,
          full: a
        };
      });

      this.dispatchEvent(new CustomEvent("annotations-count", {
        detail: { count: this.annotations.length },
        bubbles: true,
        composed: true
      }));

    } catch (err) {
      console.error("Annotation fetch failed:", err);
      this.annotations = [];
    }
  }

  toggleAnnotation(index) {
    const prev = this.activeAnnotationIndex;
    this.activeAnnotationIndex = index === prev ? null : index;

    const annotation = this.annotations[index];
    const region = annotation?.region;
    if (!region) return;

    const { x, y, w, h } = this._parseXYWH(region);

    this.dispatchEvent(new CustomEvent("highlight-annotation", {
      detail: {
        action: index === prev ? "remove" : "add",
        region: { x, y, w, h }
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
    const resource = canvas?.images?.[0]?.resource;
    const imageUrl = resource?.["@id"];
    const imgWidth = resource?.width ?? 0;
    const imgHeight = resource?.height ?? 0;

    return html`
      ${this.annotations.length === 0
        ? html`<div class="text-gray-500 italic">No annotations available.</div>`
        : html`
            <ul class="space-y-4">
              ${this.annotations.map((ann, i) => {
                const isActive = this.activeAnnotationIndex === i;
                const xywh = ann.region;

                let x = 0, y = 0, w = 0, h = 0;
                if (xywh) {
                  ({ x, y, w, h } = this._parseXYWH(xywh));
                }

                if (isActive) {
                  console.log("🟦 Tooltip props:", {
                    imageUrl, x, y, w, h, imgWidth, imgHeight, show: isActive
                  });
                }

                return html`
                  <li class="text-sm text-gray-700 border-b pb-2 space-y-1 relative">
                    <div class="flex items-center justify-between">
                      <div><strong>#${i + 1}</strong></div>
                      <button
                        @click=${() => this.toggleAnnotation(i)}
                        class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10
                          ${isActive ? "bg-red-600" : "bg-blue-600"} text-white hover:bg-green-600"
                      >
                        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
                          <i class="fa-solid ${isActive ? "fa-magnifying-glass-minus" : "fa-magnifying-glass"} text-lg flex-shrink-0 transition-transform duration-300"></i>
                          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
                            ${isActive ? "Hide" : "Show"}
                          </span>
                        </div>
                      </button>
                    </div>

                    ${ann.chars
                      ? html`
                          <div class="prose prose-sm max-w-none">
                            ${unsafeHTML(ann.chars)}
                          </div>
                        `
                      : null}

                    ${isActive && imageUrl
                      ? html`
                          <div class="relative group flex justify-end">
                            <cp-antooltip
                              class="absolute bottom-full mb-2 z-50"
                              .url=${imageUrl}
                              .x=${x}
                              .y=${y}
                              .w=${w}
                              .h=${h}
                              .visible=${true}
                            ></cp-antooltip>
                          </div>
                        `
                      : null}
                  </li>
                `;
              })}
            </ul>
          `}
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .prose :where(p):not(:last-child) {
        margin-bottom: 0.5rem;
      }
    `;
  }
}

customElements.define("cp-anviewer", CpAnViewer);