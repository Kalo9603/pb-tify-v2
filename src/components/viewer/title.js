import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";


export class CpTitle extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      selectedLanguage: { type: String },
      label: { type: String },
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.selectedLanguage = "";
    this.label = "";
  }

  updated(changedProps) {
    if (
      changedProps.has("manifestObject") ||
      changedProps.has("selectedLanguage")
    ) {
      this.updateLabel();
    }
  }

  updateLabel() {
    if (!this.manifestObject) {
      this.label = "";
      return;
    }

    const rawLabel = this.manifestObject.label;
    this.label = this.getLabelInLanguage(rawLabel);
  }

  getLabelInLanguage(input) {
    if (!input) return "Untitled";
    if (typeof input === "string") return input;

    if (Array.isArray(input)) {
      const exact = input.find(
        (el) =>
          el?.["@language"]?.toLowerCase() ===
          this.selectedLanguage?.toLowerCase()
      );
      if (exact) return exact["@value"];

      const fallback = input.find((el) =>
        ["none", "und", "zxx"].includes(el?.["@language"]?.toLowerCase())
      );
      if (fallback) return fallback["@value"];

      return input[0]?.["@value"] ?? "Untitled";
    }

    return String(input);
  }

  get fontSizeClass() {
        const len = this.label.length;
        if (len < 30) return "text-5xl";
        if (len < 60) return "text-4xl";
        if (len < 100) return "text-3xl";
        return "text-2xl";
    }

  render() {
    if (!this.label)
      return html`<div class="text-gray-500">No title available-</div>`;

    return html`
            <div
                class="text-center border-b-2 border-gray-300 pb-4 px-2 
                    animate-fade-in">
                <h1
                class="${this.fontSizeClass} font-bold italic text-gray-800 drop-shadow-sm 
                        hover:text-gray-900 hover:drop-shadow-md 
                        hover:scale-105 hover:rotate-[0.3deg] 
                        transition-all duration-500 ease-in-out"
                >
                ${this.label}
                </h1>
            </div>
    `;
  }
}

customElements.define("cp-title", CpTitle);