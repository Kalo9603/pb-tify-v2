import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpManifestImport extends UtBase {
  constructor() {
    super();
    this.error = null;
  }

  render() {
    return html`
      <div class="flex items-center justify-center relative w-full max-w-64 mx-auto">
      <span class="mr-4">or</span>
        <label
          for="manifest-upload"
          class="group flex items-center bg-blue-600 text-white rounded-full shadow-xl hover:shadow-md transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10 cursor-pointer"
          @click=${() => (this.error = null)}
        >
          <div
            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
          >
            <i class="fas fa-upload"></i>
            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300
                     opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >
              Import
            </span>
          </div>
        </label>

        <input
          id="manifest-upload"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change=${this.handleFileChange}
        />

        <div class="absolute top-full left-0 mt-1 min-h-[1.5rem] w-64">
          ${this.error
            ? html`<p class="text-sm text-red-600 font-semibold">${this.error}</p>`
            : ''}
        </div>
      </div>
    `;
  }

  handleFileChange(e) {
    this.error = null;
    this.requestUpdate();

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      this.error = "Please select a valid JSON file.";
      this.requestUpdate();
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        const json = JSON.parse(jsonString);

        if (!json["@context"]) {
          this.error = "Invalid IIIF manifest: missing @context.";
          this.requestUpdate();
          return;
        }

        localStorage.setItem("localManifest", JSON.stringify(json));

        this.dispatchEvent(
          new CustomEvent("manifestload", {
            detail: { manifestData: json, fromLocal: true },
            bubbles: true,
            composed: true,
          })
        );
      } catch {
        this.error = "Error parsing JSON file.";
        this.requestUpdate();
      }
    };

    reader.readAsText(file);
  }
}

customElements.define("cp-mimport", CpManifestImport);