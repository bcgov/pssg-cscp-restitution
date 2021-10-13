import { FormBase } from "../../form-base";
import { OnInit, Component, Input } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatStepper } from "@angular/material";
import { FormGroup, ControlContainer, FormArray, FormBuilder } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MY_FORMATS, IOptionSetVal, ResitutionForm, EnumHelper, CRMBoolean, CRMMultiBoolean } from "../../enums-list";
import { AddressHelper } from "../../address/address.helper";
import { RESTITUTION_PAGES } from "../../../restitution-application/restitution-application.component";

@Component({
    selector: 'app-restitution-review',
    templateUrl: './restitution-review.component.html',
    styleUrls: ['./restitution-review.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class RestitutionReviewComponent extends FormBase implements OnInit {
    @Input() formType: IOptionSetVal;
    @Input() parentStepper: MatStepper;
    public form: FormGroup;
    ResitutionForm = ResitutionForm;
    enumHelper = new EnumHelper();
    addressHelper = new AddressHelper();
    CRMBoolean = CRMBoolean;
    CRMMultiBoolean = CRMMultiBoolean;

    contactsToDisplay: any;

    PAGES = RESTITUTION_PAGES;
    applicant_type: string = "";

    constructor(
        private controlContainer: ControlContainer,
        private fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.form = <FormGroup>this.controlContainer.control;
        setTimeout(() => { this.form.markAsTouched(); }, 0);
        // console.log("overview component");
        // console.log(this.formType);

        if (this.formType.val === ResitutionForm.Victim.val || this.formType.val === ResitutionForm.VictimEntity.val) {
            this.applicant_type = "Victim";
        }
        else if (this.formType.val === ResitutionForm.Offender.val) {
            this.applicant_type = "Offender";
        }

        let entityContacts = this.form.get('restitutionInformation.contactInformation.entityContacts') as FormArray;
        this.contactsToDisplay = this.fb.array([]);
        console.log(entityContacts);
        for (let i = 0; i < entityContacts.length; ++i) {
            console.log(entityContacts.at(i).get("firstName"));
            if ((entityContacts.at(i).get("firstName").value || entityContacts.at(i).get("lastName").value)) {
                this.contactsToDisplay.push(entityContacts.at(i));
            }
        }
    }

    gotoPageAndEdit(selectPage: number, id: string = ""): void {
        this.parentStepper.selectedIndex = selectPage;

        setTimeout(() => {
            if (!id) {
                window.scroll(0, 0);
            }
            else {
                let el = document.getElementById(id);
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}