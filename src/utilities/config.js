const getBaseUrl = (host = "localhost") => `http://${host}`;
const getDbMainPath = (component = "pb-tify-v2") => `/exist/apps/${component}`;

const getAnnotationsPath = (component = "pb-tify-v2") => `${getDbMainPath(component)}/annotations`;
const getManifestsPath = (component = "pb-tify-v2") => `${getDbMainPath(component)}/manifest`;
const getAPIPath = (component = "pb-tify-v2") => `${getDbMainPath(component)}/api`;

const getCreateEndpoint = (component = "pb-tify-v2") => `${getAPIPath(component)}/create`;
const getUpdateEndpoint = (component = "pb-tify-v2") => `${getAPIPath(component)}/edit`;
const getDeleteEndpoint = (component = "pb-tify-v2") => `${getAPIPath(component)}/delete`;

export const config = {

  componentName: "pb-tify-v2",
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

  get motivations() {
    const base = [
                  "painting", "describing", "tagging", "linking", "assessing", 
                  "bookmarking", "classifying", "editing", "highlighting", "identifying",
                  "moderating", "questioning", "replying"
                ];
    return ["commenting", ...base.sort()];
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
  }

};