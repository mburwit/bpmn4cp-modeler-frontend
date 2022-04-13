import {Injectable} from "@angular/core";
import {KeycloakInstance} from "keycloak-js";
import {KeycloakService} from "keycloak-angular";
import {environment as env} from "../../../../environments/environment";

export const DUMMY_TOKEN = "dummy-token";

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {

  private readonly _keycloakInstance: KeycloakInstance;

  constructor(private _keycloak: KeycloakService) {
    this._keycloakInstance = _keycloak.getKeycloakInstance();
  }

  getToken(): Promise<string> {
    if (env.auth.enabled) {
      return this._keycloak.getToken();
    } else {
      return new Promise<string>((resolve) => {
        resolve(DUMMY_TOKEN);
      });
    }
  }
}
