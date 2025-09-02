import { config } from "../config.js";
import DOMPurify from "dompurify";

export async function loadConfig(url) {
  const res = await fetch(url);
  const text = await res.text();

  const config = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#") || trimmed.startsWith("[")) continue;

    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      config[key.trim()] = rest.join("=").trim();
    }
  }
  return config;
}

export function sanitizeHTML(input) {
  if (!input) return "";

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "a", "b", "i", "u", "em", "strong", "br", "p",
      "ul", "ol", "li", "span", "code", "pre", "blockquote", "del", "mark", "sup", "sub",
      "h1", "h2", "h3", "h4", "h5", "h6"
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class"]
  });
}

export function getText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;

  if (Array.isArray(val)) {
    return val
      .map(item =>
        typeof item === 'string'
          ? item
          : (item?.['@value'] || '')
      )
      .filter(s => s.trim() !== '')
      .join(', ');
  }

  if (typeof val === 'object') {
    return val['@value'] || '';
  }

  return '';
}

export function getHTMLString(val) {
  if (!val) return '';

  if (typeof val === 'string') return val;

  if (Array.isArray(val)) {
    return val
      .map(item =>
        typeof item === 'string'
          ? item
          : (item?.['@value'] || '')
      )
      .filter(s => s.trim() !== '')
      .join(', ');
  }

  if (typeof val === 'object') {
    return val['@value'] || '';
  }

  return '';
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function ensureOrder(x1, x2) {
  if (x2 < x1) return [x1, x1];
  return [x1, x2];
}

export function validateCoordinates(region, width, height, x1, y1, x2, y2) {
  if (region === "coordinates%") {
    x1 = Math.max(0, Math.min(x1, 100));
    y1 = Math.max(0, Math.min(y1, 100));
    x2 = Math.max(0, Math.min(x2, 100));
    y2 = Math.max(0, Math.min(y2, 100));
  } else {
    x1 = Math.max(0, Math.min(x1, width));
    y1 = Math.max(0, Math.min(y1, height));
    x2 = Math.max(0, Math.min(x2, width));
    y2 = Math.max(0, Math.min(y2, height));
  }

  if (x2 < x1) [x1, x2] = [x2, x1];
  if (y2 < y1) [y1, y2] = [y2, y1];

  return { x1, y1, x2, y2 };
}

export function buildRegionString(regionSelection, x1, y1, x2, y2) {
  if (regionSelection === 'full') return 'full';
  if (regionSelection === 'square') return 'square';
  if (regionSelection === 'coordinates') return `${x1},${y1},${x2},${y2}`;
  if (regionSelection === 'coordinates%') return `pct:${x1},${y1},${x2},${y2}`;
  return 'full';
}

export function getCurrentDateYYYYMMDD() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function sanitizeFilename(str) {
  return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function downloadImage(url, filename) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    })
    .catch(err => {
      console.error("Download fallito:", err);
    });
}

export function calculateRegionDimensions(regionStr, resourceWidth, resourceHeight) {
  let regionWidth, regionHeight;
  if (regionStr === "full") {
    regionWidth = resourceWidth || 800;
    regionHeight = resourceHeight || 600;
  } else if (regionStr === "square") {
    const side = Math.min(resourceWidth || 800, resourceHeight || 600);
    regionWidth = side;
    regionHeight = side;
  } else if (regionStr.startsWith("pct:")) {
    const coords = regionStr.slice(4).split(",").map(Number);
    regionWidth = Math.abs(coords[2] - coords[0]) * (resourceWidth || 800) / 100;
    regionHeight = Math.abs(coords[3] - coords[1]) * (resourceHeight || 600) / 100;
  } else {
    const coords = regionStr.split(",").map(Number);
    regionWidth = Math.abs(coords[2] - coords[0]);
    regionHeight = Math.abs(coords[3] - coords[1]);
  }
  return { regionWidth, regionHeight };
}

export function centerPopupPosition(regionWidth, regionHeight) {
  const left = window.screenX + (window.outerWidth - regionWidth) / 2;
  const top = window.screenY + (window.outerHeight - regionHeight) / 2;
  return { left, top };
}

export function isLocalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function getMotivationIcon(motivation) {
  const mRaw = Array.isArray(motivation) ? motivation[0] : motivation;
  const m = typeof mRaw === "string" ? mRaw.replace(/^(oa:|sc:)/, "") : "";

  return config.motivationIcons[m] || config.motivationIcons.default;
}

export function parseMarkdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown;

  // Blocchi di codice (triple backtick)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Codice inline
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Titoli
  html = html
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Blockquote
  html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

  // Orizzontali
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>");

  // Liste non ordinate
  html = html.replace(/^\s*[-+*] (.*)$/gm, "<ul><li>$1</li></ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Liste ordinate
  html = html.replace(/^\s*\d+\. (.*)$/gm, "<ol><li>$1</li></ol>");
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Apice e pedice
  html = html.replace(/_\((.*?)\)/g, "<sub>$1</sub>");
  html = html.replace(/\^\((.*?)\)/g, "<sup>$1</sup>");

  // Grassetto e corsivo combinati
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");

  // Grassetto
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Corsivo
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Barrato
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>"),

    // Evidenziato
    html = html.replace(/==(.*?)==/g, "<mark>$1</mark>"),

    // Link
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" 
   style="color: blue; text-decoration: none; transition: color 0.3s ease;" 
   onmouseover="this.style.color='darkblue'" 
   onmouseout="this.style.color='blue'">
   $1</a>`);
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p><\/p>/g, "");

  return html;
}

export function getRandomRectColor() {

  const colors = config.colors;

  const random = colors[Math.floor(Math.random() * colors.length)];
  return `border-${random}-600 bg-${random}-600/30`;
}

export function getColorVariant(originalClass, target = "bg", increment = 200) {

  if (!originalClass || typeof originalClass !== 'string') {
    return `${target}-gray-400`;
  }

  const match = originalClass.match(/(border|bg|text)-(\w+)-(\d{3})/);
  if (!match) return `${target}-gray-800`;

  const [, , colorName, intensityStr] = match;
  let intensity = parseInt(intensityStr);

  intensity = Math.min(intensity + increment, 900);

  return `${target}-${colorName}-${intensity}`;

}

export function generateId(prefix = "annotation") {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}