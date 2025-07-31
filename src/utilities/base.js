import { LitElement, css } from "https://esm.sh/lit-element";
import { pbMixin } from "https://esm.sh/@teipublisher/pb-components/src/pb-mixin.js";


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

        // Importazione dinamica degli script necessari al funzionamento

        super.connectedCallback();

        if (!document.querySelector("#tailwind-cdn")) {
            const link = document.createElement("script");
            link.src = "https://cdn.tailwindcss.com";
            link.id = "tailwind-cdn";
            document.head.appendChild(link);
        }

        if (!document.querySelector('link[data-fontawesome]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            fa.integrity = 'sha512-x...';
            fa.crossOrigin = 'anonymous';
            fa.referrerPolicy = 'no-referrer';
            fa.setAttribute('data-fontawesome', 'true');
            document.head.appendChild(fa);
        }

        if (!document.querySelector("#pb-tify-cdn")) {
            const script = document.createElement("script");
            script.type = "module";
            script.src = "https://cdn.jsdelivr.net/npm/@teipublisher/pb-components/dist/pb-tify.js";
            script.setAttribute("data-auto", "false");
            script.id = "pb-tify-cdn";
            document.head.appendChild(script);
        }

        if (!document.querySelector("#pb-components-cdn")) {
            const script = document.createElement("script");
            script.type = "module";
            script.src = "https://cdn.jsdelivr.net/npm/@teipublisher/pb-components/dist/pb-components-bundle.js";
            script.crossOrigin = "anonymous";
            script.id = "pb-components-cdn";
            document.head.appendChild(script);
        }

        if (!document.querySelector("#webcomponents-loader")) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.6.0/webcomponents-loader.min.js";
            script.id = "webcomponents-loader";
            document.head.appendChild(script);
        }

    }

    drawQualityStyle(ctx, quality, x, y, w, h) {

        ctx.save();

        switch (quality) {
            case "gray":
                ctx.fillStyle = "rgba(128, 128, 128, 0.3)";
                ctx.strokeStyle = "rgba(90, 90, 90, 1)";
                ctx.lineWidth = 2;
                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
                break;

            case "bitonal":
                const patternCanvas = document.createElement("canvas");
                patternCanvas.width = 8;
                patternCanvas.height = 8;
                const pctx = patternCanvas.getContext("2d");

                pctx.fillStyle = "white";
                pctx.fillRect(0, 0, 8, 8);

                pctx.strokeStyle = "black";
                pctx.lineWidth = 2;
                pctx.beginPath();
                pctx.moveTo(0, 8);
                pctx.lineTo(8, 0);
                pctx.stroke();

                const pattern = ctx.createPattern(patternCanvas, "repeat");
                ctx.fillStyle = pattern;
                ctx.fillRect(x, y, w, h);

                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
                break;

            case "color":
                const gradient = ctx.createLinearGradient(x, y, x + w, y);
                gradient.addColorStop(0, "red");
                gradient.addColorStop(0.17, "orange");
                gradient.addColorStop(0.34, "yellow");
                gradient.addColorStop(0.51, "green");
                gradient.addColorStop(0.68, "blue");
                gradient.addColorStop(0.85, "indigo");
                gradient.addColorStop(1, "violet");

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, w, h);

                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
                break;

            case "default":
            default:
                ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
                ctx.strokeStyle = "rgba(0, 90, 160, 1)";
                ctx.lineWidth = 3;
                ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

                ctx.fillRect(x, y, w, h);

                ctx.shadowColor = "transparent";
                ctx.strokeRect(x, y, w, h);
                break;
        }

        ctx.restore();
    }

}