import { html } from "https://esm.sh/lit-element";
import { UtBase } from "./utilities/base.js";
import "./components/load/inputBar.js";
import "./components/load/manifestImport.js";

export class PbTest extends UtBase {

  static get properties() {
    return {
      ...super.properties
    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="p-8">
        <cp-input-bar targetPath="/view"></cp-input-bar>
        <cp-mimport></cp-mimport>
      </div>
      <div class="my-8 flex items-center justify-center text-xl">
        Result
      </div>
    `;
  }
}

customElements.define('pb-test', PbTest);