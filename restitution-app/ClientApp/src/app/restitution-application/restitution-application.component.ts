import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, HostListener, inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { RestitutionsService } from '../../api/restitutions/restitutions.service';
import {
  CreateOffenderRestitutionCaseRequestDto,
  CreateVictimEntityRestitutionCaseRequestDto,
  CreateVictimRestitutionCaseRequestDto
} from '../../model';
import { iRestitutionApplication } from '../interfaces/restitution.interface';
import { StateService } from '../services/state.service';
import { CancelDialog } from '../shared/dialogs/cancel/cancel.dialog';
import { ApplicationType, IOptionSetVal, MY_FORMATS, ResitutionForm } from '../shared/enums-list';
import { FormBase } from '../shared/form-base';
import { OffenderRestitutionForm } from '../shared/restitution/restitution-information/offender-form.component';
import { RestitutionInfoHelper } from '../shared/restitution/restitution-information/restitution-information.helper';
import { VictimEntityRestitutionForm } from '../shared/restitution/restitution-information/victim-entity-form.component';
import { VictimRestitutionForm } from '../shared/restitution/restitution-information/victim-form.component';

export enum RESTITUTION_PAGES {
  OVERVIEW,
  RESTITUTION_INFORMATION,
  REVIEW,
  CONFIRMATION
}

