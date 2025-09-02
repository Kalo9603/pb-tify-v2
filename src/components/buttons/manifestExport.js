import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpManifestExport extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      error: { type: String },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.error = null;
  }

  getManifestLabel(manifest) {
    const rawLabel = manifest.label;
    if (!rawLabel) return "iiif-manifest";
    if (typeof rawLabel === "string") return rawLabel;
    if ("@value" in rawLabel && typeof rawLabel["@value"] === "string") {
      return rawLabel["@value"];
    }
    if (Array.isArray(rawLabel)) {
      const first = rawLabel[0];
      if (first && typeof first["@value"] === "string") return first["@value"];
    }
    const firstLang = Object.keys(rawLabel)[0];
    const values = rawLabel[firstLang];
    if (Array.isArray(values) && values.length > 0 && values[0]["@value"]) {
      return values[0]["@value"];
    }
    return "iiif-manifest";
  }

  sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim().slice(0, 100) || "iiif-manifest";
  }

  getCurrentDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}_${m}_${d}`;
  }

  handleDownload() {
    this.error = null;

    if (!this.manifestObject) {
      this.error = "No manifest loaded to export.";
      this.showAlert("error", "noManifestToExport");
      this.requestUpdate();
      return;
    }

    try {
      const label = this.sanitizeFilename(this.getManifestLabel(this.manifestObject));
      const date = this.getCurrentDate();
      const filename = `${label}_${date}.json`;
      const jsonStr = JSON.stringify(this.manifestObject, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showAlert("success", "manifestExported");
      this.showAlert("info", "downloadReady", { filename });
    } catch (err) {
      this.error = "Failed to export manifest.";
      this.showAlert("error", "manifestExportFailed");
      this.showAlert("critical", "exportException");
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="relative">
        <button
          @click="${this.handleDownload}"
          class="group flex items-center bg-blue-600 text-white rounded-full shadow-xl hover:shadow-md transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10 cursor-pointer"
          aria-label="Export manifest"
          type="button"
        >
          <div
            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
          >
            <i class="fas fa-download"></i>
            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300
              opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >
              Export
            </span>
          </div>
        </button>

        <div class="absolute top-full left-0 mt-1 min-h-[1.5rem] w-64">
          ${this.error ? html`<p class="text-sm text-red-600 font-semibold">${this.error}</p>` : ""}
        </div>
      </div>
    `;
  }
}

customElements.define("cp-mexport", CpManifestExport);