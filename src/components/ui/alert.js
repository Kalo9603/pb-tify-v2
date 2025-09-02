import { html } from "https://esm.sh/lit-element";
import { UtBase } from "../../utilities/base.js";
import { config } from "../../utilities/config.js";

export class CpAlert extends UtBase {
  static get properties() {
    return {
      messages: { type: Array },
    };
  }

  constructor() {
    super();
    this.messages = [];
  }

  show(type, text, options = {}) {
    const exists = this.messages.find(m => m.type === type && m.text === text);
    if (exists) return;

    const id = Date.now() + Math.random();
    const msg = {
      id,
      type,
      text,
      leaving: false,
      icon: options.icon || config.messageIcons[type] || "ℹ️",
      color: options.color || config.messageColors[type] || "gray-500"
    };
    this.messages = [...this.messages, msg];

    setTimeout(() => this._hideMessage(id), 3000);
  }

  dynamicMessage(type, template, values = {}) {
    const message = template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
    this.show(type, message);
  }

  _hideMessage(id) {
    this.messages = this.messages.map(m =>
      m.id === id ? { ...m, leaving: true } : m
    );
    setTimeout(() => {
      this.messages = this.messages.filter(m => m.id !== id);
    }, 500);
  }

  render() {
    return html`
      <style>
        @keyframes toast-in {
          from { transform: translateY(-20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes toast-out {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(-20px) scale(0.95); opacity: 0; }
        }
        .animate-toast-in { animation: toast-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        .animate-toast-out { animation: toast-out 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
      </style>

      <div class="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full px-4">
        ${this.messages.map(m => html`
          <div
            class="flex justify-center items-center gap-3 ${m.leaving ? 'animate-toast-out' : 'animate-toast-in'} 
                   text-white border px-6 py-3 mb-4 rounded-xl shadow-2xl font-medium min-w-[320px] max-w-[540px] text-center transition-all duration-500 ease-in-out"
            style="background-color: ${this._resolveColor(m.color)};"
          >
            <span class="mr-2" style="user-select: none;">${m.icon}</span>
            <span class="flex-1 text-center" style="user-select: none;">${m.text}</span>
          </div>
        `)}
      </div>
    `;
  }

  _resolveColor(colorName) {
    if (!colorName) return "gray";
    if (/^[a-z]+-\d{3,4}$/.test(colorName)) {
      return `var(--tw-${colorName.replace("-", "-")})`;
    }
    return colorName;
  }
}

customElements.define("cp-alert", CpAlert);