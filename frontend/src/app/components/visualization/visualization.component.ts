import { Component, ViewChild, ElementRef } from '@angular/core';
import { Entity } from '../../classes/entity';
//import { THREE } from 'aframe';
//import * as AFRAME from 'aframe';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent {
  @ViewChild('audio') audioElmt!: ElementRef<HTMLAudioElement>;
  displayPlayBtn: boolean = true;
  // change this to the path to visualization's audio file
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

  skyColor: string = 'hsl(0, 0%, 0%)';

  timeSpheres: Entity[] = [];

  start: boolean = false;

  // testing variables
  //logTime: number = 0;
  //test: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  initializeFreqEntities(): void {
    let nextX = -4;
    const freqEntNum = 5;
    for (let i = 0; i < freqEntNum; i++) {
      const col = `hsl(${i * (360 / freqEntNum)}, 100%, 53%)`;
      const z = -4 + i * 0.5;
      switch (i % 3) {
        case 0:
          this.freqEntities[i] = {
            type: 'a-cylinder',
            position: `${nextX} 0.75 ${z}`,
            radius: '0.5',
            height: '1',
            color: col,
          };
          break;
        case 1:
          this.freqEntities[i] = {
            type: 'a-box',
            position: `${nextX} 0.75 ${z}`,
            rotation: '0 45 0',
            width: '1',
            height: '1.25',
            color: col,
          };
          break;
        case 2:
          this.freqEntities[i] = {
            type: 'a-sphere',
            position: `${nextX} 1 ${z}`,
            radius: '1',
            color: col,
          };
          break;
      }
      nextX += 1 + (freqEntNum - i) * 0.1;
    }
    console.log(this.freqEntities);
  }

  initializeTimeSpheres(): void {
    const width = 18;
    const height = 4;
    const timeSlice = Math.floor(this.timeBufferLength / 20);
    const sliceWidth = width / timeSlice;
    let x = -3.5;
    for (let i = 0; i < timeSlice; i++) {
      const v = this.timeDataArray[i * timeSlice] / 128.0;
      const y = v * (height / 2) + 1;

      this.timeSpheres[i] = {
        type: 'a-sphere',
        position: `${x} ${y} -3`,
        radius: `${sliceWidth * 0.4}`,
        color: `hsl(${i % 360}, 100%, ${Math.min(30 + i * 2, 100)}%)`,
      };

      x += sliceWidth;
    }
  }

  draw(): void {
    window.requestAnimationFrame(this.draw.bind(this));
    // pause animation when audio is paused
    // may change this later
    if (this.audioElmt.nativeElement.paused) {
      this.displayPlayBtn = true;
      return;
    }

    this.freqAnalyser.getByteFrequencyData(this.freqDataArray);
    this.timeAnalyser.getByteTimeDomainData(this.timeDataArray);

    if (this.timeSpheres.length === 0) {
      this.initializeTimeSpheres();
      this.initializeFreqEntities();
      /* AFRAME.registerComponent('time-sphere', {
        init: function () {},
        tick: function () {
          this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
        },
      });*/
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
      let freqHue = this.freqEntities[i].color.match(this.hueRegex)![0];
      this.freqEntities[i].color = `hsl(${freqHue}, ${Math.floor(
        30 + (freqAvg / 255) * 50
      )}%, 50%)`;

      // uncomment the block below for rainbow entities
      /* this.freqEntities[i].color = `hsl(${Math.ceil((freqAvg / 255) * 360)}, 100%, ${Math.floor(
        30 + (freqAvg / 255) * 70
      )}%)`; */
    }

    // change sky color
    /* const r = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2] / 255.0) * 150
    );
    const g = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2 - 1] / 255.0) * 150
    );
    const b = Math.floor((this.freqDataArray[0] / 255.0) * 150); */
    const skyLight = Math.floor((this.freqDataArray[this.freqDataArray.length / 2] / 255.0) * 100);
    this.skyColor = `hsl(0, 0%, ${skyLight}%)`;

    // change time spheres (wave)
    const height = 4;
    // when maxDiff is too big, wave animation gets too jitty
    // best is actually 0.01, but not enough change
    const maxDiff = 0.04;
    let y: number =
      (this.timeDataArray[this.timeDataArray.length / 2] / 128.0) *
        (height / 2) +
      1;
    let tempPos: string[];
    for (let i = 0; i < this.timeSpheres.length; i++) {
      // change y position of time sphere
      let tempy = y;
      tempPos = this.timeSpheres[i].position.split(' ');
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
      this.timeSpheres[i].position = tempPos.join(' ');

      // change colour of time sphere
      let timeHue;
      if (i === 0) {
        timeHue =
          parseInt(this.timeSpheres[i].color.match(this.hueRegex)![0], 10) + 1;
      } else {
        timeHue = parseInt(
          this.timeSpheres[i - 1].color.match(this.hueRegex)![0],
          10
        );
      }
      this.timeSpheres[i].color = `hsl(${timeHue % 360}, 100%, ${Math.min(
        30 + i * 2,
        100
      )}%)`;
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
    this.displayPlayBtn = false;
  }
}
