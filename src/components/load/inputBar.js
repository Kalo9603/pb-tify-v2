import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpInputBar extends UtBase {
  static get properties() {
    return {
      targetPath: { type: String },
      url: { type: String },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.targetPath = "/view";
    this.url = "";
  }

  handleSubmit(e) {
    
    e.preventDefault();
    if (this.url.trim()) {

      this.dispatchEvent(
        new CustomEvent("URLsubmit", {
          detail: { url: this.url },
          bubbles: true,
          composed: true,
        }));
    }
  }

  handleInput(e) {
    this.url = e.target.value;
  }

  render() {
    return html`
      <form
        @submit="${this.handleSubmit}"
        class="flex items-center bg-gray-100 rounded-full shadow-md w-full h-12"
        style="line-height: 1; margin: 0;"
      >
        <input
          type="text"
          .value="${this.url}"
          @input="${this.handleInput}"
          placeholder="Enter an URL..."
          class="flex-grow bg-transparent border-none text-gray-800 text-lg px-4 h-full rounded-l-full focus:outline-none placeholder-gray-400"
          style="line-height: normal; margin: 0;"
        />
        <button
          type="submit"
          class="bg-blue-600 text-white rounded-r-full px-5 h-full flex items-center justify-center text-base hover:bg-blue-900 transition duration-300"
          aria-label="Submit"
          style="margin: 0;"
        >
          <i class="fa-solid fa-magnifying-glass mr-2"></i> Show
        </button>
      </form>
    `;
  }
}

customElements.define("cp-input-bar", CpInputBar);