import {KeycloakService} from "keycloak-angular";
import {Injector} from "@angular/core";
import {environment} from "../environments/environment";

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  if (environment.auth.enabled === true) {
    return (): Promise<any> => keycloak.init(
      environment.auth.options
    );
  } else {
    return (): Promise<any> => {
      return new Promise<any>((resolve, reject) => {
        resolve(true);
      });
    };
  }
}

export class InjectorHolder {
  static angularInjector: Injector;
}
