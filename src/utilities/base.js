import { LitElement, css } from "https://esm.sh/lit-element";
import { pbMixin } from "https://esm.sh/@teipublisher/pb-components/src/pb-mixin.js";


export class UtBase extends pbMixin(LitElement) {

    createRenderRoot() {
        return this; // Disabilita shadow DOM per tutti i componenti che la estendono
    }

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: system-ui, sans-serif;
            }

            body {
                    font-family: Arial, sans-serif;
                    background-color: #DDF;
            }

            button, a {
                cursor: pointer;
            }

        `;
    }

}