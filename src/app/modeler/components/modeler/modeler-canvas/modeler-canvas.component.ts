import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from "@angular/core";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import {ModelerService} from "../../../../shared/services/modeler.service";

@Component({
  selector: "app-modeler-canvas",
  templateUrl: "./modeler-canvas.component.html",
  styleUrls: ["./modeler-canvas.component.scss"]
})
export class ModelerCanvasComponent implements AfterViewInit {

  iconSave = faSave;

  saveButtonDisabled: boolean;

  @ViewChild("canvasDiv", { static: true })
  canvasDiv: ElementRef;

  @ViewChild("propertiesDiv", { static: true })
  propertiesDiv: ElementRef;

  @Output() canvasEvents: EventEmitter<{ name: string, data?: any }>;

  constructor(
    private modelerService: ModelerService
  ) {
    this.canvasEvents = new EventEmitter();
    this.saveButtonDisabled = true;
    this.modelerService.unsavedChanges.subscribe(modelHasChanges => this.saveButtonDisabled = !modelHasChanges);
  }

  ngAfterViewInit() {
    this.canvasEvents.emit({
      name: "canvas.init",
      data: {
        canvas: this.canvasDiv.nativeElement,
        properties: this.propertiesDiv.nativeElement
      }
    });
  }

  onFabMainClicked() {
    this.canvasEvents.emit({
      name: "canvas.save"
    });
  }
}
