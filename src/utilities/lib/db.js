import { config } from "../config.js";

export async function saveToDb(payload, componentName) {

  if (!payload || !componentName) return false;

  const baseUrl = `${config.baseUrl}:${config.ports.existDb}${config.paths.annotationCreate(componentName)}`;
  const url = `${baseUrl}?_=${Date.now()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/xml",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const xmlText = await response.text();

    if (!response.ok) {
      console.error("Errore nella creazione remota:", xmlText);
      return false;
    }

    return true;

  } catch (err) {
    console.error("Errore di rete durante il salvataggio remoto:", err);
    return false;
  }
}

export async function updateInDb(payload, componentName) {
  if (!payload || !componentName) return false;

  const baseUrl = `${config.baseUrl}:${config.ports.existDb}${config.paths.annotationUpdate(componentName) || config.paths.annotationCreate(componentName)}`;
  const url = `${baseUrl}?_=${Date.now()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/xml",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const xmlText = await response.text();

    if (!response.ok) {
      console.error("Errore nell'aggiornamento remoto:", xmlText);
      return false;
    }

    return true;

  } catch (err) {
    console.error("Errore di rete durante l'aggiornamento remoto:", err);
    return false;
  }
}

export async function deleteFromDb(payload, componentName) {

  if (!payload || !componentName) return false;

  const baseUrl = `${config.baseUrl}:${config.ports.existDb}${config.paths.annotationDelete(componentName)}`;
  const url = `${baseUrl}?_=${Date.now()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/xml",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const xmlText = await response.text();

    if (!response.ok) {
      console.error("Errore nella cancellazione remota:", xmlText);
      return false;
    }

    return true;

  } catch (err) {
    console.error("Errore di rete durante la cancellazione remota:", err);
    return false;
  }
}

export async function refreshAnnotations(manifestUrl, componentInstance) {
  
  if (!manifestUrl || !componentInstance) return;

  try {

    const manifestRes = await fetch(`${manifestUrl}?_=${Date.now()}`);
    if (!manifestRes.ok) {
      throw new Error(`Manifest loading error: ${manifestRes.status}`);
    }
    
    const updatedManifest = await manifestRes.json();
    componentInstance.manifestObject = updatedManifest;
    
    const canvas = updatedManifest?.sequences?.[0]?.canvases?.[componentInstance.canvasIndex];
    const annList = canvas?.otherContent?.find(c => c["@type"] === "sc:AnnotationList");
    
    if (annList?.["@id"]) {
      
      try {
        const listRes = await fetch(`${annList["@id"]}?_=${Date.now()}`);
        if (listRes.ok) {
          const listData = await listRes.json();
        }
      } catch (listErr) {
        console.warn("Annotation list not available yet: ", listErr);
      }
    }
    
    componentInstance.dispatchEvent(
      new CustomEvent("refresh-annotations", {
        detail: { manifestObject: updatedManifest },
        bubbles: true,
        composed: true
      })
    );
    
    const viewer = componentInstance.renderRoot?.querySelector("cp-anviewer");
    if (viewer) {
      viewer.manifestObject = updatedManifest;
      viewer.requestUpdate("manifestObject");
      viewer.fetchAnnotations();
    }
    
    
  } catch (err) {
    console.error("Refresh error: ", err);
  }
}