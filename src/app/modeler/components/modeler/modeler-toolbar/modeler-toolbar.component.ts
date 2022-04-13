import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {
  faFileCode, faFileDownload,
  faFileImage as faFileSolidImage,
  faFileImport,
  faMinus,
  faPlus,
  faRedo,
  faTh,
  faUndo
} from "@fortawesome/free-solid-svg-icons";
import {FileUploader} from "ng2-file-upload";
import {ModelerService} from "../../../../shared/services/modeler.service";
import {MatSlider, MatSliderChange} from "@angular/material/slider";
import {faFileImage as faFileRegularImage, faFilePdf} from "@fortawesome/free-regular-svg-icons";
import {Observable, of} from "rxjs";

@Component({
  selector: "app-modeler-toolbar",
  templateUrl: "./modeler-toolbar.component.html",
  styleUrls: ["./modeler-toolbar.component.scss"]
})
export class ModelerToolbarComponent implements OnInit {

  zoomConfig = {
    min: 0.2,
    max: 4,
    step: 0.1
  };

  iconGallery = faTh;
  iconFileImport = faFileImport;
  iconUndo = faUndo;
  iconRedo = faRedo;
  iconFileCode = faFileCode;
  iconFileDownload = faFileDownload;
  iconFileSvg = faFileRegularImage;
  iconFilePng = faFileSolidImage;
  iconFilePdf = faFilePdf;
  iconZoomIn = faPlus;
  iconZoomOut = faMinus;

  canUndo = false;
  canRedo = false;
  canZoomIn = true;
  canZoomOut = true;
  uploader: FileUploader;
  fileReader: FileReader;

  @ViewChild("zoomSlider")
  zoomSlider: MatSlider;

  @Input()
  templateTitle: Observable<string> = of("");
  title = "";

  @Output()
  toolbarEvents: EventEmitter<{ name: string, data?: any }>;

  constructor(
    private modelerService: ModelerService
  ) {
    this.toolbarEvents = new EventEmitter();
    this.uploader = new FileUploader({url: "#"});
    this.fileReader = new FileReader();
    this.fileReader.onload = (e) => {
      this.toolbarEvents.emit({
        name: "toolbar.import",
        data: e.target.result
      });
    };
    this.modelerService.unsavedChanges.subscribe(modelHasChanges => this.canUndo = modelHasChanges);
    this.modelerService.canRedo.subscribe(canRedo => this.canRedo = canRedo);
    this.modelerService.currentZoom.subscribe(value => this.updateZoomUI(value));
  }

  ngOnInit() {
    this.templateTitle.subscribe((templateTitle) => {
      this.title = templateTitle.length > 30 ? templateTitle.slice(0, 30).concat("...") : templateTitle;
    });
  }

  onFileSelected(event: Event) {
    if (event.target["files"] && event.target["files"][0]) {
      this.fileReader.readAsText(event.target["files"][0]);
    }
  }

  onGalleryClick() {
    this.toolbarEvents.emit({
      name: "toolbar.gallery"
    });
  }

  undoClick() {
    this.toolbarEvents.emit({
      name: "toolbar.undo"
    });
  }

  redoClick() {
    this.toolbarEvents.emit({
      name: "toolbar.redo"
    });
  }

  onZoomMoved(event: MatSliderChange) {
    this.updateZoomUI(event.value);
    this.modelerService.zoom(event.value);
  }

  private updateZoomUI(value: number) {
    this.canZoomIn = value < this.zoomConfig.max;
    this.canZoomOut = value > this.zoomConfig.min;
    this.zoomSlider.writeValue(value);
  }

  zoomOut() {
    const value = this.zoomSlider.value - this.zoomConfig.step;
    this.onZoomMoved({source: undefined, value});
  }

  zoomIn() {
    const value = this.zoomSlider.value + this.zoomConfig.step;
    this.onZoomMoved({source: undefined, value});
  }

  zoomSliderLabel(value: number) {
    return `${Math.round(value * 100)} %`;
  }

  downloadSvg() {
    this.modelerService.saveSvg(`${this.title}.svg`);
  }

  downloadPng() {
    this.modelerService.savePng(`${this.title}.png`);
  }

  downloadPdf() {
    this.modelerService.savePdf(`${this.title}.pdf`);
  }

  downloadBpmnXml() {
    this.modelerService.saveBpmnXml(`${this.title}.xml`);
  }
}
