import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";

const LOCALES_URL = "https://cdn.simplelocalize.io/public/v1/locales";

export class CpLangSelector extends UtBase {
  static get properties() {
    return {
      availableLanguages: { type: Array },
      selectedLanguage: { type: String },
      isOpen: { type: Boolean },
      localesMap: { type: Object },
    };
  }

  constructor() {
    super();
    this.availableLanguages = [];
    this.selectedLanguage = "";
    this.isOpen = false;
    this.localesMap = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleClickOutside = this._handleClickOutside.bind(this);
    document.addEventListener("mousedown", this._handleClickOutside);
    this.loadLocales();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("mousedown", this._handleClickOutside);
  }

  async loadLocales() {
    try {
      const res = await fetch(LOCALES_URL);
      if (!res.ok) throw new Error("Failed to load locales");
      const data = await res.json();
      this.localesMap = {};
      
      for (const locale of data) {
        if (
          locale &&
          locale.language &&
          typeof locale.language.iso_639_1 === "string" &&
          locale.language.iso_639_1.length === 2 &&
          typeof locale.language.name_local === "string"
        ) {
          this.localesMap[locale.language.iso_639_1.toLowerCase()] = locale.language.name_local;
        }
      }
      this.requestUpdate();
    } catch (e) {
      console.warn("Could not load locales:", e);
    }
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

  _handleClickOutside(event) {
    if (!this.shadowRoot) return;
    const path = event.composedPath();
    if (!path.includes(this)) {
      this.closeDropdown();
    }
  }

  languageToCountryCode(language) {
    try {
      const locale = new Intl.Locale(language);
      const maximized = locale.maximize();
      return maximized.region || "un";
    } catch {
      return "un";
    }
  }

  getFlagUrl(language) {
    const countryCode = this.languageToCountryCode(language).toLowerCase();
    if (countryCode === "un") return null;
    return {
      src: `https://flagcdn.com/w20/${countryCode}.png`,
      srcset: `https://flagcdn.com/w40/${countryCode}.png 2x`,
      width: 20,
      alt: `Flag of ${language.toUpperCase()}`,
    };
  }

  getLanguageLabel(language) {
    const baseLang = language.split(/[-_]/)[0].toLowerCase();
    return this.localesMap[baseLang] || language.toUpperCase();
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  render() {
    const flag = this.getFlagUrl(this.selectedLanguage);
    const currentLabel = this.getLanguageLabel(this.selectedLanguage);

    return html`
      <div class="relative inline-block text-left">
        <div class="group w-12 hover:w-44 transition-all duration-300 ease-in-out">
          <button
            @click=${this.toggleDropdown}
            class="flex items-center bg-blue-600 text-white rounded-full shadow-xl px-3 py-2 w-full cursor-pointer
              hover:shadow-md transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden"
          >
            ${flag
              ? html`<img
                  src="${flag.src}"
                  srcset="${flag.srcset}"
                  width="${flag.width}"
                  alt="${flag.alt}"
                  class="mr-2 rounded-sm flex-shrink-0"
                />`
              : html`<span class="mr-2" style="font-size: 1.3em;">🏳️</span>`}

            <span
              class="ml-2 text-sm font-bold whitespace-nowrap opacity-0 w-0 overflow-hidden
              group-hover:opacity-100 group-hover:w-auto transition-all duration-300"
            >
              ${this._capitalize(currentLabel)}
            </span>

            <svg
              class="ml-auto h-4 w-4 flex-shrink-0 transform transition-transform duration-300
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
                ${this.availableLanguages.map((lang) => {
                  const flagObj = this.getFlagUrl(lang);
                  const label = this.getLanguageLabel(lang);
                  return html`
                    <li
                      @click=${() => this.selectLanguage(lang)}
                      class="cursor-pointer select-none flex items-center px-3 py-2 text-white transition-colors duration-150
                      ${this.selectedLanguage === lang ? "bg-blue-800 font-semibold" : "hover:bg-blue-700"}"
                      tabindex="0"
                    >
                      ${flagObj
                        ? html`<img
                            src="${flagObj.src}"
                            srcset="${flagObj.srcset}"
                            width="${flagObj.width}"
                            alt="${label} flag"
                            class="mr-2 rounded-sm flex-shrink-0"
                          />`
                        : html`<span class="mr-2" style="font-size: 1.3em;">🏳️</span>`}
                      <span class="text-sm ${this.selectedLanguage === lang ? 'font-bold' : 'font-normal'}">${this._capitalize(label)}</span>
                    </li>
                  `;
                })}
              </ul>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("cp-lselector", CpLangSelector);