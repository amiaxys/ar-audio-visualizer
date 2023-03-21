import { Component } from '@angular/core';
@Component({
  selector: 'app-visualization-display',
  templateUrl: './visualization-display.component.html',
  styleUrls: ['./visualization-display.component.scss'],
})
export class VisualizationDisplayComponent {
  //cameraEvent!: any;

  ngAfterViewInit(): void {
    window.addEventListener('camera-init', (event: any) => {
      // this doesn't seem to be logging the right event
      console.log('camera-init', event);
      //this.cameraEvent = event;

    });
  }
  /* removeStream(): void {
    // not the best way to do this, but it works, kind of
    // body still being sus and header is getting hidden when going to another page
    // could probably hack a fix for that, but I want to find a better way
    const arjsVideo = document.getElementById('arjs-video');
    if (arjsVideo) {
      arjsVideo.remove();
      // see issue in camera-init event listener
      //this.cameraEvent.stream.getTracks().forEach((track: MediaStreamTrack) => {
        //track.stop();
      //});
      // doesn't work
      //document.body.removeAttribute('style');
    }
  } */
}
