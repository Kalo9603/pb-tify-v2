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

  isMachineTranslated(lang) {
    return lang.toLowerCase().includes('-x-mt');
  }

  selectLanguage(lang) {
    this.selectedLanguage = lang;
    const mt = this.isMachineTranslated(lang);
    this.dispatchEvent(
      new CustomEvent("languagechange", {
        detail: { 
          language: lang,
          isMachineTranslated: mt
        },
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

  machineIconSmall(size = 40) {
    return html`
      <div
        class="flex items-center justify-center rounded-full bg-green-600 text-white ml-2 flex-shrink-0"
        style="width: ${size}px; height: ${size}px;"
      >
        <i class="fas fa-desktop" style="font-size: ${size * 0.5}px;"></i>
      </div>
    `;
  }

  render() {

    const flag = this.getFlagUrl(this.selectedLanguage);
    const currentLabel = this.getLanguageLabel(this.selectedLanguage);
    const mt = this.isMachineTranslated(this.selectedLanguage);

    const machineIcon = html`
      <div class="relative group flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white cursor-default">
        <i class="fas fa-desktop text-lg"></i>
        <div
          class="absolute bottom-full mb-2 px-4 py-2 text-sm text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-fit min-w-[16rem] text-center break-words"
        >
          This language is Machine Translated.
        </div>
      </div>
    `;

    return html`
      <div class="relative inline-block text-left min-w-[40px]">
        <div class="flex items-center gap-4">
          ${mt ? machineIcon : null}

          <div class="group flex justify-end gap-4">
            <button
              @click=${this.toggleDropdown}
              class="relative flex items-center rounded-full shadow-xl px-3 py-2 cursor-pointer
                     hover:shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400
                     overflow-hidden h-10 origin-left
                     ${mt ? 'bg-green-700 text-white' : 'bg-blue-600 text-white'}
                     ${this.isOpen ? 'w-[250px]' : 'w-[40px]'} hover:w-[250px]"
              style="margin-left:auto"
            >
              ${flag
                ? html`<img
                    src="${flag.src}"
                    srcset="${flag.srcset}"
                    width="${flag.width}"
                    alt="${flag.alt}"
                    class="rounded-sm flex-shrink-0"
                  />`
                : this.machineIconSmall()}

              <span
                class="ml-3 text-base font-normal whitespace-nowrap
                       overflow-hidden
                       transition-[opacity,width] duration-300 ease-in-out
                       ${this.isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                       group-hover:opacity-100 group-hover:w-auto"
                style="pointer-events:none"
              >
                ${this._capitalize(currentLabel)}
              </span>

              <svg
                class="ml-2 h-5 w-5 flex-shrink-0 transform transition-transform duration-300"
                style="opacity: ${this.isOpen ? 1 : 0}; transform: rotate(${this.isOpen ? 180 : 0}deg);"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        ${this.isOpen
          ? html`
              <ul
                class="absolute z-10 mt-2 bg-blue-600 rounded-lg shadow-lg max-h-60 overflow-y-auto
                       focus:outline-none w-full"
                style="left: 0;"
              >
                ${this.availableLanguages.map((lang) => {
                  const flagObj = this.getFlagUrl(lang);
                  const label = this.getLanguageLabel(lang);
                  const isMt = this.isMachineTranslated(lang);
                  const isSelected = this.selectedLanguage === lang;

                  let bgClass = "";
                  if (isSelected && isMt) {
                    bgClass = "bg-green-800 font-semibold hover:bg-green-900";
                  } else if (isSelected) {
                    bgClass = "bg-blue-800 font-semibold hover:bg-blue-900";
                  } else if (isMt) {
                    bgClass = "bg-green-600 hover:bg-green-800";
                  } else {
                    bgClass = "hover:bg-blue-700";
                  }

                  return html`
                    <li
                      @click=${() => this.selectLanguage(lang)}
                      class="cursor-pointer select-none flex items-center px-4 py-3 text-white transition-colors duration-150
                             ${bgClass}"
                      tabindex="0"
                      style="width: 100%;"
                    >
                      ${flagObj
                        ? html`<img
                            src="${flagObj.src}"
                            srcset="${flagObj.srcset}"
                            width="${flagObj.width}"
                            alt="${label} flag"
                            class="mr-3 rounded-sm flex-shrink-0"
                          />`
                        : this.machineIconSmall()}
                      <span class="text-base font-normal truncate mr-4">${this._capitalize(label)}</span>
                      ${isMt ? this.machineIconSmall(28) : ""}
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