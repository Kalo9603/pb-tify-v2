import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";


export class CpMainText extends UtBase {
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
        <div class="mx-auto max-w-4xl px-3">
            <h1 class="text-5xl font-bold text-center mt-4">IIIF Viewer and Annotator</h1>
            <p class="text-center text-lg my-10">
                If a manifest URL is already provided by attribute <code>manifest</code>, the viewer will load it automatically without input bar.
                <br />
                If not, please, enter an URL in the input box, then click on Show.
                <br />
                If the resource exists, you will show the corrispective one with its information.
                <br />
                Alternatively, you can import your own IIIF manifest file by clicking on &quot;Import&quot; button.
            </p>
        </div>
        `;
    }

}
customElements.define('cp-main-text', CpMainText);