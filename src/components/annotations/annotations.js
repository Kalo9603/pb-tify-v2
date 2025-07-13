import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import "./view.js";
import "./buttons/add.js";
import "./buttons/export.js";
import "./buttons/import.js";

export class CpAnnotations extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      annotationCount: { type: Number },
      currentMode: { type: String },
      localAnnotations: { type: Array }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.annotationCount = 0;
    this.currentMode = "";
    this.localAnnotations = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("annotation-import", this._onImport);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("annotation-import", this._onImport);
  }

  _onImport = (e) => {
    const { additions } = e.detail;
    const existing = new Set(this.localAnnotations.map(a => a.annotation["@id"]));
    const toAdd = additions.filter(a => !existing.has(a.annotation["@id"]));

    if (toAdd.length) {
      this.localAnnotations = [...this.localAnnotations, ...toAdd];
      this._refreshViewer();
    }
  }

  _refreshViewer() {
      const viewer = this.renderRoot.querySelector("cp-anviewer");
      if (viewer) {
        viewer.localAnnotations = [...this.localAnnotations];
        viewer.manifestObject = this.manifestObject;
        viewer.canvasIndex = this.canvasIndex;
        viewer.requestUpdate("localAnnotations");
        viewer.fetchAnnotations();
      }
  }

  _onAdd = () => {
    this.dispatchEvent(new CustomEvent("annotation-add", { bubbles: true, composed: true }));
  }

  _onModeToggle = (e) => {
    this.currentMode = e.detail.mode;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="flex flex-col max-h-[80vh] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <header class="p-4 border-b font-semibold">✍🏻 Annotations</header>

        <section class="p-4 overflow-auto max-h-[60vh]">
          <cp-anviewer
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
            .localAnnotations=${this.localAnnotations}
            @annotations-count=${e => this.annotationCount = e.detail.count}
          ></cp-anviewer>
        </section>

        <footer class="flex items-center justify-center sticky bottom-0 bg-white border-t gap-4 p-2">

          <cp-animport
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
          ></cp-animport>

          <cp-anadd
            .manifestObject=${this.manifestObject}
            .canvasIndex=${this.canvasIndex}
            .currentMode=${this.currentMode}
            @annotation-add=${this._onAdd}
            @mode-toggle=${this._onModeToggle}
            @refresh-annotations=${this._refreshViewer}
          ></cp-anadd>

          ${this.annotationCount > 0 ? html`
            <cp-anexport
              .manifestObject=${this.manifestObject}
              .canvasIndex=${this.canvasIndex}
              .localAnnotations=${this.localAnnotations}
            ></cp-anexport>
          ` : null}

        </footer>
      </div>
    `;
  }
}

customElements.define("cp-annotations", CpAnnotations);