import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../utilities/base.js";

export class CpHeader extends UtBase {

    static get properties() {
        return {
            ...super.properties
        };
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    render() {
        return html`
            <header class="bg-black text-white font-sans p-6 px-8 mb-24 flex justify-between items-center shadow-md relative">
                <h1 class="text-3xl font-bold">IIIF Viewer and Annotator</h1>
            </header>
        `;
    }

}
customElements.define('cp-header', CpHeader);