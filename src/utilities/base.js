import { LitElement, css } from "https://esm.sh/lit-element";
import { pbMixin } from "https://esm.sh/@teipublisher/pb-components/src/pb-mixin.js";
import { config } from "./config.js";

export class UtBase extends pbMixin(LitElement) {

    createRenderRoot() {
        return this;
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

    connectedCallback() {
        super.connectedCallback();
        this._importDependencies();
    }

    _importDependencies() {
        const head = document.head;

        if (!document.querySelector("#tailwind-cdn")) {
            const link = document.createElement("script");
            link.src = "https://cdn.tailwindcss.com";
            link.id = "tailwind-cdn";
            head.appendChild(link);
        }

        if (!document.querySelector("#colors-hex")) {
            const chex = document.createElement("link");
            chex.href = "../src/style/colors/colors-hex.css";
            chex.rel = "stylesheet";
            chex.id = "colors-hex";
            head.appendChild(chex);
        }

        if (!document.querySelector("#colors-rgb")) {
            const crgb = document.createElement("link");
            crgb.href = "../src/style/colors/colors-rgba.css";
            crgb.rel = "stylesheet";
            crgb.id = "colors-rgb";
            head.appendChild(crgb);
        }

        if (!document.querySelector('link[data-fontawesome]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            fa.integrity = 'sha512-x...';
            fa.crossOrigin = 'anonymous';
            fa.referrerPolicy = 'no-referrer';
            fa.setAttribute('data-fontawesome', 'true');
            head.appendChild(fa);
        }

        if (!document.querySelector("#pb-tify-cdn")) {
            const script = document.createElement("script");
            script.type = "module";
            script.src = "https://cdn.jsdelivr.net/npm/@teipublisher/pb-components/dist/pb-tify.js";
            script.setAttribute("data-auto", "false");
            script.id = "pb-tify-cdn";
            head.appendChild(script);
        }

        if (!document.querySelector("#pb-components-cdn")) {
            const script = document.createElement("script");
            script.type = "module";
            script.src = "https://cdn.jsdelivr.net/npm/@teipublisher/pb-components/dist/pb-components-bundle.js";
            script.crossOrigin = "anonymous";
            script.id = "pb-components-cdn";
            head.appendChild(script);
        }

        if (!document.querySelector("#webcomponents-loader")) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.6.0/webcomponents-loader.min.js";
            script.id = "webcomponents-loader";
            head.appendChild(script);
        }
    }

    showAlert(type, messageKey, values = {}) {
        
        const text = config.messages[type]?.[messageKey];
        if (!text) {
            console.warn(`Message key "${messageKey}" not found for type "${type}"`);
            return;
        }

        this.dispatchEvent(new CustomEvent("show-alert", {
            detail: { 
                type, 
                text: text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`),
                color: config.messageColors[type] || "blue-500",
                icon: config.messageIcons[type] || "ℹ️"
            },
            bubbles: true,
            composed: true
        }));
    }

}