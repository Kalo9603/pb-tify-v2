import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { sanitizeHTML } from "../../utilities/lib/utils.js";
import { unsafeHTML } from "https://esm.sh/lit-html/directives/unsafe-html.js";
import { config } from "../../utilities/config.js";
import { getRandomRectColor, getColorVariant } from "../../utilities/lib/utils.js";

export class CpPageMetadata extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      selectedLanguage: { type: String },
      barColor: { type: String }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = config.canvas.canvasIndexDefault;
    this.selectedLanguage = "en";
    this.barColor = "bg-blue-700";
  }

  updated(changedProps) {
    if (changedProps.has("canvasIndex")) {
      let baseColor = getRandomRectColor();
      this.barColor = getColorVariant(baseColor, "bg", 100); 
    }
  }

  render() {
    if (!this.manifestObject) {
      return html`<div class="text-gray-500 p-4">No manifest loaded.</div>`;
    }

    const canvases = this.manifestObject.sequences?.[0]?.canvases || [];
    const idx = this.canvasIndex;
    if (idx < 0 || idx >= canvases.length) {
      return html`
        <div class="text-red-600 p-4 mt-4 bg-red-100 rounded">
          ⚠️ Page ${idx + 1} out of range
        </div>
      `;
    }

    const canvas = canvases[idx];
    const images = Array.isArray(canvas.images) ? canvas.images : [];

    return html`
      <div class="relative overflow-hidden max-h-[80vh] border border-gray-200 rounded-xl shadow-sm bg-white mt-4">
        <div class="absolute inset-y-0 left-0 w-10 ${this.barColor} flex items-center justify-center">
          <span class="text-white font-bold text-lg drop-shadow-md">${idx + 1}</span>
        </div>

        <div class="pl-14">
          <div class="border-b border-gray-200 px-4 py-3 space-y-1 bg-gray-50">
            ${this._getSequenceLabel()
              ? html`
                <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6">📚</span>
                  <span>${this._getSequenceLabel()}</span>
                </h1>
              `
              : null}

            <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6">🖼️</span>
              <span>${this._getLabel(canvas)}</span>
            </h2>
          </div>

          <div class="p-4 overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-700 border-collapse">
              <tbody>
                ${images.flatMap((img) => this._renderObjectAsRows(img, 0))}
              </tbody>
            </table>
          </div>
        </div>
    `;
  }

  _getLocalLabel(rawLabel, fallback = "") {
    if (typeof rawLabel === "string") return rawLabel;

    if (Array.isArray(rawLabel)) {
      const found = rawLabel.find((l) => l["@language"] === this.selectedLanguage);
      return found?.["@value"] || rawLabel[0]?.["@value"] || fallback;
    }

    return rawLabel?.["@value"] || fallback;
  }

  _getLabel(canvas) {
    return this._getLocalLabel(canvas?.label, "Page");
  }

  _getSequenceLabel() {
    const sequence = this.manifestObject?.sequences?.[0];
    return this._getLocalLabel(sequence?.label, "");
  }

  _renderObjectAsRows(obj, level = 0) {
    const excluded = new Set(["placeholderCanvas", "items", "thumbnail", "label", "motivation"]);
    return Object.entries(obj).flatMap(([key, val]) => {
      if (key.startsWith("@") || excluded.has(key)) return [];
      const indentClass = `pl-${level * 4}`;
      const title = key.charAt(0).toUpperCase() + key.slice(1);

      if (Array.isArray(val)) {
        return html`
          <tr class="hover:bg-gray-100 transition border-b border-gray-200">
            <td class="${indentClass} py-2 pr-4 font-semibold text-gray-900 whitespace-nowrap">
              ${title}
            </td>
            <td class="py-2 text-gray-600">
              ${val.map((v) =>
          typeof v === "object"
            ? html`
                      <table class="w-full text-sm text-left text-gray-700 border-collapse mb-2">
                        <tbody>
                          ${this._renderObjectAsRows(v, level + 1)}
                        </tbody>
                      </table>
                    `
            : html`
                      <div class="pl-2 before:content-['•'] before:mr-2">
                        ${String(v)}
                      </div>
                    `
        )}
            </td>
          </tr>
        `;
      }

      if (val && typeof val === "object") {
        return html`
          <tr class="hover:bg-gray-100 transition border-b border-gray-200">
            <td class="${indentClass} py-2 pr-4 font-semibold text-gray-900">${title}</td>
            <td class="py-2 text-gray-600">
              <table class="w-full text-sm text-left text-gray-700 border-collapse">
                <tbody>
                  ${this._renderObjectAsRows(val, level + 1)}
                </tbody>
              </table>
            </td>
          </tr>
        `;
      }

      return html`
        <tr class="hover:bg-gray-100 transition border-b border-gray-200">
          <td class="${indentClass} py-2 pr-4 font-semibold text-gray-900">${title}</td>
          <td class="py-2 text-gray-600">
            ${unsafeHTML(sanitizeHTML(String(val)))}
          </td>
        </tr>
      `;
    });
  }
}

customElements.define("cp-pgmdata", CpPageMetadata);