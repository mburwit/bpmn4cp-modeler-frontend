// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import {base, BaseConfig, Port} from "./base.config";
import {KeycloakOnLoad} from "keycloak-js";
import packageInfo from "../../package.json";

const windowEnv = (window as { [key: string]: any })["__env"] as { [key: string]: any };

const backend: BaseConfig = {
  protocol: windowEnv["repositoryProtocol"] || "http",
  host: windowEnv["repositoryHost"] || "localhost",
  port: parseInt(windowEnv["repositoryPort"], 10) as Port || 8080,
  base: windowEnv["repositoryPath"] || "/",
  path: "fhir"
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
    enabled: JSON.parse(windowEnv["keycloakEnabled"]),
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
  production: false,
  config: {
    backend: base(backend),
    icdapi: base(icdapi),
    bpmn2fhir: base(bpmn2fhir),
    auth: {
      enabled: JSON.parse(windowEnv["repositoryAuth"]),
      username: windowEnv["repositoryAuthUser"],
      password: windowEnv["repositoryAuthPassword"]
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
