import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";

export class CpPreview extends UtBase {
  static get properties() {
    return {
      region: { type: String },
      width: { type: Number },
      height: { type: Number },
      coordX1: { type: Number },
      coordY1: { type: Number },
      coordX2: { type: Number },
      coordY2: { type: Number },
      quality: { type: String },
      rotation: { type: Number },
      mirror: { type: Boolean },  
    };
  }

  constructor() {
    super();
    this.region = "full";
    this.width = 0;
    this.height = 0;
    this.coordX1 = 0;
    this.coordY1 = 0;
    this.coordX2 = 0;
    this.coordY2 = 0;
    this.quality = "default";
    this.rotation = 0;
    this.mirror = false;
  }

  updated(changedProps) {
    if (
      changedProps.has("region") ||
      changedProps.has("width") ||
      changedProps.has("height") ||
      changedProps.has("coordX1") ||
      changedProps.has("coordY1") ||
      changedProps.has("coordX2") ||
      changedProps.has("coordY2") ||
      changedProps.has("quality") ||
      changedProps.has("rotation") ||
      changedProps.has("mirror")
    ) {
      this._draw();
    }
  }

  drawQualityStyle(ctx, quality, x, y, w, h) {
    switch (quality) {
      case "default":
        ctx.fillStyle = "#0078d7";
        ctx.fillRect(x, y, w, h);
        break;
      case "gray":
        ctx.fillStyle = "#888";
        ctx.fillRect(x, y, w, h);
        break;
      case "bitonal":

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, w, h);

        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, h);

        ctx.restore();
        break;
      case "color":

        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.2, "orange");
        gradient.addColorStop(0.4, "yellow");
        gradient.addColorStop(0.6, "green");
        gradient.addColorStop(0.8, "blue");
        gradient.addColorStop(1, "violet");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
        break;
      default:
        ctx.fillStyle = "#0078d7";
        ctx.fillRect(x, y, w, h);
    }
  }

  _draw() {
    const canvas = this.renderRoot.querySelector("#regionCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#f0f0ff";
    ctx.fillRect(0, 0, W, H);


    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    let x, y, w, h;
    if (this.region === "full") {
      x = 0; y = 0; w = W; h = H;
    } else if (this.region === "square") {
      const side = Math.min(W, H);
      x = (W - side) / 2;
      y = (H - side) / 2;
      w = side; h = side;
    } else if (this.region === "coordinates" || this.region === "coordinates%") {
      if (this.region === "coordinates") {
        x = (this.coordX1 / this.width) * W;
        y = (this.coordY1 / this.height) * H;
        w = ((this.coordX2 - this.coordX1) / this.width) * W;
        h = ((this.coordY2 - this.coordY1) / this.height) * H;
      } else {
        x = (this.coordX1 / 100) * W;
        y = (this.coordY1 / 100) * H;
        w = ((this.coordX2 - this.coordX1) / 100) * W;
        h = ((this.coordY2 - this.coordY1) / 100) * H;
      }
    } else {
      x = 0; y = 0; w = W; h = H;
    }

    ctx.save();

    ctx.translate(x + w/2, y + h/2);
    if (this.mirror) {
      ctx.scale(-1, 1);
    }
    ctx.rotate((this.rotation * Math.PI) / 180);

    this.drawQualityStyle(ctx, this.quality, -w/2, -h/2, w, h);

    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);

    if (this.mirror) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-w/2 + 5, -h/2 + 5);
      ctx.lineTo(-w/2 + 20, -h/2 + 5);
      ctx.lineTo(-w/2 + 20, -h/2 + 20);
      ctx.stroke();
    }

    ctx.restore();
  }

  render() {
    return html`
      <canvas
        id="regionCanvas"
        width="300"
        height="200"
        style="max-width: 160px; max-height: 120px; width: 100%; height: auto; border: 1px solid #ccc; border-radius: 4px; background: #f0f0ff;"
      ></canvas>
    `;
  }
}

customElements.define("cp-preview", CpPreview);