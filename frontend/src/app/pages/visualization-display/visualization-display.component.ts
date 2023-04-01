import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { MetatypeService } from 'src/app/services/metatype.service';
import { Visualization } from 'src/app/classes/visualization';

@Component({
  selector: 'app-visualization-display',
  templateUrl: './visualization-display.component.html',
  styleUrls: ['./visualization-display.component.scss'],
})
export class VisualizationDisplayComponent implements OnInit {
  isAuth!: boolean;

  entityTypes!: string[];

  visualization!: Visualization;
  visualizationFetched: boolean = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private metaApi: MetatypeService
  ) {}

  ngOnInit(): void {
    this.api.me().subscribe({
      next: (res) => {
        this.isAuth = res ? true : false;
      },
      error: () => {
        this.isAuth = false;
      },
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.log('No Visualization Id Found');
      return;
    }

    this.api.getVisualization(id).subscribe({
      next: (visualization) => {
        this.visualization = visualization;
        this.initializeMetadata();
        this.visualizationFetched = true;
      },
      error: (err) => {
        console.log(`Get Visualization Error: ${err}`);
      },
    });
  }

  initializeMetadata() {
    let changed = false;
    if (!this.visualization.metadata.type) {
      this.visualization.metadata.type = 'basic-shapes';
      changed = true;
    } else {
      const apiTypes = this.metaApi.getTypes();
      if (!apiTypes.includes(this.visualization.metadata.type)) {
        this.visualization.metadata.type = 'basic-shapes';
        changed = true;
      }
    }

    const apiEntityTypes = this.metaApi.getEntityTypes(
      this.visualization.metadata.type
    );
    if (apiEntityTypes) {
      this.entityTypes = apiEntityTypes;
    }

    if (!this.visualization.metadata.freq) {
      this.visualization.metadata.freq = {
        color: null,
        entities: this.entityTypes,
      };
      changed = true;
    } else {
      if (!this.visualization.metadata.freq.color) {
        this.visualization.metadata.freq.color = null;
        changed = true;
      }
      if (!this.visualization.metadata.freq.entities) {
        this.visualization.metadata.freq.entities = this.entityTypes;
        changed = true;
      }
    }

    if (!this.visualization.metadata.time) {
      this.visualization.metadata.time = {
        color: null,
        entities: this.entityTypes,
      };
      changed = true;
    } else {
      if (!this.visualization.metadata.time.color) {
        this.visualization.metadata.time.color = null;
        changed = true;
      }
      if (!this.visualization.metadata.time.entities) {
        this.visualization.metadata.time.entities = this.entityTypes;
        changed = true;
      }
    }

    if (changed) {
      this.api
        .editVisualization(
          this.visualization.id,
          this.visualization.title,
          this.visualization.metadata
        )
        .subscribe({
          error: (err) => {
            console.log(`Update Visualization Error: ${err}`);
          },
        });
    }
  }
}
