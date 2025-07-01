import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpUrlCopy extends UtBase {
  static get properties() {
    return {
      url: { type: String },
      copied: { type: Boolean },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.url = "";
    this.copied = false;
  }

  async handleCopy() {
    if (!this.url) return;
    try {
      await navigator.clipboard.writeText(this.url);
      this.copied = true;
      this.requestUpdate();
      setTimeout(() => {
        this.copied = false;
        this.requestUpdate();
      }, 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }

  render() {
    if (!this.url) return html``;

    return html`
      <div class="flex items-center">
        <button
          @click="${this.handleCopy}"
          title="Copy manifest URL"
          class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-36 overflow-hidden h-10
            ${this.copied ? "bg-green-600" : "bg-blue-600"} text-white hover:shadow-md"
          "
          type="button"
        >
          <div
            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 flex-shrink-0 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 16h8m-4-4h4m-8 4V8a2 2 0 012-2h4a2 2 0 012 2v8"
              />
            </svg>

            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300
                opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >
              ${this.copied ? "Copied!" : "Copy URL"}
            </span>
          </div>
        </button>
      </div>
    `;
  }
}

customElements.define("cp-url-copy", CpUrlCopy);