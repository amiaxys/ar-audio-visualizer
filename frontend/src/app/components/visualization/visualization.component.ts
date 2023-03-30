import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Entity } from '../../classes/entity';
import { Visualization } from '../../classes/visualization';
import { ApiService } from 'src/app/services/api.service';
import { MetatypeService } from 'src/app/services/metatype.service';
import { environment } from '../../../environments/environment';
//import { THREE } from 'aframe';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent {
  type: string = 'basic-shapes';
  entityTypes!: string[];

  visualization!: Visualization;
  visualizationFetched: boolean = false;

  @ViewChild('audio') audioElmt!: ElementRef<HTMLAudioElement>;
  displayPlayBtn: boolean = true;

  // default sound file if no user visualization audio is found
  audioSource: string = '../../../assets/Lunar-Beast-Theme-v7.2_Final.wav';
  audioCtx!: AudioContext;

  freqAnalyser!: AnalyserNode;
  freqBufferLength: number = 0;
  freqDataArray: Uint8Array = new Uint8Array(this.freqBufferLength);

  timeAnalyser!: AnalyserNode;
  timeBufferLength: number = 0;
  timeDataArray: Uint8Array = new Uint8Array(this.timeBufferLength);

  freqEntities: Entity[] = [];

  hueRegex: RegExp = /(?<=hsl\()\d+(?=,)/g;
  //lightRegex: RegExp = /(?<=,\s?)\d+(?=%\))/g;

  planeColor: string = 'hsl(0, 0%, 0%)';

  timeEntities: Entity[] = [];

  start: boolean = false;

  // testing variables
  //logTime: number = 0;
  //test: boolean = true;

  constructor(
    private api: ApiService,
    private metaApi: MetatypeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const apiEntityTypes = this.metaApi.getEntityTypes(this.type);
    if (apiEntityTypes) {
      this.entityTypes = apiEntityTypes;
    }

    if (!AFRAME.components['time-entity']) {
      AFRAME.registerComponent('time-entity', {
        init: function () {},
        tick: function () {
          // I'm not actually sure if this smooths the movement
          this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
        },
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.log('No Visualization Id Found');
      return;
    }
    this.api.getVisualization(id).subscribe({
      next: (visualization) => {
        this.visualization = visualization;
        this.visualizationFetched = true;
        this.audioSource = `${environment.backendUrl}/api/visualizations/${visualization.id}/audio`;
      },
      error: (err) => {
        console.log(`Get Visualization Error: ${err}`);
      },
    });
  }

  ngAfterViewInit(): void {}

  initializeFreqEntities(): void {
    let metaFreqTypes = [''];
    if (this.visualization.metadata.freq) {
      metaFreqTypes = this.visualization.metadata.freq.entities;
    }

    const freqTypes = JSON.parse(JSON.stringify(this.entityTypes));
    for (let i = 0; i < Math.min(3, metaFreqTypes.length); i++) {
      for (let j = 0; j < this.entityTypes.length; j++) {
        if (metaFreqTypes[i] === this.entityTypes[j]) {
          freqTypes[i] = metaFreqTypes[i];
        }
      }
    }

    let nextX = -4;
    const freqEntNum = 5;
    let col = null;
    if (this.visualization.metadata.freq) {
      col = this.visualization.metadata.freq.color;
    }
    for (let i = 0; i < freqEntNum; i++) {
      if (!col) {
        col = `hsl(${i * (360 / freqEntNum)}, 100%, 53%)`;
      }
      const z = i * 0.5;
      switch (i % 3) {
        case 0:
          this.freqEntities[i] = {
            type: `a-${freqTypes[0]}`,
            position: `${nextX} 0.75 ${z}`,
            radius: '0.5',
            height: '1',
            color: col,
          };
          break;
        case 1:
          this.freqEntities[i] = {
            type: `a-${freqTypes[1]}`,
            position: `${nextX} 0.75 ${z}`,
            rotation: '0 45 0',
            width: '1',
            height: '1.25',
            color: col,
          };
          break;
        case 2:
          this.freqEntities[i] = {
            type: `a-${freqTypes[2]}`,
            position: `${nextX} 1 ${z}`,
            radius: '1',
            color: col,
          };
          break;
      }
      nextX += 1 + (freqEntNum - i) * 0.1;
    }
  }

  initializeTimeEntities(): void {
    let metaTimeTypes = [''];
    if (this.visualization.metadata.time) {
      metaTimeTypes = this.visualization.metadata.time.entities;
    }

    let timeType = 'a-sphere';
    for (let j = 0; j < this.entityTypes.length; j++) {
      if (metaTimeTypes[0] === this.entityTypes[j]) {
        timeType = 'a-' + metaTimeTypes[0];
      }
    }

    const width = 18;
    const height = 4;
    const timeSlice = Math.floor(this.timeBufferLength / 20);
    const sliceWidth = width / timeSlice;
    let x = -3.5;
    let col = null;
    if (this.visualization.metadata.time) {
      col = this.visualization.metadata.time.color;
    }
    for (let i = 0; i < timeSlice; i++) {
      const v = this.timeDataArray[i * timeSlice] / 128.0;
      const y = v * (height / 2) + 1;

      if (!col) {
        col = `hsl(${i % 360}, 100%, ${Math.min(30 + i * 2, 100)}%)`;
      }

      this.timeEntities[i] = {
        type: timeType,
        position: `${x} ${y} 0`,
        radius: `${sliceWidth * 0.4}`,
        width: `${sliceWidth * 0.4 * 2}`,
        height: `${sliceWidth * 0.4 * 2}`,
        color: col,
      };

      x += sliceWidth;
    }
  }

  draw(): void {
    window.requestAnimationFrame(this.draw.bind(this));
    // pause animation when audio is paused
    this.displayPlayBtn = this.audioElmt.nativeElement.paused;
    if (this.audioElmt.nativeElement.paused) return;

    this.freqAnalyser.getByteFrequencyData(this.freqDataArray);
    this.timeAnalyser.getByteTimeDomainData(this.timeDataArray);

    if (this.timeEntities.length === 0 || this.freqEntities.length === 0) {
      this.initializeTimeEntities();
      this.initializeFreqEntities();
    }

    // change frequency entities
    const frac = Math.floor(
      this.freqDataArray.length / this.freqEntities.length
    );

    let freqAvg;
    for (let i = 0; i < this.freqEntities.length; i++) {
      // change frequency entity size (height/radius)
      freqAvg =
        this.freqDataArray
          .slice(i * frac, (i + 1) * frac)
          .reduce((a, b) => a + b) / frac;
      if (this.freqEntities[i].type === 'a-sphere') {
        this.freqEntities[i].radius = `${(freqAvg / 255) * 1.5}`;
      } else {
        this.freqEntities[i].height = `${(freqAvg / 255) * 2}`;
      }

      // change frequency entity color
      if (!this.visualization.metadata.freq.color) {
        let freqHue = this.freqEntities[i].color.match(this.hueRegex)![0];
        this.freqEntities[i].color = `hsl(${freqHue}, ${Math.floor(
          30 + (freqAvg / 255) * 50
        )}%, 50%)`;
      }

      // uncomment the block below for rainbow entities
      /* this.freqEntities[i].color = `hsl(${Math.ceil((freqAvg / 255) * 360)}, 100%, ${Math.floor(
        30 + (freqAvg / 255) * 70
      )}%)`; */
    }

    const planeLight = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2] / 255.0) * 100
    );
    this.planeColor = `hsl(0, 0%, ${planeLight}%)`;

    // change time spheres (wave)
    const height = 4;
    // when maxDiff is too big, wave animation gets too jitty
    // best is actually 0.01, but not enough change
    const maxDiff = 0.05;
    let y: number =
      (this.timeDataArray[this.timeDataArray.length / 2] / 128.0) *
        (height / 2) +
      1;
    let tempPos: string[];
    for (let i = 0; i < this.timeEntities.length; i++) {
      // change y position of time entity
      let tempy = y;
      tempPos = this.timeEntities[i].position.split(' ');
      const tempPosY = parseFloat(tempPos[1]);

      if (y > tempPosY) {
        tempy = y - tempPosY;
        y = tempPosY;
        tempPos[1] = tempPosY + Math.min(tempy, maxDiff) + '';
      } else if (y < tempPosY) {
        tempy = tempPosY - y;
        y = tempPosY;
        tempPos[1] = tempPosY - Math.min(tempy, maxDiff) + '';
      } else {
        y = tempPosY;
      }
      this.timeEntities[i].position = tempPos.join(' ');

      // change colour of time entity
      if (!this.visualization.metadata.time.color) {
        let timeHue;
        if (i === 0) {
          timeHue =
            parseInt(this.timeEntities[i].color.match(this.hueRegex)![0], 10) +
            1;
        } else {
          timeHue = parseInt(
            this.timeEntities[i - 1].color.match(this.hueRegex)![0],
            10
          );
        }
        this.timeEntities[i].color = `hsl(${timeHue % 360}, 100%, ${Math.min(
          30 + i * 2,
          100
        )}%)`;
      }
    }
  }

  startVisualization(): void {
    if (!this.start) {
      this.audioCtx = new AudioContext();
      this.freqAnalyser = this.audioCtx.createAnalyser();
      this.timeAnalyser = this.audioCtx.createAnalyser();

      const distortion = this.audioCtx.createWaveShaper();
      const source = this.audioCtx.createMediaElementSource(
        this.audioElmt.nativeElement
      );

      source.connect(this.freqAnalyser);
      source.connect(this.timeAnalyser);
      this.freqAnalyser.connect(distortion);
      this.timeAnalyser.connect(distortion);
      distortion.connect(this.audioCtx.destination);

      this.start = true;
    }

    this.freqAnalyser.fftSize = 256;
    this.freqBufferLength = this.freqAnalyser.frequencyBinCount;
    this.freqDataArray = new Uint8Array(this.freqBufferLength);

    this.timeAnalyser.fftSize = 2048;
    this.timeBufferLength = this.timeAnalyser.frequencyBinCount;
    this.timeDataArray = new Uint8Array(this.timeBufferLength);

    this.draw();
    this.audioElmt.nativeElement.paused
      ? this.audioElmt.nativeElement.play()
      : this.audioElmt.nativeElement.pause();
    this.displayPlayBtn = this.audioElmt.nativeElement.paused;
  }
}
