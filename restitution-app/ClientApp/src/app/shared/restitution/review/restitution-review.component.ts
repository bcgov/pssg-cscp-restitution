import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { RESTITUTION_PAGES } from '../../../restitution-application/restitution-application.component';
import { AddressHelper } from '../../address/address.helper';
import { CRMBoolean, CRMMultiBoolean, EnumHelper, IOptionSetVal, MY_FORMATS, ResitutionForm } from '../../enums-list';
import { FormBase } from '../../form-base';

@Component({
  selector: 'app-restitution-review',
  templateUrl: './restitution-review.component.html',
  styleUrls: ['./restitution-review.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionReviewComponent extends FormBase implements OnInit {
  @Input() formType: IOptionSetVal;
  @Input() parentStepper: MatStepper;
  public form: UntypedFormGroup;
  ResitutionForm = ResitutionForm;
  enumHelper = new EnumHelper();
  addressHelper = new AddressHelper();
  CRMMultiBoolean = CRMMultiBoolean;
  CRMBoolean = CRMBoolean;
  contactsToDisplay: any;

  PAGES = RESTITUTION_PAGES;
  applicant_type: string = '';

  get showIndigenous() {
    return (
      this.form.get('restitutionInformation.primaryRaceEthnicity').value ==
        this.enumHelper.CRMRaceEthnicity.Indigenous.val ||
      this.form.get('restitutionInformation.indigenousStatus').value != null
    );
  }

  get showOtherRace() {
    return (
      this.form.get('restitutionInformation.primaryRaceEthnicity').value == this.enumHelper.CRMRaceEthnicity.Other.val
    );
  }

  get showOtherPronoun() {
    return this.form.get('restitutionInformation.pronouns').value == this.enumHelper.CRMPronoun.Other.val;
  }

  get showOtherGender() {
    return this.form.get('restitutionInformation.gender').value == this.enumHelper.CRMGender.SelfDescribe.val;
  }

  constructor(
    private controlContainer: ControlContainer,
    private fb: UntypedFormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);

    if (this.formType.val === ResitutionForm.Victim.val || this.formType.val === ResitutionForm.VictimEntity.val) {
      this.applicant_type = 'Victim';
    } else if (this.formType.val === ResitutionForm.Offender.val) {
      this.applicant_type = 'Accused/Offender';
    }

    let entityContacts = this.form.get('restitutionInformation.contactInformation.entityContacts') as UntypedFormArray;
    this.contactsToDisplay = this.fb.array([]);

    for (let i = 0; i < entityContacts.length; ++i) {
      if (entityContacts.at(i).get('firstName').value || entityContacts.at(i).get('lastName').value) {
        this.contactsToDisplay.push(entityContacts.at(i));
      }
    }
  }

  gotoPageAndEdit(selectPage: number, id: string = ''): void {
    this.parentStepper.selectedIndex = selectPage;

    setTimeout(() => {
      if (!id) {
        window.scroll(0, 0);
      } else {
        let el = document.getElementById(id);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}
