import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

import {
  detectIIIFVersion,
  convertV3toV2,
} from "../../utilities/lib/manifest.js";

export class CpTifyWrapper extends UtBase {
  static get properties() {
    return {
      manifestUrl: { type: String },
      manifestObject: { type: Object },
      ...super.properties,
    };
  }

  constructor() {
    super();
    this.manifestUrl = "";
    this.manifestObject = null;
  }

  firstUpdated() {
    this.loadViewer();
  }

  updated(changedProps) {
    if (
      changedProps.has("manifestUrl") ||
      changedProps.has("manifestObject")
    ) {
      this.loadViewer();
    }
  }

async loadViewer() {
    const container = this.renderRoot.querySelector("#container");
    if (!container) {
        console.warn("Container non trovato");
        return;
    }

    container.innerHTML = "";
    if (!this.manifestUrl && !this.manifestObject) {
        return;
    }

    await customElements.whenDefined("pb-tify");

    const viewer = document.createElement("pb-tify");
    viewer.style.width = "100%";
    viewer.style.height = "100%";

    container.appendChild(viewer);

    const trySetManifestObject = (manifestObj) => {
        if (typeof viewer.setManifest === "function") {
        viewer.setManifest(manifestObj);
        return true;
        }
        return false;
    };

    if (this.manifestObject) {
        const version = detectIIIFVersion(this.manifestObject);
        if (version === "3") {
        const converted = convertV3toV2(this.manifestObject);
        if (!trySetManifestObject(converted)) {
            const blob = new Blob([JSON.stringify(converted)], { type: "application/json" });
            const blobUrl = URL.createObjectURL(blob);
            viewer.setAttribute("manifest", blobUrl);
        }
        } else if (version === "2") {
        if (this.manifestObject["@id"] && (this.manifestObject["@id"].startsWith("http://") || this.manifestObject["@id"].startsWith("https://"))) {
            viewer.setAttribute("manifest", this.manifestObject["@id"]);
        } else {
            if (!trySetManifestObject(this.manifestObject)) {
            const blob = new Blob([JSON.stringify(this.manifestObject)], { type: "application/json" });
            const blobUrl = URL.createObjectURL(blob);
            viewer.setAttribute("manifest", blobUrl);
            }
        }
        } else {
        if (!trySetManifestObject(this.manifestObject)) {
            const blob = new Blob([JSON.stringify(this.manifestObject)], { type: "application/json" });
            const blobUrl = URL.createObjectURL(blob);
            viewer.setAttribute("manifest", blobUrl);
        }
        }
    } else if (this.manifestUrl) {
        if (this.manifestUrl.startsWith("blob:")) {
        try {
            const res = await fetch(this.manifestUrl);
            if (!res.ok) throw new Error("Impossibile scaricare manifest da blob URL");
            const manifest = await res.json();
            if (!trySetManifestObject(manifest)) {
            viewer.setAttribute("manifest", this.manifestUrl);
            }
        } catch (e) {
            console.error("Errore caricando manifest da blob:", e);
            viewer.setAttribute("manifest", this.manifestUrl);
        }
        } else {
        viewer.setAttribute("manifest", this.manifestUrl);
        }
    }
    }


  render() {
    return html`
      <div id="container" class="w-full h-[80vh] border border-gray-300 rounded-lg overflow-hidden"></div>
    `;
  }
  
}

customElements.define("cp-tf-wrapper", CpTifyWrapper);