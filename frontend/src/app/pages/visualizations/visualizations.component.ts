import { Component, OnInit, Input } from '@angular/core';
import { Visualization } from 'src/app/classes/visualization';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-visualizations',
  templateUrl: './visualizations.component.html',
  styleUrls: ['./visualizations.component.scss'],
})
export class VisualizationsComponent implements OnInit {
  visualizations: Visualization[] = [];

  constructor(private api: ApiService) {}
  
  ngOnInit(): void {
    this.getUserVisualizations();
  }

  getUserVisualizations() {
    this.api.me().subscribe({
      next: (user) => {
        this.api.getVisualizations(user.id, 1, 10).subscribe({
          next: (res) => {
            this.visualizations = res.rows;
            console.log(this.visualizations.length)
          }
        })
      },
      error: (err) => {
        console.log(`Auth error: ${err}`);
      },
    });
  }

  editVisualizations(visualizationId: string) {
  }

  deleteVisualizations(visualizationId: string) {
    if (confirm(`Are you sure you want to delete this visualization?`)) {
      this.api.me().subscribe({
        next: (user) => {
          this.api.deleteVisualization(user.id, visualizationId).subscribe({
            next: () => {
              this.getUserVisualizations();
            },
            error: (err) => {
              console.log(`Deletion error: ${err}`);
            }
          });
          
        },
        error: (err) => {
          console.log(`Deletion error: ${err}`);
        },
      });
    }
  }
}
