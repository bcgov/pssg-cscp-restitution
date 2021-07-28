import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
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
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BsDatepickerModule, AlertModule } from 'ngx-bootstrap';
import { CancelApplicationDialog } from './shared/cancel-dialog/cancel-dialog.component';
import { CancelDialog } from './shared/dialogs/cancel/cancel.dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { DateFieldComponent } from './shared/date-field/date-field.component';
import { FieldComponent } from './shared/field/field.component';
import { FileDropModule } from 'ngx-file-drop';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { JusticeApplicationDataService } from './services/justice-application-data.service';
import { LookupService } from './services/lookup.service';
import { NgBusyModule } from 'ng-busy';
import { NgxMaskModule } from 'ngx-mask'
import { NotFoundComponent } from './not-found/not-found.component';
import { PhonePipe } from './pipes/phone.pipe';
import { QuickExitComponent } from './quick-exit/quick-exit.component';
import { RestitutionApplicationComponent } from './restitution-application/restitution-application.component';
import { SignPadDialog } from './sign-dialog/sign-dialog.component';
import { Angular2SignaturepadModule } from 'angular2-signaturepad';
import { StateService } from './services/state.service';
import { ToolTipTriggerComponent } from './shared/tool-tip/tool-tip.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { RestitutionOverviewComponent } from './shared/restitution/restitution-overview/restitution-overview.component';
import { RestitutionInformationComponent } from './shared/restitution/restitution-information/restitution-information.component';
import { RestitutionContactInformationComponent } from './shared/restitution/contact-information/contact-information.component';
import { RestitutionReviewComponent } from './shared/restitution/review/restitution-review.component';
import { RestitutionSuccessComponent } from './shared/restitution/success/restitution-success.component';
import { MessageDialog } from './shared/dialogs/message-dialog/message.dialog';
import { RestitutionAddressComponent } from './shared/restitution-address/address.component';

@NgModule({
  declarations: [
    RestitutionAddressComponent,
    AppComponent,
    BreadcrumbComponent,
    CancelApplicationDialog,
    CancelDialog,
    DateFieldComponent,
    FieldComponent,
    FileUploaderComponent,
    MessageDialog,
    NotFoundComponent,
    PhonePipe,
    QuickExitComponent,
    RestitutionApplicationComponent,
    RestitutionContactInformationComponent,
    RestitutionInformationComponent,
    RestitutionOverviewComponent,
    RestitutionReviewComponent,
    RestitutionSuccessComponent,
    SignPadDialog,
    ToolTipTriggerComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
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
    NgBusyModule,
    ReactiveFormsModule,
    Angular2SignaturepadModule,
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaskModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
  ],
  exports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FileDropModule,
    FormsModule,
    HttpClientModule,
    // HttpModule,
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
    TooltipModule,
  ],
  providers: [
    CookieService,
    JusticeApplicationDataService,
    LookupService,
    StateService,
    Title,
  ],
  entryComponents: [
    CancelApplicationDialog,
    CancelDialog,
    MessageDialog,
    SignPadDialog,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
