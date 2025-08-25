import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { generateId, isLocalUrl } from "../../utilities/lib/utils.js";
import { config } from "../../utilities/config.js";
import { saveToDb, updateInDb, deleteFromDb, refreshAnnotations } from "../../utilities/lib/db.js";
import "./form.js";
import "./annotations.js";

export class CpAnWrapper extends UtBase {

    static get properties() {
        return {
            manifestUrl: { type: String },
            manifestObject: { type: Object },
            canvasIndex: { type: Number },
            annotationMode: { type: String },
            annotationToEdit: { type: Object },
            activeAnnotations: { type: Array },
            localAnnotations: { type: Array },
        };
    }

    constructor() {
        super();
        this.manifestObject = null;
        this.canvasIndex = config.canvas.canvasIndexDefault;
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
        this.addEventListener("delete-annotation-submit", this._onDeleteSubmit.bind(this));
        this.addEventListener("form-closed", this.handleFormClosed);
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

        if (mode === "") {
            this.dispatchEvent(new CustomEvent("hide-frame", { bubbles: true, composed: true }));
            this.dispatchEvent(new CustomEvent("deactivate-annotation", { bubbles: true, composed: true }));
        }

        this.requestUpdate();
    }

    async _onAddSubmit(e) {

        const newAnnotation = e.detail.annotation;
        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;
        const id = newAnnotation?.["@id"] || `annotation-${Date.now()}`;
        newAnnotation["@id"] = id;

        this.localAnnotations = [...this.localAnnotations, { canvasId, annotation: newAnnotation }];

        const isManifestLocal = isLocalUrl(this.manifestUrl);
        const manifestId = this.manifestObject?.["@id"]?.split("/").pop();
        
        const annotationListUrl = `${config.baseUrl}:${config.ports.existDb}${config.paths.annotations()}/${manifestId}/canvas${this.canvasIndex + 1}.json`;

        if (isManifestLocal) {
            const payload = {
                annotation: newAnnotation,
                canvasId,
                canvasIndex: this.canvasIndex + 1,
                manifestId,
                listId: annotationListUrl
            };

            const success = await saveToDb(payload, config.componentName);

            if (success) {
                
                this.localAnnotations = this.localAnnotations.filter(
                    (entry) => entry.annotation["@id"] !== newAnnotation["@id"]
                );

                await refreshAnnotations(this.manifestUrl, this);
            }
        }

        this._setMode("");
    }

    async _onEditSubmit(e) {
        const edited = e.detail.edited;
        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;
        const annotationListUrl = canvas?.otherContent?.[0]?.["@id"] || "";
        const isManifestLocal = isLocalUrl(this.manifestUrl);
        const manifestId = this.manifestObject?.["@id"]?.split("/").pop();

        if (isManifestLocal) {
            const payload = {
                annotation: edited,
                canvasId,
                canvasIndex: this.canvasIndex + 1,
                manifestId,
                listId: annotationListUrl
            };

            const success = await updateInDb(payload, config.componentName);

            if (success) {
                this.localAnnotations = this.localAnnotations.filter(
                    (entry) => entry.annotation["@id"] !== edited["@id"]
                );

                await refreshAnnotations(this.manifestUrl, this);
            } 
        } else {
            this.localAnnotations = this.localAnnotations.map((entry) => {
                if (entry.annotation["@id"] === edited["@id"]) {
                    return { canvasId, annotation: edited };
                }
                return entry;
            });

            this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
        }

        this.activeAnnotations = [{
            id: edited["@id"],
            annotation: edited
        }];

        this._setMode("");
    }

    async _onDeleteSubmit(e) {
        const { annotation } = e.detail;
        if (!annotation) return;

        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        const canvasId = canvas?.["@id"] || `canvas${this.canvasIndex}`;
        const annotationListUrl = canvas?.otherContent?.[0]?.["@id"] || "";
        const isManifestLocal = isLocalUrl(this.manifestUrl);
        const manifestId = this.manifestObject?.["@id"]?.split("/").pop();

        if (isManifestLocal) {
            const payload = {
                annotation,
                canvasId,
                canvasIndex: this.canvasIndex + 1,
                manifestId,
                listId: annotationListUrl
            };

            const success = await deleteFromDb(payload, config.componentName);

            if (success) {
                this.localAnnotations = this.localAnnotations.filter(
                    entry => !(entry.annotation["@id"] === annotation["@id"] && entry.canvasId === canvasId)
                );

                await refreshAnnotations(this.manifestUrl, this);
                this.activeAnnotations = [];
            } else {
                console.error("❌ Cancellazione remota fallita");
            }
        } else {
            this.localAnnotations = this.localAnnotations.filter(
                entry => !(entry.annotation["@id"] === annotation["@id"] && entry.canvasId === canvasId)
            );

            this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
        }

        this.activeAnnotations = [];
        this._setMode("");
    }

    _onImportSubmit(e) {
        const additions = e.detail.additions;
        this.localAnnotations = [...this.localAnnotations, ...additions];
        this.dispatchEvent(new CustomEvent("refresh-annotations", { bubbles: true, composed: true }));
    }

    _onDuplicateSubmit(e) {
        const original = e.detail.annotation;
        if (!original) return;

        const canvas = this.manifestObject.sequences[0].canvases[this.canvasIndex];
        const canvasId = canvas["@id"] || `canvas${this.canvasIndex}`;
        const duplicated = structuredClone(original);
        duplicated["@id"] = generateId("annotation");

        if (duplicated.resource && typeof duplicated.resource === "object" && duplicated.resource.chars) {
            duplicated.resource.chars += " (copy)";
        }

        this.localAnnotations = [...this.localAnnotations, { canvasId, annotation: duplicated }];
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

    handleFormClosed() { 
        this._setMode(""); 
    }

    render() {
        return html`
            <div class="flex flex-col gap-6 mt-4">
                <cp-annotations
                    .manifestUrl=${this.manifestUrl}
                    .manifestObject=${this.manifestObject}
                    .canvasIndex=${this.canvasIndex}
                    .localAnnotations=${this.localAnnotations}
                    .activeAnnotations=${this.activeAnnotations}
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