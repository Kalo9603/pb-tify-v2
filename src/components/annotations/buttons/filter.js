import { html, css } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnFilter extends UtBase {

  static get properties() {
    return {
      open: { type: Boolean },
      filterText: { type: String }
    };
  }

  constructor() {
    super();
    this.open = false;
    this.filterText = "";
  }

  _toggleBar() {
    this.open = !this.open;
    if (!this.open) {
      this.filterText = "";
      this._dispatchFilter();
    }
  }

  _onInput(e) {
    this.filterText = e.target.value;
    this._dispatchFilter();
  }

  _clear() {
    this.filterText = "";
    this._dispatchFilter();
  }

  _dispatchFilter() {
    this.dispatchEvent(new CustomEvent("filter-annotations", {
      detail: { query: this.filterText.trim().toLowerCase() },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
    <div class="relative w-full">
      <button 
        @click="${this._toggleBar}"
        class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10
          ${this.open ? "bg-red-600" : "bg-blue-600"} text-white hover:bg-green-600">
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="fa-solid fa-filter text-lg flex-shrink-0 transition-transform duration-300"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            ${this.open ? "Close" : "Filter"}
          </span>
        </div>
      </button>

      ${this.open ? html`
        <div 
          class="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 
                 border border-gray-300 rounded-lg shadow-lg p-3 animate-slide-down z-50 
                 bg-white/50 backdrop-blur-md">
          <div class="flex items-center gap-2">
            <input
              type="text"
              .value="${this.filterText}"
              @input="${this._onInput}"
              placeholder="Filter..."
              class="flex-1 border rounded-lg px-3 py-2 text-sm shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              @click="${this._clear}"
              class="rounded-full bg-orange-500 text-white shadow-md px-3 py-2 
                     hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-gray-300 
                     transition-colors duration-300">
              <i class="fa-solid fa-eraser"></i>
            </button>
          </div>
        </div>
      ` : null}
    </div>
  `;
  }
}

customElements.define("cp-anfilter", CpAnFilter);
