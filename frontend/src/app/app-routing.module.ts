import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVisualizationComponent } from './pages/create-visualization/create-visualization.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { IndexComponent } from './pages/index/index.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { VisualizationsComponent } from './pages/visualizations/visualizations.component';
import { VisualizationDisplayComponent } from './pages/visualization-display/visualization-display.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'credits',
    component: CreditsComponent,
  },
  {
    path: 'visualizations',
    component: VisualizationsComponent,
  },
  {
    path: 'visualizations/:UserId/:id',
    component: VisualizationDisplayComponent,
  },
  {
    path: 'create-visualization',
    component: CreateVisualizationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
