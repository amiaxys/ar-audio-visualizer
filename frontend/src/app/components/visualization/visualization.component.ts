import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
})
export class VisualizationComponent {
  @ViewChild('audio') audioElmt!: ElementRef<HTMLAudioElement>;
  audioCtx!: AudioContext;
  analyser!: AnalyserNode;
  bufferLength: number = 0;
  dataArray: Uint8Array = new Uint8Array(this.bufferLength);

  boxHeight: number = 1;
  cylinderHeight: number = 1.5;
  sphereRadius: number = 1.25;

  start: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  draw(): void {
    window.requestAnimationFrame(this.draw.bind(this));
    this.analyser.getByteFrequencyData(this.dataArray);

    const avg = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
    this.dataArray.sort((a, b) => a - b);
    this.boxHeight = this.dataArray[this.dataArray.length / 2 - 2] / 100;
    this.cylinderHeight = avg / 100;
    this.sphereRadius = this.dataArray[this.dataArray.length - 2] / 200;
  }

  startVisualization(): void {
    if (!this.start) {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();

      const distortion = this.audioCtx.createWaveShaper();
      const source = this.audioCtx.createMediaElementSource(
        this.audioElmt.nativeElement
      );

      source.connect(this.analyser);
      this.analyser.connect(distortion);
      distortion.connect(this.audioCtx.destination);

      this.start = true;
    }

    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.audioElmt.nativeElement.play();
    this.draw();
  }
}
