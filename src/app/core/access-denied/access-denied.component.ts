import {Component, OnInit} from "@angular/core";
import {faSignOutAlt, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {KeycloakService} from "keycloak-angular";
import {Router} from "@angular/router";

@Component({
  selector: "app-access-denied",
  templateUrl: "./access-denied.component.html",
  styleUrls: ["./access-denied.component.scss"]
})
export class AccessDeniedComponent implements OnInit {

  icons: { [name: string]: IconDefinition } = {
    logout: faSignOutAlt
  };
  origin: string;
  routerUrl: string;

  constructor(private readonly router: Router,
              private readonly keycloakAngular: KeycloakService) {
  }

  ngOnInit(): void {
  }

  /**
   *  Logout the currently logged-in user. An redirect is performed to the
   *  login page. The redirection target is the redirect URL configured
   *  in Keycloak.
   */
  logout() {
    this.keycloakAngular.logout(
      window.location.origin + this.router.routerState.snapshot.url
    ).then();
  }
}
