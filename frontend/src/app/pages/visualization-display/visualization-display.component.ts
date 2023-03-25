import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-visualization-display',
  templateUrl: './visualization-display.component.html',
  styleUrls: ['./visualization-display.component.scss'],
})
export class VisualizationDisplayComponent implements OnInit {
  isAuth!: boolean;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });
  }
}
