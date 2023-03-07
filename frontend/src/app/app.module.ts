import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IndexComponent } from './pages/index/index.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { HeaderComponent } from './components/header/header.component';
import { NewVisualizationComponent } from './components/new-visualization/new-visualization.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { EqualPasswordsDirective } from './directives/equal-passwords.directive';
import { UniqueUsernameDirective } from './directives/unique-username.directive';
import { ApiInterceptor } from './api.interceptor';
import { VisualizationsComponent } from './pages/visualizations/visualizations.component';
import { FooterComponent } from './components/footer/footer.component';
import { CreateVisualizationComponent } from './pages/create-visualization/create-visualization.component';
import { VisualizationCardComponent } from './components/visualization-card/visualization-card.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualizationComponent,
    IndexComponent,
    SignInComponent,
    CreditsComponent,
    HeaderComponent,
    NewVisualizationComponent,
    SignUpComponent,
    EqualPasswordsDirective,
    UniqueUsernameDirective,
    VisualizationsComponent,
    FooterComponent,
    CreateVisualizationComponent,
    VisualizationCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
