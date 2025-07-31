import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { detectIIIFVersion, convertV3toV2 } from "../../utilities/lib/manifest.js";

export class CpTifyWrapper extends UtBase {
  
  static get properties() {
    return {
      manifestUrl: { type: String },
      manifestObject: { type: Object },
      canvasIndex: { type: Number },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestUrl = "";
    this.manifestObject = null;
    this.canvasIndex = 0;
    this._viewer = null;
  }

  firstUpdated() {
    this.loadViewer();
  }

  updated(changedProps) {
    if (changedProps.has("manifestUrl") || changedProps.has("manifestObject")) {
      this.loadViewer();
    }

    if (changedProps.has("canvasIndex")) {
      const newIndex = this.canvasIndex;
      if (this._viewer && this._viewer._tify?.ready) {
        this._viewer._tify.app?.setPage?.(newIndex + 1);
      }
    }
  }

  async loadViewer() {
    const container = this.renderRoot.querySelector("#container");
    if (!container) return;

    container.innerHTML = "";

    if (!this.manifestUrl && !this.manifestObject) {
      return;
    }

    await customElements.whenDefined("pb-tify");

    const viewer = document.createElement("pb-tify");
    viewer.style.width = "100%";
    viewer.style.height = "100%";
    container.appendChild(viewer);
    this._viewer = viewer;

    if (this.manifestObject) {
      const version = detectIIIFVersion(this.manifestObject);
      const converted = version === "3" ? convertV3toV2(this.manifestObject) : this.manifestObject;

      if (typeof viewer.setManifest === "function") {
        viewer.setManifest(converted);
      } else if (converted["@id"]?.startsWith("http")) {
        viewer.setAttribute("manifest", converted["@id"]);
      } else {
        return;
      }

    } else if (this.manifestUrl.startsWith("http")) {
      viewer.setAttribute("manifest", this.manifestUrl);
    } else {
      return;
    }

    let attempts = 0;
    while ((!viewer._tify || !viewer._tify.ready) && attempts < 100) {
      await new Promise((r) => setTimeout(r, 50));
      attempts++;
    }

    if (!viewer._tify || !viewer._tify.ready) {
      return;
    }

    await viewer._tify.ready;

    const app = viewer._tify.app;
    const origSetPage = app.setPage?.bind(app);

    if (origSetPage) {
      app.setPage = (i) => {
        const index = Array.isArray(i) ? i[0] : i;
        this.dispatchEvent(new CustomEvent("canvaschange", {
          detail: { canvasIndex: index - 1 },
          bubbles: true,
          composed: true,
        }));
        origSetPage(i);
      };
    }

    viewer.addEventListener("pb-tify:canvasChange", (e) => {
      const detail = e.detail;
      if (typeof detail.index === "number") {
        const logicalIndex = detail.index - 1;
        this.dispatchEvent(new CustomEvent("canvaschange", {
          detail: { canvasIndex: logicalIndex },
          bubbles: true,
          composed: true,
        }));
      }
    });

    if (typeof this.canvasIndex === "number" && this.canvasIndex >= 0) {
      app.setPage(this.canvasIndex + 1);
    } else {
      const initialIndex = app?._currentPage;
      if (typeof initialIndex === "number") {
        this.dispatchEvent(new CustomEvent("canvaschange", {
          detail: { canvasIndex: initialIndex - 1 },
          bubbles: true,
          composed: true,
        }));
      }
    }
  }

  render() {
    return html`
      <div id="container" class="w-full h-[80vh] mb-4 border border-gray-300 rounded-lg overflow-hidden"></div>
    `;
  }
}

customElements.define("cp-tf-wrapper", CpTifyWrapper);