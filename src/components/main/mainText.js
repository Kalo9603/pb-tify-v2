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
        <div class="mx-auto max-w-4xl px-4">
            <h1 class="text-5xl font-bold text-center mt-4">IIIF Viewer and Annotator</h1>
            <p class="text-center text-lg my-10">
                Please, enter an URL in the text box below, then click on Show.
                <br />
                If exists, you will show the corrispective resource with its respective information.
                <br />
                Alternatively, you can import your own IIIF manifest file by clicking on &quot;Import&quot; button.
            </p>
        </div>
        `;
    }

}
customElements.define('cp-main-text', CpMainText);