import { html, css } from "https://esm.sh/lit-element";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { UtBase } from "../../utilities/base.js";
import { getMotivationIcon } from "../../utilities/lib/utils.js";
import "./buttons/edit.js";
import "./buttons/delete.js";

export class CpAnViewer extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      annotations: { type: Array },
      activeAnnotationIndex: { type: Number },
      localAnnotations: { type: Array },
      annotationListJson: { type: Object },
      ...super.properties
    };
  }

  static get styles() {
    return [
      super.styles || [],
      css`
        li {
          transition: background-color 0.3s ease-in-out;
        }
      `
    ];
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.annotations = [];
    this.activeAnnotationIndex = null;
    this.localAnnotations = [];
    this.annotationListJson = null;

    this.addEventListener("refresh-annotations", () => this.fetchAnnotations());
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("refresh-annotations", () => this.fetchAnnotations());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("refresh-annotations", () => this.fetchAnnotations());
  }

  updated(changedProps) {
    if (
      changedProps.has("manifestObject") ||
      changedProps.has("canvasIndex") ||
      changedProps.has("localAnnotations")
    ) {
      this.fetchAnnotations();
    }
  }

  extractChars(resource) {
    if (!resource) return "";
    if (typeof resource === "string") return resource;
    if (Array.isArray(resource)) {
      return resource
        .map((r) => r?.chars || r?.["@value"] || "")
        .filter(Boolean)
        .join(" ");
    }
    return resource.chars || resource["@value"] || "";
  }

  _parseXYWH(region) {
    if (!region || typeof region !== "string")
      return { x: 0, y: 0, w: 0, h: 0 };

    const coords = region.replace("xywh=", "").split(",").map((n) => parseInt(n));
    if (coords.length !== 4 || coords.some(isNaN)) {
      console.warn("⚠️ Invalid xywh format:", region);
      return { x: 0, y: 0, w: 0, h: 0 };
    }

    const [x, y, w, h] = coords;
    return { x, y, w, h };
  }

  _parseAnnotation(a) {
    const chars = this.extractChars(a.resource);
    const region =
      typeof a.on === "string"
        ? a.on.split("#xywh=")[1] ?? null
        : a.on?.selector?.value ?? null;

    return {
      motivation: a.motivation,
      chars,
      region,
      full: a,
    };
  }

  async fetchAnnotations() {

    if (!this.manifestObject) {
      console.warn("No manifest object available.");
      return;
    }

    const canvas = this.manifestObject.sequences?.[0]?.canvases?.[this.canvasIndex];
    if (!canvas) {
      console.warn("Invalid canvas.");
      return;
    }

    const canvasId = canvas["@id"] || `canvas${this.canvasIndex}`;
    let baseAnnotations = [];

    const annList = canvas.otherContent?.find(c => c["@type"] === "sc:AnnotationList");

    if (annList?.resources?.length) {
      baseAnnotations = annList.resources.map(a => this._parseAnnotation(a));
    } else if (annList?.["@id"]) {
      try {
        const res = await fetch(annList["@id"]);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();

        if (data?.resources?.length) {
          baseAnnotations = data.resources.map(a => this._parseAnnotation(a));
        }
      } catch (err) {
        console.error("Failed to fetch external annotationList:", err);
      }
    }

    const localAnns = (this.localAnnotations || [])
      .filter(a => a.canvasId === canvasId)
      .map(a => this._parseAnnotation(a.annotation));

    const all = [...baseAnnotations, ...localAnns];
    const unique = [];
    const seen = new Set();

    for (const ann of all) {
      const id = ann.full["@id"] || JSON.stringify(ann.full);
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(ann);
      }
    }

    this.annotations = unique;

    this.annotationListJson = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": `annotationList-${Date.now()}`,
      "@type": "sc:AnnotationList",
      resources: unique.map(a => a.full),
    };

    this.dispatchEvent(new CustomEvent("annotations-count", {
      detail: { count: this.annotations.length },
      bubbles: true,
      composed: true
    }));

    this.requestUpdate();
  }

  toggleAnnotation(index) {
    const prev = this.activeAnnotationIndex;
    this.activeAnnotationIndex = index === prev ? null : index;

    const annotation = this.annotations[index];
    const region = annotation?.region;
    if (!region) return;

    const { x, y, w, h } = this._parseXYWH(region);

    this.dispatchEvent(
      new CustomEvent("highlight-annotation", {
        detail: {
          action: index === prev ? "remove" : "add",
          region: { x, y, w, h },
        },
        bubbles: true,
        composed: true,
      })
    );

    const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
    const resource = canvas?.images?.[0]?.resource;
    const imageUrl = resource?.["@id"];

    if (index === prev) {
      this.dispatchEvent(new CustomEvent("hide-frame", { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(
        new CustomEvent("show-frame", {
          detail: { url: imageUrl, x, y, w, h },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  render() {
    return html`
      ${this.annotations.length === 0
        ? html`<div class="text-gray-500 italic">No annotations available.</div>`
        : html`
            <ul class="space-y-4">
              ${this.annotations.map((ann, i) => {
          const isActive = this.activeAnnotationIndex === i;
          const xywh = ann.region;

          let x = 0, y = 0, w = 0, h = 0;
          if (xywh) ({ x, y, w, h } = this._parseXYWH(xywh));

          return html`
                  <li
                    class="text-sm text-gray-700 border-b pb-2 relative transition-colors duration-300 rounded-md px-2
                      ${isActive ? "bg-yellow-100" : "hover:bg-gray-50"}"
                  >
                    <div class="flex justify-between">
                      <div class="pt-1 flex items-center gap-3 text-sm">
                        <span
                          class="inline-flex items-center justify-center rounded-full bg-gray-200 w-7 h-7 text-xl"
                          title="${Array.isArray(ann.motivation) ? ann.motivation[0] : ann.motivation}"
                        >
                          ${getMotivationIcon(ann.motivation)}
                        </span>
                        <strong>#${i + 1}</strong>
                      </div>

                      <div class="flex items-center gap-4">
                        <button
                          @click=${() => this.toggleAnnotation(i)}
                          class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10
                            ${isActive ? "bg-red-600" : "bg-blue-600"} text-white hover:bg-green-600"
                        >
                          <div
                            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
                          >
                            <i
                              class="fa-solid
                              ${isActive ? "fa-magnifying-glass-minus" : "fa-magnifying-glass"}
                              text-lg flex-shrink-0 transition-transform duration-300"
                            ></i>
                            <span
                              class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                              >${isActive ? "Hide" : "Show"}</span
                            >
                          </div>
                        </button>

                        ${isActive
              ? html`
                              <cp-anedit></cp-anedit>
                              <cp-andelete></cp-andelete>
                            `
              : null}
                      </div>
                    </div>

                    ${ann.chars
              ? html`
                          <div class="prose prose-sm max-w-none pt-2">
                            ${unsafeHTML(ann.chars)}
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
}

customElements.define("cp-anviewer", CpAnViewer);