import { LitElement, html, css } from "https://esm.sh/lit-element";
import { pbMixin } from "https://esm.sh/@teipublisher/pb-components/src/pb-mixin.js";

export class PbTest extends pbMixin(LitElement) {

  static get properties() {
    return {

      name: { type: String },
      ...super.properties
    };
  }

  constructor() {
    super();
    this.name = 'amico';
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 0.5em 1em;
        background: var(--pb-test-bg, #f0f0f0);
        border-radius: 4px;
        font-family: sans-serif;
      }
      .greeting {
        color: var(--pb-test-color, #333);
      }
    `;
  }

  render() {
    return html`
      <p class="greeting">Ciao, ${this.name}!</p>
    `;
  }
}

customElements.define('pb-test', PbTest);