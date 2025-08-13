import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { generateId, getColorVariant } from "../../utilities/lib/utils.js";
import { config } from "../../utilities/config.js";
import "./view.js";
import "./buttons/add.js";
import "./buttons/filter.js";
import "./buttons/hideall.js";
import "./buttons/export.js";
import "./buttons/import.js";

export class CpAnnotations extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      annotationCount: { type: Number },
      currentMode: { type: String },
      localAnnotations: { type: Array },
      activeAnnotations: { type: Array },
      annotationToEdit: { type: Object },
      filterQuery: { type: String }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = config.canvas.canvasIndexDefault;
    this.annotationCount = 0;
    this.currentMode = "";
    this.localAnnotations = [];
    this.annotationToEdit = null;
    this.filterQuery = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("annotation-import", this._onImport);
    this.addEventListener("annotation-duplicate", this._onDuplicate);
    this.addEventListener("mode-toggle", this._onModeToggle);
    this.addEventListener("update-annotation", this._onUpdateAnnotation);
    this.addEventListener("refresh-annotations", this._onRefreshAnnotations);
    this.addEventListener("filter-annotations", this._onFilterAnnotations);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("annotation-import", this._onImport);
    this.removeEventListener("annotation-duplicate", this._onDuplicate);
    this.removeEventListener("mode-toggle", this._onModeToggle);
    this.removeEventListener("update-annotation", this._onUpdateAnnotation);
    this.removeEventListener("refresh-annotations", this._onRefreshAnnotations);
    this.removeEventListener("filter-annotations", this._onFilterAnnotations);
  }

  _onRefreshAnnotations = (e) => {
    this.manifestObject = e.detail.manifestObject;
    this._refreshViewer();
  }
  
  _onFilterAnnotations = (e) => {
    this.filterQuery = e.detail.query;
  }

  _onImport = async (e) => {
    const { additions } = e.detail;
    const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
    const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;

    const manifestAnns = new Set();
    const annList = canvas?.otherContent?.find(c => c["@type"] === "sc:AnnotationList");

    if (annList?.resources?.length) {
      annList.resources.forEach(a => {
        if (a["@id"]) manifestAnns.add(a["@id"]);
      });
    } else if (annList?.["@id"]) {
      try {
        const res = await fetch(annList["@id"]);
        if (res.ok) {
          const data = await res.json();
          data?.resources?.forEach(a => {
            if (a["@id"]) manifestAnns.add(a["@id"]);
          });
        }
      } catch (err) {
        console.warn("⚠️ Unable to load annotations:", err);
      }
    }

    const existingLocalIds = new Set(this.localAnnotations.map(a => a.annotation?.["@id"]).filter(Boolean));

    const toAdd = additions.filter(a => {
      const id = a.annotation?.["@id"];
      return id && !manifestAnns.has(id) && !existingLocalIds.has(id);
    });

    if (toAdd.length) {
      this.localAnnotations = [...this.localAnnotations, ...toAdd];
      this._refreshViewer();
    }
  };

  _onDuplicate = (e) => {
    const original = e.detail.annotation;
    const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
    const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;

    const duplicated = {
      ...structuredClone(original),
      "@id": generateId("annotation")
    };

    if (typeof duplicated.resource === "object" && duplicated.resource.chars) {
      duplicated.resource.chars += " (copy)";
    }

    this.localAnnotations = [
      ...this.localAnnotations,
      { canvasId, annotation: duplicated }
    ];

    this._refreshViewer();
  }

  _onUpdateAnnotation = (e) => {
    const { original, edited } = e.detail;
    const index = this.localAnnotations.findIndex(a => a.annotation["@id"] === original["@id"]);

    if (index !== -1) {
      this.localAnnotations[index] = {
        ...this.localAnnotations[index],
        annotation: edited
      };
      this._refreshViewer();
    }
  }

  _refreshViewer() {
    const viewer = this.renderRoot.querySelector("cp-anviewer");
    if (viewer) {
      viewer.localAnnotations = [...this.localAnnotations];
      viewer.manifestObject = this.manifestObject;
      viewer.canvasIndex = this.canvasIndex;
      viewer.annotationToEdit = this.annotationToEdit;
      viewer.requestUpdate("localAnnotations");
      viewer.fetchAnnotations();
    }
  }

  _onAdd = () => {
    this.dispatchEvent(new CustomEvent("annotation-add", { bubbles: true, composed: true }));
  }

  _onModeToggle = (e) => {
    this.currentMode = e.detail.mode;
    this.annotationToEdit = e.detail.annotation || null;
    this._refreshViewer();
    this.requestUpdate();
  }

  _scrollToAnnotation = (annotationId) => {
    const viewer = this.renderRoot.querySelector("cp-anviewer");
    if (viewer) {
      viewer.scrollToAnnotation(annotationId);
    }
  }

  _getOriginalAnnotationIndex = (activeAnnotation) => {
    const viewer = this.renderRoot.querySelector("cp-anviewer");
    if (viewer && viewer.annotations) {
      const foundIndex = viewer.annotations.findIndex(ann => {
        const annId = ann.full["@id"] || `local-${viewer.annotations.indexOf(ann)}`;
        return annId === activeAnnotation.id;
      });
      return foundIndex !== -1 ? foundIndex + 1 : null;
    }
    return null;
  }

  render() {

    const sortedAnnotations = [...(this.activeAnnotations || [])].sort((a, b) => {
      const indexA = this._getOriginalAnnotationIndex(a) ?? 0;
      const indexB = this._getOriginalAnnotationIndex(b) ?? 0;
      return indexA - indexB;
    });

    return html`

      <div class="flex flex-col max-h-[80vh] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">

        <header class="p-4 text-lg font-semibold text-gray-800">
          <div class="flex items-center gap-2 mb-2">
            <span class="flex items-center justify-center w-6 h-6">✍🏻</span>
            <span>Annotations</span>
          </div>
          
          ${sortedAnnotations?.length > 0 ? html`
          
            <div class="flex gap-2 flex-wrap">

              ${sortedAnnotations.map((ann) => {
                
                const originalIndex = this._getOriginalAnnotationIndex(ann);
                const baseBg = getColorVariant(ann.color, "bg", 100);
                const hoverBg = getColorVariant(ann.color, "bg", -100);
                const borderClass = getColorVariant(ann.color, "border", 0);

                return html`
                  <div
                    class="flex items-center justify-center rounded-full text-white text-sm font-semibold select-none
                          w-7 h-7 border-2 cursor-pointer transition-all duration-200 transform ${baseBg} ${borderClass} hover:${hoverBg} hover:shadow-[0_0_12px_3px_rgba(0,0,0,0.15)] hover:scale-105"
                    @click=${() => this._scrollToAnnotation(ann.id)}
                  >
                    ${originalIndex || '—'}
                  </div>
                `;
              })}
            </div>
          ` : ''}
        </header>

        <section class="p-4 overflow-auto max-h-[60vh]">
          <cp-anviewer
            .manifestUrl=${this.manifestUrl}
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
            .currentMode=${this.currentMode}
            .localAnnotations=${this.localAnnotations}
            .activeAnnotations=${this.activeAnnotations}
            .annotationToEdit=${this.annotationToEdit}
            .filterQuery=${this.filterQuery}
            @annotations-count=${e => this.annotationCount = e.detail.count}
            @mode-toggle=${this._onModeToggle}
          ></cp-anviewer>
        </section>

        <footer class="flex items-center justify-center sticky bottom-0 bg-white border-t gap-4 p-2">
          <cp-animport
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
          ></cp-animport>

          ${this.annotationCount > 0 ? html`<cp-anfilter></cp-anfilter>` : null}

          <cp-anadd
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
            .currentMode=${this.currentMode}
            @annotation-add=${this._onAdd}
            @mode-toggle=${this._onModeToggle}
            @refresh-annotations=${this._refreshViewer}
          ></cp-anadd>

          <cp-anhideall
            .activeAnnotations=${this.activeAnnotations}
            @hide-all-annotations=${() => {
              this.dispatchEvent(new CustomEvent("hide-all-annotations", { bubbles: true, composed: true }));
            }}
          ></cp-anhideall>

          ${this.annotationCount > 0 ? html`
            <cp-anexport
              .manifestObject=${this.manifestObject}
              .canvasIndex=${this.canvasIndex}
              .localAnnotations=${this.localAnnotations}
            ></cp-anexport>
          ` : null}
        </footer>
      </div>
    `;
  }
}

customElements.define("cp-annotations", CpAnnotations);