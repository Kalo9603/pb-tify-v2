import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnExport extends UtBase {

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
    }

    async _exportAnnotations() {
        const canvas = this.manifestObject?.sequences?.[0]?.canvases?.[this.canvasIndex];
        if (!canvas) {
            console.warn("Canvas not found.");
            return;
        }

        const ocEntry = canvas.otherContent?.find(
            item => item["@type"] === "sc:AnnotationList" && typeof item["@id"] === "string"
        );

        if (!ocEntry) {
            console.warn("No AnnotationList in otherContent.");
            return;
        }

        try {
            const response = await fetch(ocEntry["@id"]);
            if (!response.ok) throw new Error("Annotation export error.");

            const data = await response.json();

            const manifestId = this.manifestObject?.["@id"] || "manifest";
            const canvasLabel = canvas.label?.["@value"] || canvas.label || `canvas${this.canvasIndex + 1}`;
            const safeManifestId = manifestId.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, "_") || "manifest";
            const safeCanvasLabel = canvasLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

            const filename = `${safeManifestId}_${safeCanvasLabel}_annotations_${dateStr}.json`;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("❌ Unable to export annotations: ", err.message);
        }
    }

    render() {
        return html`
      <button
        class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-[105px] overflow-hidden h-10 bg-blue-600 text-white hover:shadow-md"
        title="Export annotations"
        @click=${this._exportAnnotations}
      >
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="fa-solid fa-download"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            Export
          </span>
        </div>
      </button>
    `;
    }
}

customElements.define("cp-anexport", CpAnExport);