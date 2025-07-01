import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { sanitizeHTML, getHTMLString } from "../../utilities/lib/utils.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";

export class CpMetadata extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      error: { type: String },
      entries: { type: Array },
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.entries = [];
    this.error = null;
  }

  updated(changedProps) {
    if (changedProps.has("manifestObject")) {
      this.loadMetadata();
    }
  }

  loadMetadata() {
    if (this.manifestObject && this.manifestObject.metadata) {
      this.entries = this.manifestObject.metadata;
      this.error = null;
    } else {
      this.entries = [];
      this.error = this.manifestObject ? null : "No manifest loaded";
    }
  }

  render() {
    if (this.error)
      return html`<div class="text-red-600">⚠️ ${this.error}</div>`;

    if (!this.entries.length)
      return html`<div class="text-gray-500">No metadata available.</div>`;

    return html`
      <div class="overflow-auto max-h-[80vh] border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
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