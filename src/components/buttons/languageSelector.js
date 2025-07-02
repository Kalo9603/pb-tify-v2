import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { getFlagEmoji, languageLabels } from "../../utilities/lib/languages.js";

export class CpLangSelector extends UtBase {
  static get properties() {
    return {
      availableLanguages: { type: Array },
      selectedLanguage: { type: String },
      isOpen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.availableLanguages = [];
    this.selectedLanguage = "";
    this.isOpen = false;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  selectLanguage(lang) {
    this.selectedLanguage = lang;
    this.dispatchEvent(
      new CustomEvent("languagechange", {
        detail: { language: lang },
        bubbles: true,
        composed: true,
      })
    );
    this.closeDropdown();
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleClickOutside = this._handleClickOutside.bind(this);
    document.addEventListener("mousedown", this._handleClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("mousedown", this._handleClickOutside);
  }

  _handleClickOutside(event) {
    if (!this.shadowRoot) return;
    const path = event.composedPath();
    if (!path.includes(this)) {
      this.closeDropdown();
    }
  }

  render() {
    const currentLabel =
      languageLabels[this.selectedLanguage] || this.selectedLanguage.toUpperCase();
    const currentFlag = getFlagEmoji(this.selectedLanguage);

    return html`
      <div class="relative inline-block text-left">
        <div class="group w-20 hover:w-44 transition-all duration-300 ease-in-out">
          <button
            @click=${this.toggleDropdown}
            class="flex items-center bg-blue-600 text-white rounded-full shadow-xl px-3 py-2 w-full cursor-pointer
              hover:shadow-md transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 18.93A8.01 8.01 0 014.07 13H11v7.93zM13 13v7.93A8.01 8.01 0 0119.93 13H13zm6.36-2H18v-1h1.36a7.977 7.977 0 00-1.09-2.38l.96-.96a8.037 8.037 0 011.79 3.34zm-1.42-5.37l-.96.96A7.99 7.99 0 0015 5.64V4h1.36a7.977 7.977 0 001.58 3.63zM11 4v1.64a7.99 7.99 0 00-2.98 1.95l-.96-.96A7.977 7.977 0 0111 4z"
              />
            </svg>

            <span class="text-lg">${currentFlag}</span>

            <span
              class="ml-2 text-sm font-medium whitespace-nowrap opacity-0 w-0 overflow-hidden 
              group-hover:opacity-100 group-hover:w-auto transition-all duration-300"
            >
              ${currentLabel}
            </span>

            <svg
              class="ml-2 h-4 w-4 flex-shrink-0 transform transition-transform duration-300
                ${this.isOpen ? "rotate-180 opacity-100" : "opacity-0 group-hover:opacity-100"}"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        ${this.isOpen
          ? html`
              <ul
                class="absolute z-10 mt-2 w-44 bg-blue-600 rounded-lg shadow-lg max-h-60 overflow-auto
                  focus:outline-none animate-fade-in"
              >
                ${this.availableLanguages.map(
                  (lang) => html`
                    <li
                      @click=${() => this.selectLanguage(lang)}
                      class="cursor-pointer select-none flex items-center px-3 py-2 text-white transition-colors duration-150
                      ${
                        this.selectedLanguage === lang
                          ? "bg-blue-800 font-semibold"
                          : "hover:bg-blue-700"
                      }"
                      tabindex="0"
                    >
                      <span class="text-lg mr-2">${getFlagEmoji(lang)}</span>
                      <span class="text-sm">
                        ${languageLabels[lang] || lang.toUpperCase()}
                      </span>
                    </li>
                  `
                )}
              </ul>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("cp-lselector", CpLangSelector);