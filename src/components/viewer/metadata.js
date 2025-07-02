import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { sanitizeHTML, getHTMLString } from "../../utilities/lib/utils.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";

export class CpMetadata extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      selectedLanguage: { type: String },
      error: { type: String },
      entries: { type: Array },
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.entries = [];
    this.error = null;
    this.selectedLanguage = "";
  }

  updated(changedProps) {
    if (
      changedProps.has("manifestObject") ||
      changedProps.has("selectedLanguage")
    ) {
      this.loadMetadata();
    }
  }

  loadMetadata() {
    if (this.manifestObject && this.manifestObject.metadata) {
      const rawEntries = this.manifestObject.metadata;
      this.entries = rawEntries.map((entry) => ({
        label: this.filterByLanguage(entry.label),
        value: this.filterByLanguage(entry.value),
      }));
      this.error = null;
    } else {
      this.entries = [];
      this.error = this.manifestObject ? null : "No manifest loaded";
    }
  }

  filterByLanguage(input) {
    if (!input) return "";

    if (typeof input === "string") return input;
    if (Array.isArray(input)) {

      const filtered = input.find(
        (el) =>
          el?.["@language"]?.toLowerCase() ===
          this.selectedLanguage?.toLowerCase()
      );

      if (filtered) return filtered["@value"];

      const fallback = input.find((el) =>
        ["none", "und", "zxx"].includes(el?.["@language"]?.toLowerCase())
      );
      if (fallback) return fallback["@value"];

      return input[0]?.["@value"] ?? "";
    }

    return String(input);
  }

  render() {
    if (this.error)
      return html`<div class="text-red-600">⚠️ ${this.error}</div>`;

    if (!this.entries.length)
      return html`<div class="text-gray-500">No metadata available.</div>`;

    return html`
      <div
        class="overflow-auto max-h-[80vh] border border-gray-200 rounded-xl p-4 mb-4 shadow-sm bg-white"
      >
        <h2 class="text-lg font-semibold text-gray-800 mb-4">📄 Metadata</h2>
        <table class="w-full text-sm text-left text-gray-700 border-collapse">
          <tbody>
            ${this.entries.map(
              (entry) => html`
                <tr
                  class="hover:bg-gray-100 transition border-b border-gray-200"
                >
                  <td
                    class="py-2 pr-4 font-semibold text-gray-900 whitespace-nowrap w-1/3"
                  >
                    ${unsafeHTML(
                      sanitizeHTML(getHTMLString(entry.label))
                    )}
                  </td>
                  <td class="py-2 text-gray-600">
                    ${unsafeHTML(
                      sanitizeHTML(getHTMLString(entry.value))
                    )}
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define("cp-mdata", CpMetadata);