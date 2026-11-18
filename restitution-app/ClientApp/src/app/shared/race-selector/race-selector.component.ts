import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormBase } from '../form-base';
import { EnumHelper } from '../enums-list';

@Component({
  selector: 'app-race-selector',
  templateUrl: './race-selector.component.html',
  styleUrls: ['./race-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RaceSelectorComponent extends FormBase implements OnInit {
  @Input() form: UntypedFormGroup;
  @Input() formControlName: string;
  @Input() isDisabled: boolean;
  enumHelper = new EnumHelper();
  otherRaceEthnicityValue = this.enumHelper.CRMRaceEthnicity.Other.val;

  public get isPersonIndigenous() {
    return this.form.get('primaryRaceEthnicity').value == this.enumHelper.CRMRaceEthnicity.Indigenous.val;
  }

  public get indigenousStatusList() {
    return Object.values(this.enumHelper.IndigenousStatus);
  }

  public get raceEthnicityList() {
    return Object.values(this.enumHelper.CRMRaceEthnicity);
  }
  constructor() {
    super();
  }
  ngOnInit() {}
}
