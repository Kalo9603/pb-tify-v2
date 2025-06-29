import { html } from "https://esm.sh/lit-element";
import { UtBase } from "./utilities/base.js";

export class PbTest extends UtBase {

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

  render() {
    return html`
      <p class="text-blue-500 text-lg">Ciao, ${this.name}!</p>
    `;
  }
}

customElements.define('pb-test', PbTest);