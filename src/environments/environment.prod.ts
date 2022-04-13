import {base, BaseConfig, Port} from "./base.config";
import {KeycloakOnLoad} from "keycloak-js";
import packageInfo from "../../package.json";

const windowEnv = (window as { [key: string]: any })["__env"] as { [key: string]: any };

const backend: BaseConfig = {
  protocol: windowEnv["repositoryProtocol"] || "https",
  host: windowEnv["repositoryHost"] || "localhost",
  port: parseInt(windowEnv["repositoryPort"], 10) as Port || 443,
  base: windowEnv["repositoryPath"] || "/",
  path: "api"
};

const icdapi: BaseConfig = Object.assign(
  {},
  backend,
  {
    path: "icd11-api-token"
  });

const bpmn2fhir: BaseConfig = Object.assign(
  {},
  backend,
  {
    path: "bpmn2fhir"
  });

export const environment = {
  auth: {
    enabled: windowEnv["keycloakEnabled"],
    options: {
      config: {
        url: windowEnv["keycloakUrl"],
        realm: windowEnv["keycloakRealm"],
        clientId: windowEnv["keycloakClientId"]
      },
      initOptions: {
        onLoad: "check-sso" as KeycloakOnLoad,
        silentCheckSsoRedirectUri: window.location.origin + "/assets/silent-check-sso.html"
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ["/assets"]
    },
    requiredRole: windowEnv["keycloakRequiredRole"]
  },
  version: packageInfo.version,
  baseHref: windowEnv["contextPath"],
  production: true,
  config: {
    backend: base(backend),
    icdapi: base(icdapi),
    bpmn2fhir: base(bpmn2fhir)
  }
};
