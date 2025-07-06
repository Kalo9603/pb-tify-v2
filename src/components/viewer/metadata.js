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
    const m = this.manifestObject;
    if (!m) {
      this.entries = [];
      this.error = "No manifest loaded";
      return;
    }

    const entryMap = new Map();

    if (Array.isArray(m.metadata)) {
      m.metadata.forEach((entry) => {
        const label = this.filterByLanguage(entry.label);
        const value = this.filterByLanguage(entry.value);

        if (!label) return;

        if (entryMap.has(label)) {
          const prev = entryMap.get(label);
          entryMap.set(label, prev + ", " + value);
        } else {
          entryMap.set(label, value);
        }
      });
    }

    const extras = {
      Description: m.description,
      Attribution: m.attribution,
      License: m.license,
      Logo: m.logo,
      SeeAlso: m.seeAlso,
      Related: m.related,
      Within: m.within,
      Rendering: m.rendering,
    };

    for (const [label, value] of Object.entries(extras)) {
      const val = this.filterByLanguage(value);
      if (val) entryMap.set(label, val);
    }

    this.entries = Array.from(entryMap, ([label, value]) => ({ label, value }));
    this.error = null;
  }

  filterByLanguage(input) {
    if (!input) return "";

    if (typeof input === "string") return input;
    if (Array.isArray(input)) {
      const matchLang = input.find(
        (el) =>
          el?.["@language"]?.toLowerCase() ===
          this.selectedLanguage?.toLowerCase()
      );
      if (matchLang) return matchLang["@value"];

      const fallback = input.find((el) =>
        ["none", "und", "zxx"].includes(el?.["@language"]?.toLowerCase())
      );
      if (fallback) return fallback["@value"];

      return input[0]?.["@value"] ?? "";
    }

    if (typeof input === "object" && "@value" in input) return input["@value"];

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
                <tr class="hover:bg-gray-100 transition border-b border-gray-200">
                  <td class="py-2 pr-4 font-semibold text-gray-900 whitespace-nowrap w-1/3">
                    ${unsafeHTML(sanitizeHTML(getHTMLString(entry.label)))}
                  </td>
                  <td class="py-2 text-gray-600">
                    ${unsafeHTML(sanitizeHTML(getHTMLString(entry.value)))}
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