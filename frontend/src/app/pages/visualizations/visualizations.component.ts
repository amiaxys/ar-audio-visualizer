import { Component, OnInit, Input } from '@angular/core';
import { Visualization } from 'src/app/classes/visualization';
import { Metadata } from 'src/app/classes/metadata';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-visualizations',
  templateUrl: './visualizations.component.html',
  styleUrls: ['./visualizations.component.scss'],
})
export class VisualizationsComponent implements OnInit {
  visualizations: Visualization[] = [];
  isAuth!: boolean;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.me().subscribe({
      next: (res) => {
        this.isAuth = res ? true : false;
        this.getUserVisualizations();
      },
      error: () => {
        this.isAuth = false;
      }
    });
  }

  getUserVisualizations() {
    this.api.getVisualizations(1, 10).subscribe({
      next: (res) => {
        this.visualizations = res.rows;
      },
    });
  }

  editVisualizations(visualization: {
    visualizationId: string;
    newTitle: string;
    newMetadata: Metadata;
  }) {
    this.api
      .editVisualization(
        visualization.visualizationId,
        visualization.newTitle,
        visualization.newMetadata
      )
      .subscribe({
        next: () => {
          this.getUserVisualizations();
        },
        error: (err) => {
          console.log(`Edit error: ${err}`);
        },
      });
  }

  deleteVisualizations(visualizationId: string) {
    this.api.deleteVisualization(visualizationId).subscribe({
      next: () => {
        this.getUserVisualizations();
      },
      error: (err) => {
        console.log(`Deletion error: ${err}`);
      },
    });
  }
}
