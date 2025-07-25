const getBaseUrl = (host = "localhost") => `http://${host}`;
const getDbMainPath = (component = "pb-test") => `/exist/apps/${component}`;

const getAnnotationsPath = (component = "pb-test") => `${getDbMainPath(component)}/annotations`;
const getManifestsPath = (component = "pb-test") => `${getDbMainPath(component)}/manifest`;
const getAPIPath = (component = "pb-test") => `${getDbMainPath(component)}/api`;

const getCreateEndpoint = (component = "pb-test") => `${getAPIPath(component)}/create`;
const getUpdateEndpoint = (component = "pb-test") => `${getAPIPath(component)}/edit`;
const getDeleteEndpoint = (component = "pb-test") => `${getAPIPath(component)}/delete`;

export const config = {

  componentName: "pb-test",
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
  }
};