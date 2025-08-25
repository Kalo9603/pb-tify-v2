export function isValidManifest(manifest) {
  return manifest && (
    manifest["@context"]?.includes("iiif.io/api/presentation") ||
    manifest["@type"] === "sc:Manifest" ||
    manifest.type === "Manifest"
  );
}

export function isValidAnnotation(annotation) {
  return annotation &&
    annotation["@type"] === "oa:Annotation" &&
    annotation.hasOwnProperty("motivation") &&
    annotation.hasOwnProperty("on") &&
    annotation.hasOwnProperty("resource");
}

export function getManifestVersion(manifest) {
  const ctx = manifest["@context"];
  if (typeof ctx === "string") {
    if (ctx.includes("/presentation/3")) return "3";
    if (ctx.includes("/presentation/2")) return "2";
  } else if (Array.isArray(ctx)) {
    return ctx.some(c => typeof c === "string" && c.includes("/presentation/3")) ? "3" : "2";
  }
  return "unknown";
}

export function getCanvasIds(manifest) {
  if (manifest.sequences?.[0]?.canvases) {
    return manifest.sequences[0].canvases.map(c => c["@id"]);
  }
  if (manifest.items) {
    return manifest.items.map(item => item.id || item["@id"]);
  }
  return [];
}

export function getAnnotationTarget(annotation) {
  if (typeof annotation.on === "string") return annotation.on;
  if (annotation.on?.full) return annotation.on.full;
  return null;
}

export function normalizeAnnotation(annotation, manifestUrl, canvasUrl) {
  return {
    "@context": "http://iiif.io/api/presentation/2/context.json",
    "@type": "oa:Annotation",
    "@id": annotation["@id"] || "",
    "motivation": Array.isArray(annotation.motivation) ? annotation.motivation : [annotation.motivation],
    "on": {
      "@type": "oa:SpecificResource",
      "full": canvasUrl,
      "selector": {
        "@type": "oa:FragmentSelector",
        "value": annotation.on?.selector?.value || "xywh=0,0,0,0"
      },
      "within": {
        "@id": manifestUrl,
        "@type": "sc:Manifest"
      }
    },
    "resource": Array.isArray(annotation.resource)
      ? annotation.resource
      : [annotation.resource]
  };
}

export function parseIIIFUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const lastPart = parts.pop();
    const lastPartSplit = lastPart.split(".").filter(Boolean);
    const allParts = [...parts, ...lastPartSplit];
    if (allParts.length < 6) return null;

    const format = allParts[allParts.length - 1];
    const quality = allParts[allParts.length - 2];
    const rotation = allParts[allParts.length - 3];
    const size = allParts[allParts.length - 4];
    const region = allParts[allParts.length - 5];
    const identifier = allParts[allParts.length - 6];
    const prefixParts = allParts.slice(0, allParts.length - 6);
    const prefix = `${urlObj.origin}/${prefixParts.join("/")}`;

    return { prefix, identifier, region, size, rotation, quality, format, fullUrl: url };
  } catch {
    return null;
  }
}

export async function parseImageAPI(manifestInput) {

  let manifest;

  if (typeof manifestInput === 'string') {
    const res = await fetch(manifestInput);
    if (!res.ok) throw new Error(`Error manifest fetch: ${manifestInput}`);
    manifest = await res.json();
  } else {
    manifest = manifestInput;
  }

  let serviceId = null;

  const possiblePaths = [
    () => manifest.items?.[0]?.thumbnail?.[0]?.service,
    () => manifest.items?.[0]?.items?.[0]?.body?.service,
    () => manifest.sequences?.[0]?.canvases?.[0]?.images?.[0]?.resource?.service,
    () => manifest.items?.[0]?.items?.[0]?.service,
  ];

  for (const getService of possiblePaths) {
    try {
      const service = getService();
      if (service) {
        if (Array.isArray(service)) {
          serviceId = service[0].id || service[0]['@id'] || null;
        } else {
          serviceId = service.id || service['@id'] || null;
        }
      }
      if (serviceId) break;
    } catch (_) { }
  }

  if (!serviceId) {
    throw new Error("No IIIF service found in manifest.");
  }

  async function tryFetch(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${url}`);
      return await res.json();
    } catch (e) {
      if (!url.endsWith('/info.json')) {
        const urlWithInfo = url.replace(/\/$/, '') + '/info.json';
        const resAlt = await fetch(urlWithInfo);
        if (!resAlt.ok) throw new Error(`Fetch failed: ${urlWithInfo}`);
        return await resAlt.json();
      }
      throw e;
    }
  }

  const imageData = await tryFetch(serviceId);
  return imageData;
}

function getField(imageData, v2Field, v3Field) {
  if (!imageData) return null;

  if (v3Field in imageData && imageData[v3Field] != null) {
    return imageData[v3Field];
  }

  if (Array.isArray(imageData.profile)) {
    for (const p of imageData.profile) {
      if (typeof p === "object" && v2Field in p) {
        return p[v2Field];
      }
    }
  }

  return null;
}

function extractQualities(imageData) {
  return getField(imageData, "qualities", "extraQualities");
}

function extractFormats(imageData) {
  return getField(imageData, "formats", "extraFormats");
}

function extractRegion(imageData) {
  if (!imageData) return null;

  const width = imageData.width ?? null;
  const height = imageData.height ?? null;
  let supports = [];

  if (Array.isArray(imageData.extraFeatures)) {
    supports = imageData.extraFeatures;
  } else if (Array.isArray(imageData.profile)) {
    const p = imageData.profile.find(p => typeof p === "object" && Array.isArray(p.supports));
    supports = p?.supports ?? [];
  }

  const regionSupports = supports.filter(s =>
    s === "regionByPct" || s === "regionByPx" || s === "regionSquare"
  );

  return { width, height, supports: regionSupports };
}

function extractRotation(imageData) {
  if (!imageData) return null;

  let supports = [];

  if (Array.isArray(imageData.extraFeatures)) {
    supports = imageData.extraFeatures;
  } else if (Array.isArray(imageData.profile)) {
    const p = imageData.profile.find(
      p => typeof p === "object" && Array.isArray(p.supports)
    );
    supports = p?.supports ?? [];
  }

  const rotationSupports = supports.filter(s =>
    ["mirroring", "rotationArbitrary", "rotationBy90s"].includes(s)
  );

  return {
    hasMirroring: rotationSupports.includes("mirroring"),
    hasRotationArbitrary: rotationSupports.includes("rotationArbitrary"),
    hasRotationBy90s: rotationSupports.includes("rotationBy90s"),
    supports: rotationSupports
  };
}

function extractSize(imageData) {

  if (!imageData) return null;

  const sizes = imageData.sizes ?? null;
  let supports = [];

  if (Array.isArray(imageData.extraFeatures)) {
    supports = imageData.extraFeatures;
  } else if (Array.isArray(imageData.profile)) {
    const p = imageData.profile.find(p => typeof p === "object" && Array.isArray(p.supports));
    supports = p?.supports ?? [];
  }

  const sizeSupports = supports.filter(s => s.includes("sizeBy"));

  return { sizes, supports: sizeSupports };
}

const extractors = {
  quality: extractQualities,
  format: extractFormats,
  region: extractRegion,
  rotation: extractRotation,
  size: extractSize,
};

export function parseImageData(imageData, param) {
  const extractor = extractors[param];
  if (!extractor) return null;
  return extractor(imageData);
}