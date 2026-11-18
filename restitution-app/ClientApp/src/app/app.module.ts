import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { CdkTableModule } from '@angular/cdk/table';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FeatureEnabledDirective } from './directives/feature-enabled.directive';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OutageComponent } from './outage/outage.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { RestitutionApplicationComponent } from './restitution-application/restitution-application.component';
import { StateService } from './services/state.service';
import { AlertComponent } from './shared/alert/alert.component';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { DateFieldComponent } from './shared/date-field/date-field.component';
import { CancelDialog } from './shared/dialogs/cancel/cancel.dialog';
import { MessageDialog } from './shared/dialogs/message-dialog/message.dialog';
import { FieldComponent } from './shared/field/field.component';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { GenderSelectorComponent } from './shared/gender-selector/gender-selector.component';
import { RaceSelectorComponent } from './shared/race-selector/race-selector.component';
import { RestitutionAddressComponent } from './shared/restitution-address/address.component';
import { RestitutionContactInformationComponent } from './shared/restitution/contact-information/contact-information.component';
import { OffenderFormComponent } from './shared/restitution/restitution-information/offender-form.component';
import { RestitutionInformationComponent } from './shared/restitution/restitution-information/restitution-information.component';
import { VictimEntityFormComponent } from './shared/restitution/restitution-information/victim-entity-form.component';
import { VictimFormComponent } from './shared/restitution/restitution-information/victim-form.component';
import { RestitutionOverviewComponent } from './shared/restitution/restitution-overview/restitution-overview.component';
import { RestitutionReviewComponent } from './shared/restitution/review/restitution-review.component';
import { RestitutionSuccessComponent } from './shared/restitution/success/restitution-success.component';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';

@NgModule({
  declarations: [
    AlertComponent,
    RestitutionAddressComponent,
    AppComponent,
    BreadcrumbComponent,
    CancelApplicationDialog,
    CancelDialog,
    DateFieldComponent,
    FieldComponent,
    FileUploaderComponent,
    MessageDialog,
    MaintenanceComponent,
    NotFoundComponent,
    OutageComponent,
    PhonePipe,
    QuickExitComponent,
    RestitutionApplicationComponent,
    RestitutionContactInformationComponent,
    RestitutionInformationComponent,
    VictimFormComponent,
    OffenderFormComponent,
    VictimEntityFormComponent,
    RestitutionOverviewComponent,
    RestitutionReviewComponent,
    RestitutionSuccessComponent,
    SignPadDialog,
    ToolTipTriggerComponent,
    GenderSelectorComponent,
    RaceSelectorComponent,
    FeatureEnabledDirective
  ],
  exports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    NgxFileDropModule,
    NgxSpinnerModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CdkTableModule,
    NgxFileDropModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxSpinnerModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SignaturePadComponent
  ],
  providers: [
    provideNgxMask(),
    StateService,
    Title,
    provideHttpClient(withXhr(), withInterceptors([LoadingInterceptor]), withInterceptorsFromDi())
  ]
})
export class AppModule {}
