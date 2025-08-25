import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpAnHideAll extends UtBase {

  static get properties() {
    return {
      activeAnnotations: { type: Array }
    };
  }

  constructor() {
    super();
    this.activeAnnotations = [];
  }

  _hideAll() {
    this.dispatchEvent(new CustomEvent("hide-all-annotations", { 
      bubbles: true, 
      composed: true 
    }));
  }

  render() {
    const hasActive = this.activeAnnotations?.length > 0;
    return html`
      <button
        @click=${this._hideAll}
        class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-32 overflow-hidden h-10
          ${hasActive ? "bg-red-600" : "bg-gray-400"} text-white hover:bg-red-800 disabled:opacity-50"
        ?disabled=${!hasActive}>
        
        <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
          <i class="fa-solid fa-eye-slash text-lg flex-shrink-0 transition-transform duration-300"></i>
          <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
            Hide All
          </span>
        </div>
      </button>
    `;
  }
}

customElements.define("cp-anhideall", CpAnHideAll);