import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../../../utilities/base.js";

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
      size: { type: String }
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
    this.size = "full";
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
      changedProps.has("mirror") ||
      changedProps.has("size")
    ) {
      this._draw();
    }
  }

  _parseScale(size) {
    if (!size || size === "full" || size === "max") return 1;

    const pctMatch = size.match(/^(\^)?pct:(\d+)$/);
    if (pctMatch) return Number(pctMatch[2]) / 100;

    const widthMatch = size.match(/^(\^)?(\d+),$/);
    if (widthMatch && this.width > 0) {
      return Number(widthMatch[2]) / this.width;
    }

    const heightMatch = size.match(/^(\^)?,(\d+)$/);
    if (heightMatch && this.height > 0) {
      return Number(heightMatch[2]) / this.height;
    }

    const fitMatch = size.match(/^(\^)?!?(\d+),(\d+)$/);
    if (fitMatch && this.width > 0 && this.height > 0) {
      const w = Number(fitMatch[2]);
      const h = Number(fitMatch[3]);
      return Math.min(w / this.width, h / this.height);
    }

    return 1;
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
    } else if (this.region === "coordinates") {
      x = (this.coordX1 / this.width) * W;
      y = (this.coordY1 / this.height) * H;
      w = ((this.coordX2 - this.coordX1) / this.width) * W;
      h = ((this.coordY2 - this.coordY1) / this.height) * H;
    } else if (this.region === "coordinates%") {
      x = (this.coordX1 / 100) * W;
      y = (this.coordY1 / 100) * H;
      w = ((this.coordX2 - this.coordX1) / 100) * W;
      h = ((this.coordY2 - this.coordY1) / 100) * H;
    } else {
      x = 0; y = 0; w = W; h = H;
    }

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (this.mirror) ctx.scale(-1, 1);
    ctx.rotate((this.rotation * Math.PI) / 180);
    this.drawQualityStyle(ctx, this.quality, -w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (this.mirror) {
      ctx.strokeStyle = "#c00";
      ctx.fillStyle = "#c00";
      ctx.lineWidth = 2;
      const arrowLength = 40;
      const arrowHeadSize = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowLength, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-arrowLength, 0);
      ctx.lineTo(-arrowLength + arrowHeadSize, -arrowHeadSize);
      ctx.lineTo(-arrowLength + arrowHeadSize, arrowHeadSize);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    const scale = this._parseScale(this.size);
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "right";

    let bgColor = "#0078d7";
    if (this.quality === "gray") bgColor = "#888888";
    else if (this.quality === "bitonal") bgColor = "#888888";
    else if (this.quality === "color") bgColor = "#888888";

    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    ctx.fillStyle = brightness > 127 ? "#000" : "#fff";
    ctx.fillText(`${(scale * 100).toFixed(0)}%`, W - 10, H - 10);

  }

  render() {
    return html`
      <label for="regionCanvas" class="block mb-2 text-lg font-bold text-gray-900">
        Preview
      </label>
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