import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: "app-modeler-container",
  template: "<router-outlet></router-outlet>",
})
export class ModelerContainerComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    if (this.route.firstChild == null) {
      this.router.navigate(["/gallery"]).then(() => {
        window.location.reload();
      });
    }
  }
}
