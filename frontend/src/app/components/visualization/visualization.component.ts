import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { Entity } from '../../classes/entity';
import { Visualization } from '../../classes/visualization';
import { environment } from '../../../environments/environment';
//import { THREE } from 'aframe';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent {
  @Input() visualization!: Visualization;
  @Input() entityTypes!: string[];

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

  constructor() {}

  ngOnInit(): void {
    if (!AFRAME.components['time-entity']) {
      AFRAME.registerComponent('time-entity', {
        init: function () {},
        tick: function () {
          // I'm not actually sure if this smooths the movement
          this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
        },
      });
    }

    this.audioSource = `${environment.backendUrl}/api/visualizations/${this.visualization.id}/audio`;
  }

  ngAfterViewInit(): void {}

  avg(arr: Uint8Array): number{
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

max(arr: Uint8Array): number{
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}

  initializeFreqEntities(): void {
    let metaFreqTypes = this.visualization.metadata.freq.entities;

    const freqTypes = JSON.parse(JSON.stringify(this.entityTypes));
    for (let i = 0; i < Math.min(3, metaFreqTypes.length); i++) {
      if (this.entityTypes.includes(metaFreqTypes[i])) {
        freqTypes[i] = metaFreqTypes[i];
      }
    }

    let nextX = -3;
    const freqEntNum = 5;
    let col = this.visualization.metadata.freq.color;
    const defaultCol = col ? false : true;
    for (let i = 0; i < freqEntNum; i++) {
      if (!col || defaultCol) {
        col = `hsl(${i * (360 / freqEntNum)}, 100%, 53%)`;
      }
      const z = i * 0.5;
      switch (i % 3) {
        case 0:
          this.freqEntities[i] = {
            type: `a-${freqTypes[0]}`,
            position: `${nextX} 0.75 ${z}`,
            rotation: '0 45 0',
            radius: '0.5',
            width: '1',
            height: '1',
            color: col,
          };
          break;
        case 1:
          this.freqEntities[i] = {
            type: `a-${freqTypes[1]}`,
            position: `${nextX} 0.75 ${z}`,
            rotation: '0 45 0',
            radius: '0.5',
            width: '1',
            height: '1.25',
            color: col,
          };
          break;
        case 2:
          this.freqEntities[i] = {
            type: `a-${freqTypes[2]}`,
            position: `${nextX} 1 ${z}`,
            rotation: '0 45 0',
            radius: '1',
            width: '1',
            height: '1.25',
            color: col,
          };
          break;
      }
      nextX += 1 + (freqEntNum - i) * 0.1;
    }
  }

  initializeTimeEntities(): void {
    let metaTimeTypes = this.visualization.metadata.time.entities;

    let timeType = 'a-sphere';
    if (this.entityTypes.includes(metaTimeTypes[0])) {
      timeType = 'a-' + metaTimeTypes[0];
    }

    const width = 18;
    const height = 4;
    const timeSlice = Math.floor(this.timeBufferLength / 20);
    const sliceWidth = width / timeSlice;
    let x = -3.5;
    let col = this.visualization.metadata.time.color;
    const defaultCol = col ? false : true;
    for (let i = 0; i < timeSlice; i++) {
      const v = this.timeDataArray[i * timeSlice] / 128.0;
      const y = v * (height / 2) + 1;

      if (!col || defaultCol) {
        col = `hsl(${i % 360}, 100%, ${Math.min(30 + i * 2, 100)}%)`;
      }

      this.timeEntities[i] = {
        type: timeType,
        position: `${x} ${y} -1`,
        radius: `${sliceWidth * 0.4}`,
        width: `${sliceWidth * 0.4 * 2}`,
        height: `${sliceWidth * 0.4 * 2}`,
        color: col,
      };

      x += sliceWidth;
    }
  }

  drawBlob(): void {
    window.requestAnimationFrame(this.drawBlob.bind(this));
    this.freqAnalyser.getByteFrequencyData(this.freqDataArray);

    let lowerHalfArray = this.freqDataArray.slice(0, (this.freqDataArray.length/2) - 1);
    let upperHalfArray = this.freqDataArray.slice((this.freqDataArray.length/2) - 1, this.freqDataArray.length - 1);

    let overallAvg = this.avg(this.freqDataArray);
    let lowerMax = this.max(lowerHalfArray);
    let lowerAvg = this.avg(lowerHalfArray);
    let upperMax = this.max(upperHalfArray);
    let upperAvg = this.avg(upperHalfArray);

    let lowerMaxFr = lowerMax / lowerHalfArray.length;
    let lowerAvgFr = lowerAvg / lowerHalfArray.length;
    let upperMaxFr = upperMax / upperHalfArray.length;
    let upperAvgFr = upperAvg / upperHalfArray.length;
    
  }

  draw(): void {
    // if visualization metadata type is blob, draw blob animation instead
    if (this.visualization.metadata.type === 'blob') {
      this.drawBlob();
      return;
    }

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
        this.freqEntities[i].radius = `${((freqAvg + 1) / 255) * 1.5}`;
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
    }

    const planeLight = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2] / 255.0) * 100
    );
    this.planeColor = `hsl(0, 0%, ${planeLight}%)`;

    // change time spheres (wave)
    const height = 4;
    // when maxDiff is too big, wave animation gets too jitty
    // best is actually 0.01, but not enough change visually
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
