import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CRMBoolean, CRMMultiBoolean, IOptionSetVal, MY_FORMATS, ResitutionForm } from '../../enums-list';
import { FormBase } from '../../form-base';
import { RestitutionInfoHelper } from '../restitution-information/restitution-information.helper';

@Component({
  selector: 'app-restitution-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionContactInformationComponent extends FormBase implements OnInit {
  @Input() formType: IOptionSetVal;
  @Input() isDisabled: boolean;
  public form: UntypedFormGroup;
  ResitutionForm = ResitutionForm;
  CRMMultiBoolean = CRMMultiBoolean;
  CRMBoolean = CRMBoolean;

  restitutionInfoHelper = new RestitutionInfoHelper();

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
  }
  primaryContactChange(index) {
    let entityContacts = this.form.get('entityContacts') as UntypedFormArray;
    //entityContacts.at(index).get("isPrimaryContact").setValue(CRMMultiBoolean.True);
    for (var i = 0; i < entityContacts.controls.length; i++) {
      if (i != index) {
        entityContacts.at(i).get('isPrimaryContact').setValue(CRMMultiBoolean.False);
      }
    }
    //this.form.get('entityContacts').setValue(entityContacts);
  }
  preferredMethodOfContactChange() {
    let preferredVal = this.form.get('preferredMethodOfContact').value;
    let phoneControl = this.form.get('phoneNumber');
    let emailControl = this.form.get('email');

    if (preferredVal == this.enum.ContactMethods.Phone.val) {
      this.setControlValidators(phoneControl, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]);
      this.setControlValidators(emailControl, [Validators.email]);
    } else if (preferredVal == this.enum.ContactMethods.Email.val) {
      this.setControlValidators(emailControl, [Validators.required, Validators.email]);
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
    } else if (preferredVal == this.enum.ContactMethods.Mail.val) {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    } else {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    }

    let smsPreferred = this.form.get('smsPreferred').value;
    if (smsPreferred == CRMBoolean.True) {
      this.setControlValidators(phoneControl, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]);
    }
  }
  preferredMethodOfContactChangeByContact(index) {
    let entityContacts = this.form.get('entityContacts') as UntypedFormArray;
    let selectedContact = entityContacts.at(index) as UntypedFormControl;
    let preferredVal = selectedContact.get('preferredMethodOfContact').value;
    let phoneControl = selectedContact.get('phoneNumber');
    let emailControl = selectedContact.get('email');

    if (preferredVal == this.enum.ContactMethods.Phone.val) {
      this.setControlValidators(phoneControl, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]);
      this.setControlValidators(emailControl, [Validators.email]);
    } else if (preferredVal == this.enum.ContactMethods.Email.val) {
      this.setControlValidators(emailControl, [Validators.required, Validators.email]);
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
    } else if (preferredVal == this.enum.ContactMethods.Mail.val) {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    } else {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    }

    let smsPreferred = selectedContact.get('smsPreferred').value;
    if (smsPreferred == CRMBoolean.True) {
      this.setControlValidators(phoneControl, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]);
    }
  }

  addContact() {
    let entityContacts = this.form.get('entityContacts') as UntypedFormArray;
    var contact = this.restitutionInfoHelper.createEntityContact(this.fb, this.formType);
    contact.get('isPrimaryContact').setValue(CRMMultiBoolean.False);
    entityContacts.push(contact);
  }

  removeContact(index: number) {
    let entityContacts = this.form.get('entityContacts') as UntypedFormArray;
    entityContacts.removeAt(index);
    if (entityContacts.length == 1) {
      entityContacts.at(0).get('isPrimaryContact').setValue(CRMMultiBoolean.True);
    }
  }
}
