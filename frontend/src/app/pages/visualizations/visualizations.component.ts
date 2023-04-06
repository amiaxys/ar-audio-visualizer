import { Component, OnInit } from '@angular/core';
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
  totalCount!: number;
  limit: number = 6;
  page: number = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.me().subscribe({
      next: (res) => {
        this.isAuth = res ? true : false;
        this.getUserVisualizations(1);
      },
      error: () => {
        this.isAuth = false;
      },
    });
  }

  onPageChange(event: any) {
    this.page = event.page;
    this.getUserVisualizations(event.page);
  }

  getUserVisualizations(page: number) {
    this.api.getVisualizations(page, this.limit).subscribe({
      next: (res) => {
        this.visualizations = res.rows;
        this.totalCount = res.count;
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
          this.getUserVisualizations(this.page);
        },
        error: (err) => {
          console.log(`Edit error: ${err}`);
        },
      });
  }

  deleteVisualizations(visualizationId: string) {
    this.api.deleteVisualization(visualizationId).subscribe({
      next: () => {
        if (this.totalCount - 1 === 0) {
          this.page = 1;
          this.getUserVisualizations(1);
          return;
        }

        const pageRemoved = (this.totalCount - 1) % this.limit === 0;
        const onFinalPage =
          this.page === Math.ceil(this.totalCount / this.limit);
        const newPage = onFinalPage && pageRemoved ? this.page - 1 : this.page;
        this.page = newPage;
        this.getUserVisualizations(newPage);
      },
      error: (err) => {
        console.log(`Deletion error: ${err}`);
      },
    });
  }
}
