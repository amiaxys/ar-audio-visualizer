import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faPenToSquare, faTrash, faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Visualization } from 'src/app/classes/visualization';
import { Metadata } from 'src/app/classes/metadata';

@Component({
  selector: 'app-visualization-card',
  templateUrl: './visualization-card.component.html',
  styleUrls: ['./visualization-card.component.scss'],
})
export class VisualizationCardComponent implements OnInit {
  modalRef?: BsModalRef;
  editForm: FormGroup;

  @Input() visualization!: Visualization;
  @Output() edit = new EventEmitter<{
    visualizationId: string;
    newTitle: string;
    newMetadata: Metadata;
  }>();
  @Output() delete = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;

  constructor(
    private library: FaIconLibrary,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    library.addIcons(faPenToSquare, faTrash, faFileArrowDown);
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.editForm.controls['title'].setValue(this.visualization.title);
  }

  editVisualization(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.editForm.controls['title'].setValue(this.visualization.title);
  }

  onEdit() {
    this.edit.emit({
      visualizationId: this.visualization.id,
      newTitle: this.editForm.controls['title'].value,
      newMetadata: this.visualization.metadata,
    });
    this.modalRef?.hide();
  }

  deleteVisualization(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  onDelete() {
    this.delete.emit(this.visualization.id);
    this.modalRef?.hide();
  }

  onDownload() {
    const metaFile = new File(
      [JSON.stringify(this.visualization.metadata)],
      'metadata.json',
      {
        type: 'application/json',
      }
    );
    this.downloadLink.nativeElement.href = URL.createObjectURL(metaFile);
    this.downloadLink.nativeElement.click();
  }
}
