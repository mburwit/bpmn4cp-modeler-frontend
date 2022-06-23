import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {faBook, faSignOutAlt, faTh, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {KeycloakService} from "keycloak-angular";
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: "app-core-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class NavigationComponent implements OnInit {

  icons: { [name: string]: IconDefinition } = {
    templateGallery: faTh,
    terminology: faBook,
    logout: faSignOutAlt
  };
  version: string;

  constructor(private keycloakAngular: KeycloakService,
              private router: Router) {
    this.version = environment.version;
  }

  ngOnInit(): void {
  }

  /**
   *  Logout the currently logged-in user. An redirect is performed to the
   *  login page. The redirection target is the redirect URL configured
   *  in Keycloak.
   */
  logout() {
    this.keycloakAngular.logout().then();
  }

  gotoGallery() {
    this.router.navigate(["/gallery"]).then(() => {
      window.location.reload();
    });
  }

  gotoTerminology() {
    this.router.navigate(["/terminology"]).then(() => {
      window.location.reload();
    });
  }

  authEnabled(): boolean {
    return environment.auth.enabled;
  }
}
