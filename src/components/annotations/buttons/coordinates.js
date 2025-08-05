import { html } from "https://esm.sh/lit";
import { UtBase } from "../../../utilities/base.js";

export class CpAnCoords extends UtBase {
    
  static properties = {
    active: { type: Boolean }
  };

  constructor() {
    super();
    this.active = false;
  }

  _toggleCoords() {
    this.active = !this.active;
    this.dispatchEvent(new CustomEvent("coordinates-toggle", {
      detail: { active: this.active },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html `
      <button 
        @click="${this._toggleCoords}"
        class="absolute top-2 right-2 z-20
               group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-48 overflow-hidden h-10
               ${this.active ? "bg-red-600" : "bg-blue-600"} text-white hover:bg-green-600">
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="fa-solid fa-location-crosshairs text-lg flex-shrink-0 transition-transform duration-300"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            ${this.active ? "Hide" : "Show"} Coordinates
          </span>
        </div>
      </button>
    `;
  }
}

customElements.define("cp-ancoords", CpAnCoords);