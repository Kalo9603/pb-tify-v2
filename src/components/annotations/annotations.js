import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import "./view.js";
import "./buttons/add.js";
import "./buttons/export.js";

export class CpAnnotations extends UtBase {

  static get properties() {
    return {
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      entries: { type: Array },
      annotationCount: { type: Number },
      currentMode: { type: String },
      localAnnotations: { type: Array }
    };
  }

  constructor() {
    super();
    this.manifestObject = null;
    this.canvasIndex = 0;
    this.entries = [];
    this.annotationCount = null;
    this.currentMode = "";
    this.localAnnotations = [];
  }

  _onModeToggle(e) {
    this.currentMode = e.detail.mode || "";
    this.dispatchEvent(new CustomEvent("mode-toggle", {
      detail: { mode: this.currentMode },
      bubbles: true,
      composed: true
    }));
  }

  _refreshViewer() {
    const viewer = this.shadowRoot.querySelector("cp-anviewer");
    if (viewer) {
      viewer.localAnnotations = [...this.localAnnotations];
      viewer.fetchAnnotations();
    }
  }

  _onExport() {
    this.dispatchEvent(new CustomEvent("annotation-export", { bubbles: true, composed: true }));
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

          ${this.annotationCount > 0
        ? html`
                <cp-anedit
                  .currentMode=${this.currentMode}
                  @annotation-edit=${() => this._onEdit()}
                  @mode-toggle=${(e) => this._onModeToggle(e)}
                ></cp-anedit>
                <cp-andelete
                  .currentMode=${this.currentMode}
                  @annotation-delete=${() => this._onDelete()}
                  @mode-toggle=${(e) => this._onModeToggle(e)}
                ></cp-andelete>
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