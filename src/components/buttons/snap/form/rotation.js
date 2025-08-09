import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

export class CpSnapFormRotation extends UtBase {
  static get properties() {
    return {
      rotationData: { type: Object },
      rotation: { type: Number },
      mirror: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.rotation = 0;
    this.mirror = false;
    this.rotationData = {};
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

  _normalizeRotation(val) {
    let n = Number(val);
    if (Number.isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > 360) n = 360;
    return n;
  }

  _canRotateLeft() {
    return this.rotation > 0;
  }

  _canRotateRight() {
    return this.rotation < 360;
  }

  _rotateLeft() {
    if (!this._canRotateLeft()) return;
    if (this.rotation > 0 && this.rotation < 90) {
      this.rotation = 0;
    } else {
      this.rotation = this._normalizeRotation(this.rotation - 90);
    }
    this._emitChange();
  }

  _rotateRight() {
    if (!this._canRotateRight()) return;
    if (this.rotation > 270 && this.rotation < 360) {
      this.rotation = 360;
    } else {
      this.rotation = this._normalizeRotation(this.rotation + 90);
    }
    this._emitChange();
  }

  onRotationChange(e) {
    const val = e.target.value;
    this.rotation = this._normalizeRotation(val);
    this._emitChange();
  }

  render() {
    const { hasRotationBy90s, hasRotationArbitrary, hasMirroring } = this.rotationData || {};

    return html`
      <div class="flex flex-col gap-3 w-full">
        <label class="block mb-2 text-lg font-bold text-gray-900">Rotation</label>

        ${hasRotationBy90s || hasMirroring || hasRotationArbitrary
          ? html`
              <div class="flex flex-col gap-3 mb-4 w-full">
                ${hasRotationBy90s
                  ? html`
                      <div class="flex items-center gap-4 flex-nowrap">
                        <button
                          @click="${this._rotateLeft}"
                          class="group flex items-center rounded-full shadow-xl transition-all duration-200 ease-linear px-3 py-2 w-12 hover:w-24 overflow-hidden h-10
                                bg-blue-600 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          ?disabled="${!this._canRotateLeft()}"
                          title="Left (–90°)"
                        >
                          <div
                            class="flex items-center justify-center w-full transition-all duration-200 ease-linear group-hover:justify-start group-hover:gap-2"
                          >
                            <i
                              class="fa-solid fa-rotate-left text-lg flex-shrink-0 transition-transform duration-200 ease-linear"
                            ></i>
                            <span
                              class="text-sm font-medium whitespace-nowrap transition-all duration-200 ease-linear opacity-0 w-0 overflow-hidden
                                group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                            >
                              Left
                            </span>
                          </div>
                        </button>

                        <button
                          @click="${this._rotateRight}"
                          class="group flex items-center rounded-full shadow-xl transition-all duration-200 ease-linear px-3 py-2 w-12 hover:w-28 overflow-hidden h-10
                                bg-blue-600 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          ?disabled="${!this._canRotateRight()}"
                          title="Right (+90°)"
                        >
                          <div
                            class="flex items-center justify-center w-full transition-all duration-200 ease-linear group-hover:justify-start group-hover:gap-2"
                          >
                            <i
                              class="fa-solid fa-rotate-right text-lg flex-shrink-0 transition-transform duration-200 ease-linear"
                            ></i>
                            <span
                              class="text-sm font-medium whitespace-nowrap transition-all duration-200 ease-linear opacity-0 w-0 overflow-hidden
                                group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                            >
                              Right
                            </span>
                          </div>
                        </button>
                      </div>
                    `
                  : null}

                <div class="flex items-center gap-4 flex-nowrap">
                  ${hasRotationArbitrary
                    ? html`
                        <div class="flex items-center gap-1">
                          <input
                            id="rotation-input"
                            type="number"
                            min="0"
                            max="360"
                            .value="${this.rotation}"
                            @input="${this.onRotationChange}"
                            class="w-[60px] rounded border border-gray-300 px-2 py-1 text-sm text-gray-900
                                  focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ease-linear"
                          />
                          <span class="text-gray-700 font-semibold text-sm select-none">°</span>
                        </div>
                      `
                    : null}

                  ${hasMirroring
                    ? html`
                        <div class="relative group flex items-center justify-center w-max">
                          <button
                            @click="${() => {
                              this.mirror = !this.mirror;
                              this._emitChange();
                            }}"
                            class="flex items-center rounded-full shadow-xl transition-all duration-200 ease-linear px-3 py-2 w-12 hover:w-24 overflow-hidden h-10
                                  ${this.mirror ? "bg-orange-500" : "bg-yellow-400"} 
                                  ${this.mirror ? "hover:bg-orange-600" : "hover:bg-yellow-500"} 
                                  text-white"
                            aria-describedby="flip-tooltip"
                          >
                            <div
                              class="flex items-center justify-center w-full transition-all duration-200 ease-linear group-hover:justify-start group-hover:gap-2"
                            >
                              <i
                                class="fa-solid fa-arrow-right-from-bracket text-lg flex-shrink-0 transition-transform duration-200 ease-linear"
                                style="${this.mirror ? 'transform: rotateY(180deg);' : 'transform: rotateY(0deg);'}"
                              ></i>
                              <span
                                class="text-sm font-medium whitespace-nowrap transition-all duration-200 ease-linear opacity-0 w-0 overflow-hidden
                                    group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                              >
                                Flip
                              </span>
                            </div>
                          </button>

                          <div
                            id="flip-tooltip"
                            role="tooltip"
                            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 text-sm text-white bg-gray-800 rounded shadow-lg
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-linear w-fit min-w-[12rem] text-center break-words pointer-events-none"
                          >
                            Flip before rotation
                          </div>
                        </div>
                      `
                    : null}
                </div>
              </div>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("cp-sprotation", CpSnapFormRotation);