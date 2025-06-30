import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

export class CpFooter extends UtBase {

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

        const year = new Date().getFullYear();

        return html`
            <footer class="bg-gray-900 text-gray-300 px-8 py-8 mt-24 text-sm">
                <div class="max-w-4xl mx-auto text-center font-sans space-y-2">
                    <p class="text-xl font-semibold text-white mb-8">IIIF Viewer and Annotator</p>
                    <p><b>Author</b> - Dr. Calogero Giudice</p>
                    <p><b>Relators</b> - Prof. <a target="_blank" href="https://unimap.unipi.it/cercapersone/dettaglio.php?ri=4364" class="text-white hover:font-bold transition-all duration-200">Enrica Salvatori</a>, Prof. <a target="_blank" href="https://www.ilc.cnr.it/people/angelo-mario-del-grosso-2/" class="text-white hover:font-bold transition-all duration-200">Angelo Mario Del Grosso</a></p>
                    <div class="flex items-center mx-auto my-8 max-w-4xl justify-center">
                    <a target="_blank" href="https://www.unipi.it/">
                        <img src="../../images/public/logo.png" alt="University Logo" width="64" height="64" class="mr-4" />
                    </a>
                    <div class="border-l-2 border-white h-14 mx-4 my-8"></div>
                        <p>
                            <a target="_blank" href="https://www.unipi.it/">
                            <img src="../../images/public/logo_text.png" alt="University Logo Text" width="176" height="16" class="mx-auto" />
                            </a>
                            <br />
                            <b>Master&apos;s Degree</b> in <a target="_blank" href="https://infouma.fileli.unipi.it/" class="text-white hover:font-bold transition-all duration-200">Digital Humanities</a>
                        </p>
                    </div>
                    <p class="text-gray-500 text-xs mt-4">© ${year} Calogero Giudice. All rights reserved.</p>
                </div>
                </footer>
        `;
    }

}

customElements.define('cp-footer', CpFooter);