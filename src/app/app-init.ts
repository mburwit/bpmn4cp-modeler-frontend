import {KeycloakService} from "keycloak-angular";
import {Injector} from "@angular/core";
import {environment} from "../environments/environment";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  if (environment.auth.enabled === true) {
    return (): Promise<any> => keycloak.init(
      environment.auth.options
    );
  } else {
    return (): Promise<any> => Promise.resolve(true);
  }
}

export class BasicAuthInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.config.auth.enabled === true) {
      request = request.clone({
        setHeaders: {
          Authorization: environment.config.auth.authorizationHeader
        }
      });
    }
    return next.handle(request);
  }
}

export class InjectorHolder {
  static angularInjector: Injector;
}
