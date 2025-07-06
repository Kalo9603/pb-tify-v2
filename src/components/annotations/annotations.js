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
      <div class="overflow-auto max-h-[80vh] border border-gray-200 rounded-xl p-4 mt-4 shadow-sm bg-white">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">✍🏻 Annotations</h2>
        </div>

        <cp-anviewer
          .manifestObject=${this.manifestObject}
          .canvasIndex=${this.canvasIndex}
          @annotations-count=${e => this.annotationCount = e.detail.count}
        ></cp-anviewer>
      </div>
    `;
  }
}

customElements.define("cp-annotations", CpAnnotations);
