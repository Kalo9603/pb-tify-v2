import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";
import { config } from "../../../utilities/config.js";

export class CpAnAdd extends UtBase {
  
  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      currentMode: { type: String },
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = config.canvas.canvasIndexDefault;
    this.currentMode = "";
  }

  _onClick() {
    const newMode = this.currentMode === "add" ? "" : "add";
    const eventName = newMode === "" ? "hide-frame" : "annotation-add";
    
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new CustomEvent("mode-toggle", {
        detail: { mode: newMode },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const isActive = this.currentMode === "add";
    const buttonClass = isActive ? "bg-red-600" : "bg-green-600";
    const iconClass = isActive ? "fa-solid fa-xmark" : "fa-solid fa-plus";
    const label = isActive ? "Close" : "Add";

    return html`
      <div class="flex flex-col items-start gap-4 w-full">
        <button
          @click=${this._onClick}
          title="${label} annotation"
          class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-24 overflow-hidden h-10 ${buttonClass} text-white hover:shadow-md"
          type="button"
        >
          <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2">
            <i class="${iconClass}"></i>
            <span class="text-sm font-medium whitespace-nowrap transition-all duration-300 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2">
              ${label}
            </span>
          </div>
        </button>
      </div>
    `;
  }
}

customElements.define("cp-anadd", CpAnAdd);