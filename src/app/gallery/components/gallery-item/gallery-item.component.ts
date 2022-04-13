import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {Template} from "../../../shared/fhir/extensions/bpmn-xml-extension";
import {faDiceD6, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import * as moment from "moment";
import {ModelerService} from "../../../shared/services/modeler.service";
import {TemplateService} from "../../../shared/services/template.service";

@Component({
  selector: "app-gallery-item",
  templateUrl: "./gallery-item.component.html",
  styleUrls: ["./gallery-item.component.scss"]
})
export class GalleryItemComponent implements OnInit {

  @Output()
  itemEvents: EventEmitter<{ name: string, data?: any }>;

  @Input()
  item: Template;

  @ViewChild("imageLink")
  imageLink: ElementRef;

  iconTrash = faTrash;
  iconEditMeta = faEdit;
  iconModel = faDiceD6;
  loading = true;
  png = undefined;

  constructor(
    private modelerService: ModelerService,
    private templateService: TemplateService,
    private sanitizer: DomSanitizer
  ) {
    this.itemEvents = new EventEmitter();
  }

  editItem() {
    this.itemEvents.emit({
      name: "gallery.item.edit",
      data: this.item
    });
  }

  trashItem() {
    this.itemEvents.emit({
      name: "gallery.item.trash",
      data: this.item
    });
  }

  getSubtitle() {
    let subtitle: string = "ID: " + this.item.id;
    if (this.item.date) {
      subtitle = subtitle.concat("\nLast edited: " + this.item.date.format(moment.HTML5_FMT.DATETIME_LOCAL));
    }
    return subtitle;
  }

  modelItem() {
    this.itemEvents.emit({
      name: "gallery.item.model",
      data: this.item
    });
  }

  ngOnInit(): void {
  }

  svg() {
    return this.item.svgBase64 === undefined ? undefined :
      this.sanitizer.bypassSecurityTrustHtml(decodeURIComponent(escape(atob(this.item.svgBase64))));
  }

  onVisibilityChange(event: string) {
    if (this.loading && "VISIBLE" === event) {
      this.modelerService.pngAsDataUri(
        `data:image/svg+xml;base64,${this.item.svgBase64}`
      ).then(
        uri => {
          // const url = URL.createObjectURL(ModelerService.base64UriToBlob(uri));
          this.png = this.sanitizer.bypassSecurityTrustResourceUrl(uri);
          this.loading = false;
        }
      ).catch(
        error => {
          console.log(error);
          this.loading = false;
        }
      );
    }
  }
}

