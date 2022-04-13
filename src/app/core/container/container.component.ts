import {ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation} from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import {MediaMatcher} from "@angular/cdk/layout";

@Component({
    selector: "app-core-container",
    templateUrl: "./container.component.html",
    styleUrls: ["./container.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class ContainerComponent implements OnDestroy {

    @ViewChild(MatSidenav, { static: true }) matSidenav: MatSidenav | undefined;

    mobileQuery: MediaQueryList;

    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    toggleNavigation(): void {
        if (this.matSidenav) {
            this.matSidenav.toggle().catch();
        }
    }
}
