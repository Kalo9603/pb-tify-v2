import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import "./form.js";
import "./annotations.js";

export class CpAnWrapper extends UtBase {
    static get properties() {
        return {
            manifestObject: { type: Object },
            canvasIndex: { type: Number },
            annotationMode: { type: String },
            annotationToEdit: { type: Object },
            localAnnotations: { type: Array },
        };
    }

    constructor() {
        super();
        this.manifestObject = null;
        this.canvasIndex = 0;
        this.annotationMode = "";
        this.annotationToEdit = null;
        this.localAnnotations = [];
    }

    connectedCallback() {

        super.connectedCallback();

        this.addEventListener("annotation-import", this._onImportSubmit.bind(this));
        this.addEventListener("annotation-duplicate", this._onDuplicateSubmit.bind(this));
        this.addEventListener("annotation-add", () => this._setMode("add"));
        this.addEventListener("annotation-edit", this._annotationEdit.bind(this));
        this.addEventListener("annotation-delete", () => this._setMode("delete"));
        this.addEventListener("mode-toggle", (e) => this._modeToggle(e));
        this.addEventListener("cancel-edit", () => this._setMode(""));
        this.addEventListener("refresh-annotations", () => this.requestUpdate());
    }

    _setMode(mode, annotation = null) {
        const oldMode = this.annotationMode;
        this.annotationMode = mode;

        if (mode === "edit" || mode === "delete") {
            this.annotationToEdit = annotation || null;
        } else {
            this.annotationToEdit = null;
        }

        if (oldMode === "edit" || oldMode === "delete") {
            if (mode === "") {
                this.dispatchEvent(
                    new CustomEvent("show-frame", {
                        detail: { color: "view" },
                        bubbles: true,
                        composed: true,
                    })
                );
            }
        }

        this.requestUpdate();
    }

    _onAddSubmit(e) {

        console.trace("[CpAnWrapper] _onAddSubmit detail:", e.detail);

        const newAnnotation = e.detail.annotation;
        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;
        const id = newAnnotation?.["@id"] || `annotation-${Date.now()}`;
        newAnnotation["@id"] = id;
        this.localAnnotations = [...this.localAnnotations, { canvasId, annotation: newAnnotation }];

        this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
        this._setMode("");
    }

    _onEditSubmit(e) {

        console.trace("[CpAnWrapper] _onEditSubmit detail:", e.detail);

        const edited = e.detail.edited;
        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;

        this.localAnnotations = this.localAnnotations.filter(
            (entry) => entry.annotation["@id"] !== edited["@id"]
        );
        this.localAnnotations = [...this.localAnnotations, { canvasId, annotation: edited }];

        this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
        this._setMode("");
    }

    _onImportSubmit(e) {
        console.trace("[CpAnWrapper] _onImportSubmit detail:", e.detail);
        const additions = e.detail.additions;
        this.localAnnotations = [...this.localAnnotations, ...additions];
        this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
    }

    _onDuplicateSubmit(e) {
        console.trace("[CpAnWrapper] _onDuplicateSubmit detail:", e.detail);
        const { annotation: dup } = e.detail;
        const canvas = this.manifestObject.sequences[0].canvases[this.canvasIndex];
        const canvasId = canvas["@id"] || `canvas${this.canvasIndex}`;
        this.localAnnotations = [...this.localAnnotations, { canvasId, annotation: dup }];
        this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
    }

    _annotationEdit(e) {
        if (!e.detail || !e.detail.annotation) return;
        this._setMode("edit", e.detail.annotation);
    }

    _modeToggle(e) {
        e.stopPropagation();
        const { mode, annotation } = e.detail || {};
        this._setMode(mode, annotation);
    }

    render() {
        return html`
      <div class="flex flex-col gap-6 mt-4">
        <cp-annotations
          .manifestObject=${this.manifestObject}
          .canvasIndex=${this.canvasIndex}
          .localAnnotations=${this.localAnnotations}
          .currentMode=${this.annotationMode}
          .annotationToEdit=${this.annotationToEdit}
        ></cp-annotations>

        ${this.annotationMode
                ? html`
              <cp-anform
                .manifestObject=${this.manifestObject}
                .canvasIndex=${this.canvasIndex}
                .mode=${this.annotationMode}
                .annotationToEdit=${this.annotationToEdit}
                .readonly=${this.annotationMode === "delete"}
                @add-annotation-submit=${(e) => this._onAddSubmit(e)}
                @edit-annotation-submit=${(e) => this._onEditSubmit(e)}
                @cancel-edit=${() => this._setMode("")}
              ></cp-anform>
            `
                : null}
      </div>
    `;
    }
}

customElements.define("cp-anwrapper", CpAnWrapper);