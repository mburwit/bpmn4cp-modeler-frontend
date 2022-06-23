import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {IcdItem, Template, Topic} from "../../../shared/fhir/extensions/bpmn-xml-extension";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";
import {faMinusCircle, faPlus, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {IcdBrowserDialogComponent} from "../icd-browser-dialog/icd-browser-dialog.component";

@Component({
  selector: "app-template-form-dialog",
  templateUrl: "./template-form-dialog.component.html",
  styleUrls: ["./template-form-dialog.component.scss"]
})
export class TemplateFormDialogComponent implements OnInit {

  templateForm: FormGroup;
  topicCtrl = new FormControl();
  iconCancel: IconDefinition = faMinusCircle;
  iconAdd: IconDefinition = faPlus;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTopics: Observable<Topic[]>;
  topics: Topic[] = [];
  allTopics: Topic[] = [{text: "physical therapy"}, {text: "cognitive training"}, {text: "risk factor modification"}];
  publicationStatus = ["draft", "active", "retired", "unknown"];
  icdItems: IcdItem[] = [];

  @ViewChild("topicInput") topicInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;

  constructor(@Inject(MAT_DIALOG_DATA) public template: Template,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef) {
    this.templateForm = fb.group({
      id: [template.id],
      title: [template.title, Validators.required],
      description: [template.description],
      usage: [template.usage],
      topic: [template.topic],
      status: [template.status],
      useContext: [template.useContext],
      isSubTemplate: [Template.isSubTemplate(template)]
    });
    this.topics = template.topic ? template.topic : [];
    this.icdItems = template.useContext ? template.useContext : [];
    this.filteredTopics = this.topicCtrl.valueChanges.pipe(
      startWith(null),
      map((topicText: string | null) => topicText ? this._filter(topicText) : this.allTopics.slice()));
  }

  ngOnInit() {
  }

  formTitle(): string {
    return this.template.id ? "Edit Template" : "Create Template";
  }

  getFormValue() {
    const result = this.templateForm.value as Template;
    result.id = this.template.id;
    result.bpmnXmlBase64 = this.template.bpmnXmlBase64;
    result.svgBase64 = this.template.svgBase64;
    result.topic = this.topics;
    result.useContext = this.icdItems;
    result.name = result.title ? result.title.toLowerCase().replace(/ /g, "_") : undefined;
    Template.setIsSubTemplate(result, this.templateForm.value.isSubTemplate);
    return result;
  }

  addTopic(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our topic
    if ((value || "").trim()) {
      this.topics.push({text: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }

    this.topicCtrl.setValue(null);
  }

  removeTopic(topic: Topic): void {
    const index = this.topics.indexOf(topic);

    if (index >= 0) {
      this.topics.splice(index, 1);
    }
  }

  selectedTopic(event: MatAutocompleteSelectedEvent): void {
    this.topics.push({text: event.option.viewValue});
    this.topicInput.nativeElement.value = "";
    this.topicCtrl.setValue(null);
  }

  private _filter(value: string | Topic): Topic[] {
    const filterValue = value["text"] ? (value["text"] as string).toLowerCase() : (value as string).toLowerCase();

    return this.allTopics
      .filter(topic => topic.text.toLowerCase().indexOf(filterValue) >= 0);
  }

  removeIcdItem(icdItem: any) {
    const index = this.icdItems.indexOf(icdItem);

    if (index >= 0) {
      this.icdItems.splice(index, 1);
    }
  }

  openICDBrowser() {
    this.changeDetectorRef.detach();
    this.dialog.open(IcdBrowserDialogComponent, {
      height: "98%",
      width: "98%"
    }).afterClosed().subscribe(result => {
      this.changeDetectorRef.reattach();
      if (result) {
        this.icdItems.push(result);
      }
    });
  }
}


