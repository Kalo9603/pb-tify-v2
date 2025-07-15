import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnDuplicate extends UtBase {

  static get properties() {
    return {
      annotation: { type: Object },
    };
  }

  _duplicate() {
    this.dispatchEvent(new CustomEvent('annotation-duplicate', {
      detail: { annotation: this.annotation },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <button @click=${this._duplicate}
        class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-32 overflow-hidden h-10 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
        title="Duplicate annotation"
        type="button"
      >
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="fa-solid fa-copy"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            Duplicate
          </span>
        </div>
      </button>
    `;
  }
}

customElements.define("cp-anduplicate", CpAnDuplicate);