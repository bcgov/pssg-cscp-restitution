import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, UntypedFormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { IOptionSetVal, MY_FORMATS, ResitutionForm } from '../../enums-list';
import { FormBase } from '../../form-base';

@Component({
  selector: 'app-restitution-overview',
  templateUrl: './restitution-overview.component.html',
  styleUrls: ['./restitution-overview.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionOverviewComponent extends FormBase implements OnInit {
  @Input() formType: IOptionSetVal;
  public form: UntypedFormGroup;
  ResitutionForm = ResitutionForm;
  applicant: string = '';

  constructor(private controlContainer: ControlContainer) {
    super();
  }

  ngOnInit() {
    this.form = <UntypedFormGroup>this.controlContainer.control;
    setTimeout(() => {
      this.form.markAsTouched();
    }, 0);

    if (this.formType.val === ResitutionForm.Victim.val || this.formType.val === ResitutionForm.VictimEntity.val) {
      this.applicant = 'Victim';
    } else if (this.formType.val === ResitutionForm.Offender.val) {
      this.applicant = 'Accused/Offender';
    }
  }
}
