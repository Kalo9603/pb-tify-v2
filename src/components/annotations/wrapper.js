import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import "./form.js";
import "./annotations.js";

export class CpAnWrapper extends UtBase {

    static get properties() {
        return {
            manifestObject: { type: Object },
            canvasIndex: { type: Number },
            localAnnotations: { type: Array },
            annotationMode: { type: String },
            annotationToEdit: { type: Object },
        };
    }

    constructor() {
        super();
        this.manifestObject = null;
        this.canvasIndex = 0;
        this.localAnnotations = [];
        this.annotationMode = "";
        this.annotationToEdit = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("annotation-add", () => this._setMode("add"));
        this.addEventListener("annotation-edit", this._annotationEdit.bind(this));
        this.addEventListener("annotation-delete", () => this._setMode("delete"));
        this.addEventListener("mode-toggle", (e) => this._modeToggle(e));
        this.addEventListener("cancel-edit", () => this._setMode(""));
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
                this.dispatchEvent(new CustomEvent("show-frame", {
                    detail: { color: "view" },
                    bubbles: true,
                    composed: true
                }));
            }
        }

        this.requestUpdate();
    }

    _onAddSubmit(e) {
        this.dispatchEvent(new CustomEvent("add-annotation-submit", {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
        this._setMode("");
    }

    _onEditSubmit(e) {
        this.dispatchEvent(new CustomEvent("edit-annotation-submit", {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
        this._setMode("");
    }

    _annotationEdit(e) {
        console.log("Annotation edit event received in wrapper", e.detail);

        if (!e.detail || !e.detail.annotation) {
            console.warn("Evento edit senza annotation valida, ignorato");
            return;
        }

        this._setMode("edit", e.detail.annotation);
    }

    _modeToggle(e) {
        e.stopPropagation();
        const { mode, annotation } = e.detail || {};
        this._setMode(mode, annotation);
    }

    render() {
        return html`
      <div class="flex flex-col gap-6">
        <cp-annotations
          .manifestObject=${this.manifestObject}
          .canvasIndex=${this.canvasIndex}
          .annotationMode=${this.annotationMode}
          .localAnnotations=${this.localAnnotations}
          .annotationToEdit=${this.annotationToEdit}
        ></cp-annotations>

        ${this.annotationMode
                ? html`
            <cp-anform
              .manifestObject=${this.manifestObject}
              .canvasIndex=${this.canvasIndex}
              .mode=${this.annotationMode}
              .annotationToEdit=${this.annotationToEdit}
              .readonly=${this.annotationMode === 'delete'}
              @add-annotation-submit=${e => this._onAddSubmit(e)}
              @edit-annotation-submit=${e => this._onEditSubmit(e)}
              @cancel-edit=${() => this._setMode("")}
            ></cp-anform>
          `
                : null}
      </div>
    `;
    }

}

customElements.define("cp-anwrapper", CpAnWrapper);