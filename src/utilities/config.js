const getBaseUrl = (host = "localhost") => `http://${host}`;
const getDbMainPath = (component = "ex-pb-tify") => `/exist/apps/${component}`;

const getAnnotationsPath = (component = "ex-pb-tify") => `${getDbMainPath(component)}/annotations`;
const getManifestsPath = (component = "ex-pb-tify") => `${getDbMainPath(component)}/manifest`;
const getAPIPath = (component = "ex-pb-tify") => `${getDbMainPath(component)}/api`;

const getCreateEndpoint = (component = "ex-pb-tify") => `${getAPIPath(component)}/create`;
const getUpdateEndpoint = (component = "ex-pb-tify") => `${getAPIPath(component)}/edit`;
const getDeleteEndpoint = (component = "ex-pb-tify") => `${getAPIPath(component)}/delete`;

export const config = {

  componentName: "ex-pb-tify",
  host: "localhost",

  get baseUrl() {
    return getBaseUrl(this.host);
  },

  ports: {
    existDb: 8080
  },

  paths: {
    dbMainPath: getDbMainPath,
    manifests: getManifestsPath,

    annotations: getAnnotationsPath,

    annotationCreate: getCreateEndpoint,
    annotationUpdate: getUpdateEndpoint,
    annotationDelete: getDeleteEndpoint
  },

  canvas: {
    canvasIndexDefault: 0,
  },

  snapshot: {
    coords: { p1: [0, 0], p2: [0, 0] },
    initialDimensions: { width: 0, height: 0 },
    region: "full",
    rotation: 0,
    mirror: false,
    quality: "default",
    format: "jpg",
    size: "full",
    upscale: false
  },

  annotations: {
    defaultAnnotationXYWH: [0, 0, 0, 0]
  },

  frame: {

    naturalDimensions: [0, 0],
    baseDimensions: [0, 0],

    zoom: {
      default: 1,
      min: 0.25,
      max: 25,
      step: 0.05,
      timing: 250   // ms
    },

    scroll: {
      speed: 15,
      margin: 20
    }

  },

  colors: [
    "red", "orange", "amber", "yellow", "lime", "green",
    "emerald", "teal", "cyan", "sky", "blue", "indigo",
    "violet", "purple", "fuchsia", "pink", "rose",
    "slate", "gray", "zinc", "neutral", "stone"
  ],

  get motivations() {
    const base = [
      "painting", "describing", "tagging", "linking", "assessing",
      "bookmarking", "classifying", "editing", "highlighting", "identifying",
      "moderating", "questioning", "replying"
    ];
    return ["commenting", ...base.sort()];
  },

  manifestVersionColor: {
    "1": "bg-green-600",
    "2": "bg-blue-600",
    "3": "bg-red-600"
  },

  motivationIcons: {
    painting: "🎨",
    commenting: "💬",
    describing: "✏️",
    editing: "📝",
    tagging: "👁️‍🗨️",
    linking: "🔗",
    assessing: "⚖️",
    bookmarking: "🔖",
    classifying: "📂",
    highlighting: "🖍️",
    identifying: "🔍",
    moderating: "🛠️",
    questioning: "❓",
    replying: "🗨️",

    default: "📝"
  },

  messageColors: {
    success: "green-600",
    error: "red-600",
    warning: "yellow-500",
    info: "blue-500",
    debug: "gray-500",
    tip: "cyan-500",
    critical: "rose-600"
  },

  messageIcons: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    debug: "🐞",
    tip: "💡",
    critical: "💀"
  },

  messageColors: {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#3b82f6",
    debug: "#8b5cf6",
    tip: "#14b8a6",
    critical: "#7e1212"
  },

  messages: {
    success: {
      manifestLoaded: "Manifest loaded successfully!",
      manifestLoadedByFile: "Manifest loaded from file successfully!",
      localAnnotationSaved: "A new annotation has been saved locally! Remember to export the list.",
      remoteAnnotationSaved: "A new annotation has been saved on the database!",
      annotationEdited: "Annotation edited successfully!",
      annotationDeleted: "Annotation deleted successfully!",
      snapshotSaved: "Snapshot saved successfully!",
      manifestExported: "Manifest exported successfully!",
      annotationsExported: "Annotations exported successfully!",
      coordinatesLocked: "Coordinates have been locked.",
      coordinatesUnlocked: "Coordinates have been unlocked.",
      zoomApplied: "Zoom applied successfully.",
      zoomReset: "Zoom has been reset to default.",
      autoScrollStarted: "Auto-scroll started.",
      autoScrollStopped: "Auto-scroll stopped."
    },

    error: {
      manifestURLLoad: "The provided string is not a valid URL or the resource is unreachable",
      manifestLoad: "Error loading manifest",
      manifestLoadByFile: "Error loading manifest from file",
      remoteAnnotationSave: "Error saving annotation to database",
      annotationEditFail: "Error editing annotation",
      annotationDeleteFail: "Error deleting annotation",
      snapshotFail: "Failed to save snapshot",
      unknownMode: "Unknown annotation mode '{mode}'",
      networkError: "Network error occurred. Please try again",
      invalidCanvasIndex: "The selected canvas index is invalid",
      missingManifestObject: "Manifest object is missing or malformed",
      invalidCoordinates: "Invalid coordinates provided",
      annotationNotFound: "Annotation could not be found",
      duplicateAnnotationError: "Failed to duplicate annotation",
      zoomLimitReached: "Cannot zoom beyond limit",
      autoScrollError: "Auto-scroll failed to start",
      imageLoadFail: "Failed to load image",
      annotationFormError: "Annotation form submission failed"
    },

    warning: {
      outOfRange: "{value} is out of range. Min: {min}, max: {max}",
      allAnnotationsHidden: "All annotations are currently hidden",
      unsavedChanges: "You have unsaved changes!",
      invalidInput: "The provided input is invalid",
      noMatchFilter: "No annotations match the filter query",
      annotationOverlap: "Annotation overlaps with existing annotations",
      clearManifest: "Manifest data has been cleared",
      largeAnnotationSet: "There are many annotations; performance may be affected",
      coordinatesOutsideBounds: "Coordinates are outside the image bounds",
      snapshotOverwriting: "You are about to overwrite an existing snapshot",
      manualZoomRecommended: "Manual zoom adjustment recommended",
      autoScrollActive: "Auto-scroll is active; manual scrolling may be affected"
    },

    info: {
      close: "Component has been closed",
      frameClosed: "Annotation frame has been closed",
      languageChange: "Language has been changed to {language}",
      annotationModeFlush: "Annotation mode has been reset",
      annotationFormClosed: "Annotation form has been closed",
      canvasChange: "Canvas set to page {index}",
      modeActivated: "Switched to {mode} mode",
      modeDeactivated: "Mode {mode} deactivated",
      noActiveAnnotations: "There are no active annotations",
      noManifestLoaded: "No manifest is currently loaded",
      fetchInProgress: "Fetching data...",
      imageReady: "Image is fully loaded",
      coordinatesClosed: "Coordinates tool closed",
      coordinatesRectClosed: "Coordinates rectangle closed",
      zoomReset: "Zoom reset to {percent}%",
    },

    debug: {
      loadedCanvasMetadata: "Loaded canvas metadata: {canvasId}",
      annotationPayload: "Annotation payload: {payload}",
      dbResponse: "Database response: {response}",
      zoomValue: "Current zoom value: {zoom}",
      coordinatesState: "Coordinates state: {state}",
      frameDimensions: "Frame dimensions: {width}x{height}"
    },

    tip: {
      duplicateAnnotation: "You can duplicate annotations using the copy button",
      quickSave: "Remember to save your work frequently to avoid losing progress",
      navigationShortcut: "Use the arrow keys to navigate between canvases quickly",
      copyPasteAnnotation: "Try using copy/paste to replicate annotations quickly",
      useZoomShortcuts: "You can zoom in/out using the mouse wheel or keyboard shortcuts"
    },

    critical: {
      noManifest: "No manifest loaded! Cannot proceed with the operation",
      noRemoteAnnotations: "No remote annotations found for this canvas",
      dbConnectionFailed: "Database connection failed! Operation aborted",
      manifestCorrupt: "Manifest file is corrupt or unreadable",
      unexpectedError: "An unexpected error occurred. Please restart the component",
      snapshotWriteError: "Cannot write snapshot to disk",
      annotationLockError: "Failed to lock annotation for editing",
      frameLoadFailed: "Failed to initialize annotation frame",
      imageCorrupt: "Image file appears to be corrupted or unreadable"
    }
  }

};