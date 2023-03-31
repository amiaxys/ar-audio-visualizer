import { Component } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'arAudioVisualizer';

  reloadNextPage: boolean = false;

  constructor(private router: Router) {
    // detect route change
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        // check if route is visualizations/:id
        if (event.url === '/visualizations/' + event.url.split('/')[2]) {
          this.reloadNextPage = true;
        } else if (this.reloadNextPage) {
          // due to the way ar.js keeps track of and changes the body, the next
          // page must be reloaded if the previous page had ar.js enabled
          // Angular Contributer also said it was the best way
          // TODO: find a way to fix the ar.js library without reloading the page
          this.reloadNextPage = false;
          window.location.reload();
        }
      }
    });
  }
}
