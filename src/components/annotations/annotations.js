import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import "./view.js";

export class CpAnnotations extends UtBase {
  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      entries: { type: Array },
      annotationCount: { type: Number }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.entries = [];
    this.annotationCount = null;
  }

  render() {
    return html`
      <div class="flex flex-col max-h-[80vh] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">

        <header class="flex-none px-4 py-2 border-b border-gray-200 text-gray-800 font-semibold text-lg select-none">
          ✍🏻 Annotations
        </header>

        <section class="overflow-auto p-4 max-h-[60vh]">
          <cp-anviewer
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
            @annotations-count=${e => this.annotationCount = e.detail.count}
          ></cp-anviewer>
        </section>

        <footer
          class="flex items-center justify-center sticky bottom-0 bg-white border-t border-gray-200 shadow-inner gap-6 px-4 py-2 rounded-b-xl select-none z-10"
        >
          <button
            @click=${() => this._onAdd()}
            title="Add annotation"
            class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-24 overflow-hidden h-10 bg-green-600 text-white hover:shadow-md"
            type="button"
          >
            <div
              class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
            >
              <i class="fa-solid fa-plus"></i>
              <span
                class="text-sm font-medium whitespace-nowrap transition-all duration-300
                opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
              >
                Add
              </span>
            </div>
          </button>

          ${this.annotationCount > 0
            ? html`
                <button
                  @click=${() => this._onEdit()}
                  title="Edit annotation"
                  class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-24 overflow-hidden h-10 bg-orange-500 text-white hover:shadow-md"
                  type="button"
                >
                  <div
                    class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
                  >
                    <i class="fa-solid fa-pencil"></i>
                    <span
                      class="text-sm font-medium whitespace-nowrap transition-all duration-300
                      opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                    >
                      Edit
                    </span>
                  </div>
                </button>

                <button
                  @click=${() => this._onDelete()}
                  title="Delete annotation"
                  class="group flex items-center rounded-full shadow-xl transition-all duration-300 px-3 py-2 w-12 hover:w-28 overflow-hidden h-10 bg-red-600 text-white hover:shadow-md"
                  type="button"
                >
                  <div
                    class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:gap-2"
                  >
                    <i class="fa-solid fa-trash"></i>
                    <span
                      class="text-sm font-medium whitespace-nowrap transition-all duration-300
                      opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto group-hover:ml-2"
                    >
                      Delete
                    </span>
                  </div>
                </button>
              `
            : null}
        </footer>

      </div>
    `;
  }

  _onAdd() {
    this.dispatchEvent(new CustomEvent("annotation-add", { bubbles: true, composed: true }));
  }
  _onEdit() {
    this.dispatchEvent(new CustomEvent("annotation-edit", { bubbles: true, composed: true }));
  }
  _onDelete() {
    this.dispatchEvent(new CustomEvent("annotation-delete", { bubbles: true, composed: true }));
  }
}

customElements.define("cp-annotations", CpAnnotations);