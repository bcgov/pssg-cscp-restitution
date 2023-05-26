import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material";
import { FormGroup, ControlContainer, Validators, FormArray, FormBuilder, FormControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm, CRMBoolean } from "../../enums-list";
import { iLookupData } from "../../../interfaces/lookup-data.interface";
import { RestitutionInfoHelper } from "../restitution-information/restitution-information.helper";

@Component({
    selector: 'app-restitution-contact-information',
    templateUrl: './contact-information.component.html',
    styleUrls: ['./contact-information.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RestitutionContactInformationComponent extends FormBase implements OnInit {
    @Input() formType: IOptionSetVal;
    @Input() lookupData: iLookupData;
    @Input() isDisabled: boolean;
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    CRMBoolean = CRMBoolean;

    restitutionInfoHelper = new RestitutionInfoHelper();

    constructor(
        private controlContainer: ControlContainer,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("contact info component");
        // console.log(this.form);
    }
  primaryContactChange( index ) {
    let entityContacts = this.form.get('entityContacts') as FormArray;
    //entityContacts.at(index).get("isPrimaryContact").setValue(CRMBoolean.True);
    for (var i = 0; i < entityContacts.controls.length; i++) {
      if (i != index) {
        entityContacts.at(i).get("isPrimaryContact").setValue(CRMBoolean.False);
      }
    }
    //this.form.get('entityContacts').setValue(entityContacts);
    }
    preferredMethodOfContactChange() {
        let preferredVal = this.form.get("preferredMethodOfContact").value;
        let phoneControl = this.form.get("phoneNumber");
        let emailControl = this.form.get("email");

        if (preferredVal == this.enum.ContactMethods.Phone.val) {
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(15)]);
            this.setControlValidators(emailControl, [Validators.email]);
        }
        else if (preferredVal == this.enum.ContactMethods.Email.val) {
            this.setControlValidators(emailControl, [Validators.required, Validators.email]);
            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
        }
        else if (preferredVal == this.enum.ContactMethods.Mail.val) {
            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
            this.setControlValidators(emailControl, [Validators.email]);
        }
        else {
            this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
            this.setControlValidators(emailControl, [Validators.email]);
        }

        let smsPreferred = this.form.get("smsPreferred").value;
        if (smsPreferred == CRMBoolean.True) {
            this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(15)]);
        }
    }
  preferredMethodOfContactChangeByContact(index) {
    let entityContacts = this.form.get('entityContacts') as FormArray;
    let selectedContact = entityContacts.at(index) as FormControl;
    let preferredVal = selectedContact.get("preferredMethodOfContact").value;
    let phoneControl = selectedContact.get("phoneNumber");
    let emailControl = selectedContact.get("email");

    if (preferredVal == this.enum.ContactMethods.Phone.val) {
      this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    }
    else if (preferredVal == this.enum.ContactMethods.Email.val) {
      this.setControlValidators(emailControl, [Validators.required, Validators.email]);
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
    }
    else if (preferredVal == this.enum.ContactMethods.Mail.val) {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    }
    else {
      this.setControlValidators(phoneControl, [Validators.minLength(10), Validators.maxLength(15)]);
      this.setControlValidators(emailControl, [Validators.email]);
    }

    let smsPreferred = selectedContact.get("smsPreferred").value;
    if (smsPreferred == CRMBoolean.True) {
      this.setControlValidators(phoneControl, [Validators.required, Validators.minLength(10), Validators.maxLength(15)]);
    }
  }

    addContact() {
      let entityContacts = this.form.get('entityContacts') as FormArray;
      var contact = this.restitutionInfoHelper.createEntityContact(this.fb);
      contact.get("isPrimaryContact").setValue(CRMBoolean.False);
      entityContacts.push(contact);
    }

    removeContact(index: number) {
        let entityContacts = this.form.get('entityContacts') as FormArray;
      entityContacts.removeAt(index);
      if (entityContacts.length == 1) {
        entityContacts.at(0).get("isPrimaryContact").setValue(CRMBoolean.True);
      }
    }
}

