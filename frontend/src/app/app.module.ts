import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule, AlertConfig } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {
  BsDatepickerModule,
  BsDatepickerConfig,
} from 'ngx-bootstrap/datepicker';
import { BsDropdownModule, BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

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
import { AFrame } from 'aframe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VisualizationDisplayComponent } from './pages/visualization-display/visualization-display.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { NotAuthenticatedComponent } from './components/not-authenticated/not-authenticated.component';

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
    VisualizationDisplayComponent,
    ClickStopPropagationDirective,
    NotAuthenticatedComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    AccordionModule,
    AlertModule,
    ButtonsModule,
    CarouselModule,
    CollapseModule,
    BsDatepickerModule,
    BsDropdownModule,
    ModalModule,
  ],
  providers: [
    AlertConfig,
    BsDatepickerConfig,
    BsDropdownConfig,
    BsModalService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
