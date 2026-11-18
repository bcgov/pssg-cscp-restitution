import { Component, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LookupsService as ApiLookupsService } from '../../../../api/lookups/lookups.service';
import { SignPadDialog } from '../../../sign-dialog/sign-dialog.component';
import { LookupsStore } from '../../../store/lookups/lookups.store';
import { AddressHelper } from '../../address/address.helper';
import { CRMMultiBoolean, IOptionSetVal, MY_FORMATS, ResitutionForm } from '../../enums-list';
import { FormBase } from '../../form-base';
import { POSTAL_CODE } from '../../regex.constants';
import { RestitutionInfoHelper } from './restitution-information.helper';

export const RESTITUTION_INFORMATION_PROVIDERS = [
  { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
];

@Component({
  selector: 'app-restitution-information',
  templateUrl: './restitution-information.component.html',
  styleUrls: ['./restitution-information.component.scss'],
  providers: RESTITUTION_INFORMATION_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionInformationComponent extends FormBase implements OnInit {
  @Input() formType: IOptionSetVal;
  @Input() isDisabled: boolean;
  public form: UntypedFormGroup;
  ResitutionForm = ResitutionForm;
  postalRegex = POSTAL_CODE;
  CRMMultiBoolean = CRMMultiBoolean;

  page_header: string = '';
  applicant_type: string = '';

  addressHelper = new AddressHelper();
  phoneMinLength: number = 10;
  phoneMaxLength: number = 15;

  relationshipList: any = [];
  courtList: any = [];

  genderMToolTip =
    'Persons whose current gender is male. This includes cisgender and transgender persons who are male.';
  genderFToolTip =
    'Persons whose current gender is female. This includes cisgender and transgender persons who are female.';
  genderXToolTip =
    'Persons whose current gender is not exclusively male or female. It includes people who are unsure of their gender, do not have one gender, have no gender, are gender fluid, or are Two-Spirit.';
  relationshipToolTip =
    'Use this category for close friends, neighbours, authority figures, reverse authority figures, business relationships and casual acquaintances.';

  restitutionInfoHelper = new RestitutionInfoHelper();
  private readonly lookupsStore = inject(LookupsStore);

  constructor(
    private controlContainer: ControlContainer,
    private fb: UntypedFormBuilder,
    private matDialog: MatDialog,
    private readonly apiLookupsService: ApiLookupsService
  ) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);

    if (this.formType.val === ResitutionForm.Victim.val) {
      this.page_header = 'Victim Application';
      this.applicant_type = 'Victim';
    } else if (this.formType.val === ResitutionForm.Offender.val) {
      this.page_header = 'Accused/Offender Application';
      this.applicant_type = 'Applicant';
    } else if (this.formType.val === ResitutionForm.VictimEntity.val) {
      this.page_header = 'Entity Victim Application';
      this.applicant_type = 'Victim';
      this.clearControlValidators(this.form.get('firstName'));
      this.clearControlValidators(this.form.get('birthDate'));
      this.clearControlValidators(this.form.get('indigenousStatus'));
      this.clearControlValidators(this.form.get('authorizeDesignate'));
    }

    this.initializeCourts();

    this.apiLookupsService.getApiLookupsRestitutionRelationships('application/json').subscribe((res) => {
      const relationships = [...(res.value ?? [])].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      this.relationshipList = relationships.map((r) => r.name);
    });
  }

  private initializeCourts() {
    this.courtList = this.lookupsStore
      .courts()
      .map((court) => court.name)
      .filter((courtName): courtName is string => !!courtName);
  }

  iHaveOtherNamesChange(val: boolean) {
    if (!val) {
      let otherFirstNameControl = this.form.get('otherFirstName');
      let otherLastNameControl = this.form.get('otherLastName');

      otherFirstNameControl.patchValue('');
      otherLastNameControl.patchValue('');
    }
  }

  authorizeDesignateChange() {
    if (this.form.get('authorizeDesignate').value === CRMMultiBoolean.True) {
      this.addDesignate();
    } else {
      this.removeDesignate();
    }
  }

  addDesignate() {
    let designate = this.form.get('designate') as UntypedFormArray;
    if (designate.length == 0) {
      designate.push(this.restitutionInfoHelper.createDesignate(this.fb));
    }
  }

  removeDesignate() {
    let designate = this.form.get('designate') as UntypedFormArray;
    while (designate.length > 0) {
      designate.removeAt(0);
    }
  }

  addCourtFile() {
    let courtFiles = this.form.get('courtFiles') as UntypedFormArray;
    courtFiles.push(this.restitutionInfoHelper.createCourtFile(this.fb, this.formType));
  }

  removeCourtFile(index: number) {
    let courtFiles = this.form.get('courtFiles') as UntypedFormArray;
    courtFiles.removeAt(index);
  }

  showSignPad(control): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(SignPadDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        var patchObject = {};
        patchObject[control] = data;
        this.form.patchValue(patchObject);
      },
      (err) => console.log(err)
    );
  }
}
