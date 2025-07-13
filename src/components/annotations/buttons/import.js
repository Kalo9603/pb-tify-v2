import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnImport extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.error = null;
  }

  _handleFileChosen(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);

        if (json["@type"] !== "sc:AnnotationList" || !Array.isArray(json.resources)) {
          this.error = "Invalid AnnotationList JSON file.";
          this.requestUpdate();
          return;
        }

        this._importAnnotations(json.resources);
      } catch (err) {
        this.error = "Failed to parse JSON file.";
        this.requestUpdate();
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  _importAnnotations(newAnnotations) {
    
    if (!this.manifestObject) {
      this.error = "No manifest loaded.";
      this.requestUpdate();
      return;
    }

    const canvas = this.manifestObject.sequences?.[0]?.canvases?.[this.canvasIndex];
    if (!canvas) {
      this.error = "Invalid canvas.";
      this.requestUpdate();
      return;
    }

    const manifestId = this.manifestObject["@id"] || "";
    const canvasId = canvas["@id"] || `canvas${this.canvasIndex}`;

    const filtered = newAnnotations.filter(ann => {
      const annId = ann["@id"];
      const withinId = ann.on?.within?.["@id"];
      return annId && withinId === manifestId;
    });

    if (filtered.length === 0) {
      this.error = "No matching annotations to import.";
      this.requestUpdate();
      return;
    }

    const newAnnotationList = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": `urn:uuid:${crypto.randomUUID()}`,
      "@type": "sc:AnnotationList",
      resources: filtered
    };

    const currentList = canvas.otherContent?.find(c => c["@type"] === "sc:AnnotationList");

    const isSameList = currentList &&
      Array.isArray(currentList.resources) &&
      currentList.resources.length === filtered.length &&
      currentList.resources.every((ann, i) => ann["@id"] === filtered[i]["@id"]);

    if (!canvas.otherContent) canvas.otherContent = [];

    if (!isSameList) {
      const idx = canvas.otherContent.findIndex(c => c["@type"] === "sc:AnnotationList");
      if (idx >= 0) {
        canvas.otherContent[idx] = newAnnotationList;
      } else {
        canvas.otherContent.push(newAnnotationList);
      }
    }

    const additions = filtered.map(ann => ({
      canvasId,
      annotation: ann
    }));

    this.dispatchEvent(new CustomEvent("annotation-import", {
      detail: { additions },
      bubbles: true,
      composed: true
    }));

    this.error = null;
  }


  render() {
    return html`
      <div class="relative flex items-center">
        <label
          for="annotation-import"
          class="group flex items-center bg-blue-600 text-white rounded-full shadow-xl hover:shadow-md
                 transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10 cursor-pointer"
          @click=${() => { this.error = null; this.requestUpdate(); }}
        >
          <div class="flex items-center justify-center w-full transition-all duration-300
                      group-hover:justify-start group-hover:gap-2">
            <i class="fa-solid fa-upload"></i>
            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0
                     overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >Import</span>
          </div>
        </label>

        <input
          id="annotation-import"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change=${this._handleFileChosen}
        />

        ${this.error
        ? html`<span class="absolute left-0 top-full mt-1 text-red-600 text-sm font-medium">${this.error}</span>`
        : null}
      </div>
    `;
  }
}

customElements.define("cp-animport", CpAnImport);