export const RESTITUTION_APPLICATION_PROVIDERS = [
  { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
];

@Component({
  selector: 'app-restitution-application',
  templateUrl: './restitution-application.component.html',
  styleUrls: ['./restitution-application.component.scss'],
  providers: RESTITUTION_APPLICATION_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionApplicationComponent extends FormBase implements OnInit {
  restitutionsService = inject(RestitutionsService);

  @ViewChild('stepper', { static: false }) restitutionStepper: MatStepper;
  FORM_TYPE: IOptionSetVal = { val: -1, name: '' };
  ApplicationType = ApplicationType;
  ResitutionForm = ResitutionForm;
  isIE: boolean = false;
  public showPrintView: boolean = false;

  PAGES = RESTITUTION_PAGES;

  courtList: string[] = [];

  restitutionInfoHelper = new RestitutionInfoHelper();

  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private matDialog: MatDialog,
    public state: StateService
  ) {
    super();
  }

  ngOnInit() {
    var ua = window.navigator.userAgent;
    this.isIE = /MSIE|Trident/.test(ua);
    let form_type = this.route.snapshot.data['formType'];
    if (form_type) {
      this.FORM_TYPE = form_type;
    }

    if (this.state.cloning) {
      this.form = this.cloneForm(this.state.data);
      this.state.cloning = false;
    } else {
      this.form = this.buildApplicationForm();
    }

    this.form.valueChanges.subscribe((val) => {
      this.showValidationMessage = this.hasInvalidTouchedControls(this.form);
    });
  }

  // recursively checks if all required fields are filled out touched
  // this is used to determine if the validation message should be shown
  protected hasInvalidTouchedControls(control: AbstractControl): boolean {
    if (control instanceof FormGroup) {
      // check all controls in the FormGroup
      return Object.keys(control.controls).some((key) => this.hasInvalidTouchedControls(control.get(key)));
    } else if (control instanceof FormArray) {
      // check all controls in the FormArray
      return control.controls.some((ctrl) => this.hasInvalidTouchedControls(ctrl));
    } else {
      // it's a FormControl - check if it's invalid and touched
      return control.invalid && control.touched;
    }
  }

  cloneForm(data, FORM: IOptionSetVal = this.FORM_TYPE): UntypedFormGroup {
    let clonedForm: UntypedFormGroup = data.form;

    let courtFiles = clonedForm.get('restitutionInformation.courtFiles') as UntypedFormArray;
    while (courtFiles.length > 0) {
      courtFiles.removeAt(0);
    }

    courtFiles.push(this.restitutionInfoHelper.createCourtFile(this.fb, FORM));

    let documents = clonedForm.get('restitutionInformation.documents') as UntypedFormArray;
    while (documents.length > 0) {
      documents.removeAt(0);
    }

    clonedForm.get('restitutionInformation.declaredAndSigned').patchValue('');
    clonedForm.get('restitutionInformation.declaredAndSigned').markAsUntouched();
    clonedForm.get('restitutionInformation.signature').patchValue('');
    clonedForm.get('restitutionInformation').markAsUntouched();

    this.state.data = null;
    return clonedForm;
  }

  buildApplicationForm(FORM: IOptionSetVal = this.FORM_TYPE): UntypedFormGroup {
    let group = {
      introduction: this.fb.group({}),
      restitutionInformation: this.restitutionInfoHelper.setupFormGroup(this.fb, FORM),
      totalAttachmentSize: [0]
    };

    return this.fb.group(group);
  }

  harvestForm(): iRestitutionApplication {
    let data = {
      ApplicationType: this.FORM_TYPE,
      RestitutionInformation: this.form.get('restitutionInformation').value
    } as iRestitutionApplication;

    return data;
  }

  submit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const restitutionData = this.getRestitutionCreateRequest();
    this.submitRestitutionByType(restitutionData).subscribe({
      next: (res) => {
        this.state.data = { type: this.FORM_TYPE, form: this.form };
        this.router.navigate(['/restitution-success']);
      },
      error: (err) => {
        this.snackBar.open('Error submitting application', 'Close', { duration: 3500, panelClass: ['red-snackbar'] });
        if (this.isIE) {
          alert('Encountered an error. Please use another browser as this may resolve the problem.');
        }
      }
    });
  }

  private submitRestitutionByType(
    createRequest:
      | CreateVictimRestitutionCaseRequestDto
      | CreateVictimEntityRestitutionCaseRequestDto
      | CreateOffenderRestitutionCaseRequestDto
  ) {
    switch (this.FORM_TYPE.val) {
      case ResitutionForm.VictimEntity.val:
        return this.restitutionsService.postApiRestitutionsVictimEntity(
          createRequest as CreateVictimEntityRestitutionCaseRequestDto
        );
      case ResitutionForm.Offender.val:
        return this.restitutionsService.postApiRestitutionsOffender(
          createRequest as CreateOffenderRestitutionCaseRequestDto
        );
      case ResitutionForm.Victim.val:
      default:
        return this.restitutionsService.postApiRestitutionsVictim(
          createRequest as CreateVictimRestitutionCaseRequestDto
        );
    }
  }

  private getRestitutionCreateRequest():
    | CreateVictimRestitutionCaseRequestDto
    | CreateVictimEntityRestitutionCaseRequestDto
    | CreateOffenderRestitutionCaseRequestDto {
    const formData = this.harvestForm();
    switch (formData.ApplicationType.val) {
      case ResitutionForm.VictimEntity.val:
        return VictimEntityRestitutionForm.toCreateRequest(formData);
      case ResitutionForm.Offender.val:
        return OffenderRestitutionForm.toCreateRequest(formData);
      case ResitutionForm.Victim.val:
      default:
        return VictimRestitutionForm.toCreateRequest(formData);
    }
  }

  verifyCancellation(): void {
    let self = this;
    let dialogRef = this.matDialog.open(CancelDialog, {
      autoFocus: false,
      data: { type: 'Application' }
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res.cancel) {
        self.form = self.buildApplicationForm();

        // Clear any state data
        self.state.data = null;

        if (self.restitutionStepper) {
          self.restitutionStepper.reset();
        }

        self.router.navigate(['/']);
      }
    });
  }

  printApplication() {
    window.scroll(0, 0);
    this.showPrintView = true;
    document.querySelectorAll('.slide-close')[0].classList.add('hide-for-print');
    setTimeout(() => {
      window.print();
    }, 100);
  }

  @HostListener('window:afterprint')
  onafterprint() {
    document.querySelectorAll('.slide-close')[0].classList.remove('hide-for-print');
    window.scroll(0, document.body.scrollHeight);
    this.showPrintView = false;
  }
}
