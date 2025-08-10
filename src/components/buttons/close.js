import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpClose extends UtBase {
  static get properties() {
    return {
      ...super.properties,
    };
  }

  constructor() {
    super();
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="flex items-center">
        <button
          @click="${this.handleClose}"
          title="Close view"
          class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10
            bg-red-600 text-white hover:shadow-md"
          type="button"
        >
          <div
            class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
          >
            <i class="fa-solid fa-xmark fa-lg flex-shrink-0 transition-transform duration-300"></i>
            <span
              class="text-sm font-medium whitespace-nowrap transition-all duration-300
                opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
            >
              Close
            </span>
          </div>
        </button>
      </div>
    `;
  }
}

customElements.define('cp-close', CpClose);