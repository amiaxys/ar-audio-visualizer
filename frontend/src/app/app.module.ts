import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index/index.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { HeaderComponent } from './components/header/header.component';
import { NewVisualizationComponent } from './components/new-visualization/new-visualization.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    SignInComponent,
    CreditsComponent,
    HeaderComponent,
    NewVisualizationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
