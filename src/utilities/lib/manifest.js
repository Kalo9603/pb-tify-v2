export function detectIIIFVersion(manifest, { local = false } = {}) {
  const context = manifest?.['@context'];
  if (!context) return local ? 'unknown' : 'unknown';

  const contextList = Array.isArray(context) ? context : [context];

  const hasV2 = contextList.some(
    (ctx) =>
      typeof ctx === 'string' &&
      (ctx.includes('iiif.io/api/presentation/2') ||
        ctx.includes('iiif.io/api/image/2'))
  );

  const hasV3 = contextList.some(
    (ctx) =>
      typeof ctx === 'string' && ctx.includes('iiif.io/api/presentation/3')
  );

  if (hasV2 && !hasV3) return '2';
  if (hasV3 && !hasV2) return '3';

  return 'unknown';
}

export function getLanguages(manifest) {
  const version = detectIIIFVersion(manifest);
  const langs = new Set();

  const scan = (obj) => {
    if (Array.isArray(obj)) {
      obj.forEach(scan);
    } else if (obj && typeof obj === 'object') {
      if (version === '2') {
        if ('@language' in obj && typeof obj['@language'] === 'string') {
          langs.add(obj['@language']);
        }
      } else if (version === '3') {
        const keys = Object.keys(obj);
        const isLangMap = keys.every((k) => Array.isArray(obj[k]));
        if (isLangMap) {
          keys.forEach((k) => langs.add(k));
        }
      }
      Object.values(obj).forEach(scan);
    }
  };

  scan(manifest);
  return Array.from(langs);
}

function convertLabelSmart(label) {
  if (!label || typeof label !== 'object') return undefined;

  const entries = Object.entries(label);
  if (entries.length === 0) return undefined;

  const values = entries.flatMap(([lang, val]) =>
    Array.isArray(val) ? val.map((v) => ({ lang, value: v })) : []
  );

  if (values.length === 0) return undefined;

  const allLanguages = new Set(values.map((v) => v.lang.toLowerCase()));
  const isOnlyNoneLanguage = [...allLanguages].every((l) =>
    ['none', 'und', 'zxx'].includes(l)
  );
  const isSingleLanguage = allLanguages.size === 1;

  if (isOnlyNoneLanguage) {
    return values.length === 1 ? values[0].value : values.map((v) => v.value);
  }

  if (isSingleLanguage) {
    return values.length === 1 ? values[0].value : values.map((v) => v.value);
  }

  return values.map(({ lang, value }) => ({
    '@language': lang,
    '@value': value,
  }));
}

function convertMetadata(metadata = []) {
  return metadata.map((entry) => {
    const label = convertLabelSmart(entry.label);
    const valueRaw = entry.value;

    let value;
    if (valueRaw && typeof valueRaw === 'object' && !Array.isArray(valueRaw)) {
      value = convertLabelSmart(valueRaw);
    } else if (Array.isArray(valueRaw)) {
      value = valueRaw.length === 1 ? valueRaw[0] : valueRaw;
    } else {
      value = valueRaw;
    }

    return {
      label,
      value,
    };
  });
}

export function convertV3toV2(manifestV3) {
  
  if (!manifestV3 || manifestV3.type !== 'Manifest') {
    throw new Error('Not a valid IIIF v3 manifest');
  }

  const canvases = (manifestV3.items || []).map((canvas) => ({
    '@id': canvas.id,
    '@type': 'sc:Canvas',
    label: convertLabelSmart(canvas.label),
    height: canvas.height,
    width: canvas.width,
    images: (canvas.items || []).flatMap((page) =>
      (page.items || []).map((anno) => ({
        '@id': anno.id,
        '@type': 'oa:Annotation',
        motivation: anno.motivation,
        resource: {
          '@id': anno.body.id,
          '@type': 'dctypes:Image',
          format: anno.body.format,
          height: anno.body.height,
          width: anno.body.width,
          service: anno.body.service,
        },
        on: canvas.id,
      }))
    ),
  }));

  return {
    '@context': 'http://iiif.io/api/presentation/2/context.json',
    '@id': manifestV3.id,
    '@type': 'sc:Manifest',
    label: convertLabelSmart(manifestV3.label),
    metadata: convertMetadata(manifestV3.metadata),
    description: convertLabelSmart(manifestV3.summary),
    thumbnail: manifestV3.thumbnail,
    sequences: [
      {
        '@id': `${manifestV3.id}/sequence/normal`,
        '@type': 'sc:Sequence',
        canvases,
      },
    ],
  };
}