import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {faPlus, faTimes, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {Template} from "../../shared/fhir/extensions/bpmn-xml-extension";
import {ProgressSpinnerService} from "../../shared/progress-spinner/progress-spinner.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormControl} from "@angular/forms";
import {BehaviorSubject, Observable} from "rxjs";
import {TemplateService} from "../../shared/services/template.service";
import {TemplateFormDialogComponent} from "./template-form-dialog/template-form-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {YesNoDialogComponent} from "../../shared/dialogs/yes-no-dialog/yes-no-dialog.component";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrls: ["./gallery.component.scss"]
})
export class GalleryComponent implements OnInit, AfterViewInit {
  allTemplates: Template[] = [];
  searchedTemplates$: BehaviorSubject<Template[]> = new BehaviorSubject([]);
  templatesDisplayed: Template[];
  numberOfSearchedTemplates: number;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[] = [5, 10, 25];
  @ViewChild("searchTextField")
  searchTextField: ElementRef;
  @ViewChild("paginator")
  paginator: MatPaginator;
  readonly iconPlus = faPlus;

  @Output()
  galleryEvents: EventEmitter<{ name: string, data?: any }>;
  searchControl: FormControl;
  searchTerm: string;
  iconClear: IconDefinition = faTimes;

  constructor(private templateService: TemplateService,
              private progressSpinnerService: ProgressSpinnerService,
              private changeDetectorRef: ChangeDetectorRef,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private router: Router) {
    this.galleryEvents = new EventEmitter();
    this.searchControl = new FormControl();
    this.templateService.allTemplates.subscribe(
      (templates) => {
        this.progressSpinnerService.setProgressing(false);
        this.allTemplates = templates;
        this.searchedTemplates$.next(this.applySearch());
      });
    this.searchedTemplates.subscribe(() => {
      this.updateTemplatePage();
    });
    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm = value ? (value as string).toLowerCase() : "";
      this.paginator.firstPage();
      this.searchedTemplates$.next(this.applySearch());
    });
  }

  get searchedTemplates(): Observable<Template[]> {
    return this.searchedTemplates$.asObservable();
  }

  ngOnInit() {
    this.progressSpinnerService.setProgressing(true);
    this.templateService.queryAll();
    this.pageSize = 10;
    this.pageIndex = 0;
  }

  ngAfterViewInit() {
    this.searchTextField.nativeElement.focus();
  }

  handleItemEvent(event: { name: string, data?: any }) {
    if (event.name === "gallery.item.edit") {
      this.openTemplateDialog(event.data);
    } else if (event.name === "gallery.item.add") {
      this.openTemplateDialog(new Template());
    } else if (event.name === "gallery.item.trash") {
      this.openYesNoDialog("Delete Template?", "This cannot be undone. Delete item?", discardChanges => {
        if (discardChanges) {
          this.progressSpinnerService.setProgressing(true);
          this.templateService.deleteTemplate(event.data).subscribe(
            () => {
              this.templateService.queryAll();
              this.showInfo("Template deleted!");
            },
            error => this.handleError(error),
            () => this.progressSpinnerService.setProgressing(false)
          );
        }
      });
    } else if (event.name === "gallery.item.model") {
      this.router.navigate(["modeler", encodeURIComponent(event.data.id)]).then();
    }
  }

  openTemplateDialog(template: Template): void {
    this.changeDetectorRef.detach();
    this.dialog.open<TemplateFormDialogComponent, Template, Template>(TemplateFormDialogComponent, {
      data: template
    }).afterClosed().subscribe(changedTemplate => {
      this.changeDetectorRef.reattach();
      if (changedTemplate) {
        this.progressSpinnerService.setProgressing(true);
        // update existing template
        if (changedTemplate.id) {
          this.templateService.updateTemplate(changedTemplate).subscribe(
            // when updated, refresh gallery items
            () => {
              this.templateService.queryAll();
              this.showInfo("Template updated!");
            },
            error => {
              // when update failed, reopen the dialog with the edited data and inform about the error
              this.openTemplateDialog(changedTemplate);
              this.handleError(error);
            },
            () => this.progressSpinnerService.setProgressing(false)
          );
        } else {
          this.templateService.createTemplate(changedTemplate).subscribe(
            // when created, refresh gallery items
            () => {
              this.templateService.queryAll();
              this.newTemplate();
              this.showInfo("Template created!");
            },
            error => {
              // when create failed, reopen the dialog with the inserted data and inform about the error
              this.openTemplateDialog(changedTemplate);
              this.handleError(error);

            },
            () => this.progressSpinnerService.setProgressing(false)
          );
        }
      }
    });
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

  onFabMainClicked() {
    this.handleItemEvent({
      name: "gallery.item.add"
    });
  }

  updateTemplatePage() {
    this.numberOfSearchedTemplates = this.searchedTemplates$.getValue().length;
    const firstIndex = this.pageIndex * this.pageSize;
    const lastIndex = (this.pageIndex + 1) * this.pageSize - 1;
    this.templatesDisplayed = this.searchedTemplates$.getValue().filter((template, index) => {
      return index >= firstIndex && index <= lastIndex;
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

  pageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateTemplatePage();
  }

  newTemplate() {
    this.searchControl.reset();
    this.paginator.lastPage();
  }

  private applySearch(): Template[] {
    return this.allTemplates.filter(template => {
      return !this.searchTerm || template.title.toLowerCase().includes(this.searchTerm);
    });
  }

  clearSearchField() {
    this.searchControl.setValue("");
  }
}

