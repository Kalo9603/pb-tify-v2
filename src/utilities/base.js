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

     drawQualityStyle(ctx, quality, x, y, w, h) {
        
        ctx.save();

        switch(quality) {
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
