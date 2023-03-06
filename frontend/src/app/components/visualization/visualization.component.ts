import { Component, ViewChild, ElementRef } from '@angular/core';
import { Sphere } from '../../classes/sphere';
//import { THREE } from 'aframe';
//import * as AFRAME from 'aframe';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent {
  @ViewChild('audio') audioElmt!: ElementRef<HTMLAudioElement>;
  audioCtx!: AudioContext;

  freqAnalyser!: AnalyserNode;
  freqBufferLength: number = 0;
  freqDataArray: Uint8Array = new Uint8Array(this.freqBufferLength);

  timeAnalyser!: AnalyserNode;
  timeBufferLength: number = 0;
  timeDataArray: Uint8Array = new Uint8Array(this.timeBufferLength);

  boxHeight: number = 1;
  cylinderHeight: number = 1.5;
  sphereRadius: number = 1.25;
  skyColor: string = '#000';
  timeSpheres: Sphere[] = [];
  //timeCounter: number = 0;

  start: boolean = false;
  //logTime: number = 0;
  //test: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

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
        position: `${x} ${y} -3`,
        radius: `${sliceWidth * 0.4}`,
        color: 'teal',
      };

      x += sliceWidth;
    }
  }

  draw(): void {
    window.requestAnimationFrame(this.draw.bind(this));
    this.freqAnalyser.getByteFrequencyData(this.freqDataArray);
    this.timeAnalyser.getByteTimeDomainData(this.timeDataArray);

    if (this.timeSpheres.length === 0) {
      this.initializeTimeSpheres();
      /* AFRAME.registerComponent('time-sphere', {
        init: function () {},
        tick: function () {
          this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
        },
      }); */
    }

    const sortedFreqArray = this.freqDataArray.slice(0).sort((a, b) => a - b);
    const avg = Math.floor(
      this.freqDataArray.reduce((a, b) => a + b) / this.freqDataArray.length
    );
    const med = Math.floor(this.freqDataArray.length / 2);
    const max = Math.max(this.freqDataArray.length - 1, 0);

    this.boxHeight = sortedFreqArray[med] / 100;
    this.cylinderHeight = avg / 100;
    this.sphereRadius = sortedFreqArray[max] / 200;

    const r = this.freqDataArray[med];
    const g = this.freqDataArray[Math.max(med - 10, 0)];
    const b = this.freqDataArray[0];
    this.skyColor = `rgb(${r}, ${g}, ${b})`;

    const height = 4;
    let y = (this.timeDataArray[this.timeDataArray.length / 2] / 128.0) *
        (height / 2) + 1; /*(sortedFreqArray[Math.max(med + 10, 0)] / 255)*/
    let tempPos;
    //const timeSlice = Math.floor(this.timeBufferLength / 20);
    for (let i = 0; i < this.timeSpheres.length; i++) {
      //const y = (this.timeDataArray[i * timeSlice] / 128.0) * (height / 2) + 1;
      let tempy = y;
      tempPos = this.timeSpheres[i].position.split(' ');
      const tempPosY = parseFloat(tempPos[1]);

      //if (this.timeCounter % (i + 1) === 0) {
        if (y > tempPosY) {
          tempy = y - tempPosY;
          y = tempPosY;
          tempPos[1] = tempPosY + Math.min(tempy, 0.04) + '';
        } else if (y < tempPosY) {
          tempy = tempPosY - y;
          y = tempPosY;
          tempPos[1] = tempPosY - Math.min(tempy, 0.04) + '';
        } else {
          y = tempPosY;
        }
      //}
      this.timeSpheres[i].position = tempPos.join(' ');
    }

    /* if (this.timeCounter === this.timeSpheres.length) {
      this.timeCounter = 0;
    } else {
      this.timeCounter++;
    } */
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
    this.audioElmt.nativeElement.play();
  }
}
