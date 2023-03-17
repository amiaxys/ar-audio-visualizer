import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Visualization } from 'src/app/classes/visualization';

@Component({
  selector: 'app-visualization-card',
  templateUrl: './visualization-card.component.html',
  styleUrls: ['./visualization-card.component.scss']
})
export class VisualizationCardComponent implements OnInit {
  constructor (library: FaIconLibrary) {
    library.addIcons(faPenToSquare, faTrash);
    
  }
  
  ngOnInit(): void {}
  
  @Input() visualization!: Visualization;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  editVisualization() {
    this.edit.emit(this.visualization.id);
  }

  deleteVisualization() {
    this.delete.emit(this.visualization.id);
  }
}
