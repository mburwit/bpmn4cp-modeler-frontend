import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from "@angular/core";
import {ModelerCanvasComponent} from "./modeler-canvas/modeler-canvas.component";
import {ModelerToolbarComponent} from "./modeler-toolbar/modeler-toolbar.component";
import {ModelerService} from "../../../shared/services/modeler.service";
import {YesNoDialogComponent} from "../../../shared/dialogs/yes-no-dialog/yes-no-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TemplateService} from "../../../shared/services/template.service";
import {Template} from "../../../shared/fhir/extensions/bpmn-xml-extension";
import {ProgressSpinnerService} from "../../../shared/progress-spinner/progress-spinner.service";
import {environment} from "../../../../environments/environment";
import {GlobalRef} from "../../../shared/global/global";
import {AuthenticationService} from "../../../shared/services/authentication/authentication.service";
import {ComponentCanDeactivate} from "../../../shared/guards/pendingchanges.guard";
import {BehaviorSubject, Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

@Component({
  selector: "app-modeler",
  templateUrl: "./modeler.component.html",
  styleUrls: ["./modeler.component.scss"]
})
export class ModelerComponent implements OnInit, ComponentCanDeactivate {

  currentTemplate: BehaviorSubject<Template | undefined> = new BehaviorSubject<Template | undefined>(undefined);
  templateTitle: BehaviorSubject<string> = new BehaviorSubject("");

  @ViewChild("canvas")
  canvas: ModelerCanvasComponent;
  @ViewChild("toolbar")
  toolbar: ModelerToolbarComponent;

  visibleContainer: string;

  private unsafedChanges: boolean;

  constructor(private modelerService: ModelerService,
              private templateService: TemplateService,
              private dialog: MatDialog,
              private progressSpinnerService: ProgressSpinnerService,
              private snackBar: MatSnackBar,
              private global: GlobalRef,
              private authenticator: AuthenticationService,
              private changeDetectorRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router) {

    this.currentTemplate.asObservable().subscribe(currentTemplate => {
      this.templateTitle.next(currentTemplate ? currentTemplate.title : "");
    });
    modelerService.unsavedChanges.subscribe(hasChanges => this.unsafedChanges = hasChanges);
    modelerService.currentBpmnXml.subscribe(xml => {
      if (this.currentTemplate.getValue()) {
        this.currentTemplate.getValue().bpmnXmlBase64 = btoa(unescape(encodeURIComponent(xml)));
      }
    });
    modelerService.currentSvg.subscribe(svg => {
      if (this.currentTemplate.getValue()) {
        this.currentTemplate.getValue().svgBase64 = btoa(unescape(encodeURIComponent(svg)));
      }
    });
    // set the fhir backend API url and the authorization headers as global JS variables,
    // to use them by the JS modeler code
    global.nativeGlobal.fhirApiUrl = environment.config.backend.entryPoint;
    if (environment.auth.enabled === true) {
      this.authenticator.getToken().then(token => {
        // console.log(token);
        global.nativeGlobal.fhirApiRequestInit = {
          headers: new Headers([
              ["Authorization", `bearer ${token}`],
              ["Accept", "application/json, text/plain, */*"]
            ]
          )
        };
      });
    } else {
      global.nativeGlobal.fhirApiRequestInit = {
        headers: new Headers([
            ["Accept", "application/json, text/plain, */*"]
          ]
        )
      };
    }
  }

  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return this.unsafedChanges !== true;
  }

  ngOnInit() {
    this.modelerService.errors.subscribe(event => {
      this.handleError(event.error);
    });
  }

  @HostListener("window:resize")
  onResize() {
    this.modelerService.onResize();
  }

  handleToolbarEvent(event: { name: string, data?: any }) {
    if (event.name === "toolbar.import") {
      this.modelerService.openDiagram(event.data, true).then();
    } else if (event.name === "toolbar.gallery") {
      if (this.unsafedChanges) {
        this.openYesNoDialog("Discard changes?", "There are unsaved changes that will be discarded. Continue?", discardChanges => {
          if (discardChanges) {
            this.showGallery();
          }
        });
      } else {
        this.showGallery();
      }
    } else if (event.name === "toolbar.undo") {
      this.modelerService.undo();
    } else if (event.name === "toolbar.redo") {
      this.modelerService.redo();
    }
  }

  handleCanvasEvent(event: { name: string, data?: any }) {
    if (event.name === "canvas.init") {
      this.initialize(event.data);
    } else if (event.name === "canvas.save") {
      this.progressSpinnerService.setProgressing(true);
      this.templateService.updateTemplate(this.currentTemplate.getValue()).subscribe(
        updatedTemplate => {
          this.currentTemplate.next(updatedTemplate);
          this.modelerService.saved();
          this.showInfo("Template saved!");
        },
        error => this.handleError(error),
        () => this.progressSpinnerService.setProgressing(false)
      );

    }
  }

  openYesNoDialog(title: string, message: string, afterClose: (result: boolean) => void, labelYes?: string, labelNo?: string): void {
    this.changeDetectorRef.detach();
    this.dialog.open(YesNoDialogComponent, {
      data: {title, message, labelYes, labelNo, afterClose}
    }).afterClosed().subscribe(result => {
      this.changeDetectorRef.reattach();
      afterClose(result);
    });
  }

  handleError(error: Error, data?: any) {
    this.progressSpinnerService.setProgressing(false);
    this.snackBar.open(error.message, undefined, {panelClass: "error"});
    console.error(error, data);
  }

  showInfo(message: string) {
    this.snackBar.open(message, undefined, {panelClass: "info"});
  }

  private showGallery() {
    this.router.navigate(["/gallery"]).then(() => {
      window.location.reload();
    });
  }

  private initialize(data: any) {
    this.templateService.allTemplates.subscribe(allTemplates => {
      if (allTemplates.length === 0) {
        this.templateService.queryAll();
        return;
      }
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) =>
          of(allTemplates
            .find(template => template.id && template.id === decodeURIComponent(params.get("id") || ""))
          )
        )
      ).subscribe((template) => {
        if (template) {
          this.currentTemplate.next(template);
          this.modelerService.initModeler({
            container: data.canvas,
            keyboard: {
              bindTo: document
            },
            propertiesPanel: {
              parent: data.properties
            }
          });
          if (this.currentTemplate.getValue() !== undefined) {
            this.modelerService.openDiagram(decodeURIComponent(escape(atob(this.currentTemplate.getValue().bpmnXmlBase64))), false).then();
          }
        } else {
          this.handleError(new Error("Model not found!"));
        }
      });
    });
  }
}


