import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { RestitutionApplicationComponent } from './restitution-application/restitution-application.component';
import { ResitutionForm } from './shared/enums-list';
import { RestitutionSuccessComponent } from './shared/restitution/success/restitution-success.component';

const routes: Routes = [
  {
    path: '',
    component: RestitutionApplicationComponent,
    data: { formType: ResitutionForm.Victim }
  },
  {
    path: 'victim-restitution',
    component: RestitutionApplicationComponent,
    data: { formType: ResitutionForm.Victim }
  },
  {
    path: 'offender-restitution',
    component: RestitutionApplicationComponent,
    data: { formType: ResitutionForm.Offender }
  },
  // {
  //   path: 'application-cancelled',
  //   component: ApplicationCancelledComponent,
  // },
  // {
  //   path: 'application-success',
  //   component: ApplicationSuccessComponent,
  // },
  {
    path: 'restitution-success',
    component: RestitutionSuccessComponent,
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }