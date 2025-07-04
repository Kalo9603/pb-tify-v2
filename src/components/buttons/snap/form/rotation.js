import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormRotation extends UtBase {
  static get properties() {
    return {
      rotation: { type: Number },
      mirror: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.rotation = 0;
    this.mirror = false;
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("rotation-updated", {
        detail: {
          rotation: this.rotation,
          mirror: this.mirror,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  onRotationChange(e) {
    const val = Math.min(Math.max(Number(e.target.value), 0), 360);
    this.rotation = val;
    this._emitChange();
  }

  onMirrorChange(e) {
    this.mirror = e.target.checked;
    this._emitChange();
  }

  render() {
    return html`
      <div class="flex flex-col gap-3 w-full">
        <label
          for="rotation-input"
          class="block mb-2 text-lg font-bold text-gray-900"
        >
          Rotation
        </label>

        <div class="flex items-center gap-1">
          <input
            id="rotation-input"
            type="number"
            min="0"
            max="360"
            .value="${this.rotation}"
            @input="${this.onRotationChange}"
            class="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
          />
          <span class="text-gray-700 font-semibold text-sm">°</span>
        </div>

        <label class="inline-flex items-center gap-2 text-gray-900 font-semibold text-sm">
          <input
            type="checkbox"
            class="rounded border-gray-300 focus:ring-blue-600"
            .checked="${this.mirror}"
            @change="${this.onMirrorChange}"
          />
          Flip before rotation
        </label>
      </div>
    `;
  }
}

customElements.define("cp-sprotation", CpSnapFormRotation);