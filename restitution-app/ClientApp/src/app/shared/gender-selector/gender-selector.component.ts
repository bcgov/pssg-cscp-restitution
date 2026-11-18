import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormBase } from '../form-base';
import { EnumHelper } from '../enums-list';

@Component({
  selector: 'app-gender-selector',
  templateUrl: './gender-selector.component.html',
  styleUrls: ['./gender-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class GenderSelectorComponent extends FormBase implements OnInit {
  constructor() {
    super();
  }
  @Input() form: UntypedFormGroup;
  @Input() formControlName: string;
  @Input() isDisabled: boolean;
  enumHelper = new EnumHelper();
  selfDescribeValue = this.enumHelper.CRMGender.SelfDescribe.val;
  otherPronounValue = this.enumHelper.CRMPronoun.Other.val;

  public get genderList() {
    return Object.values(this.enumHelper.CRMGender);
  }

  public get pronounList() {
    return Object.values(this.enumHelper.CRMPronoun);
  }

  ngOnInit(): void {
    this.form.get('gender').valueChanges.subscribe((x) => {
      this.form.get('otherGender').setValue('');
    });
    this.form.get('pronouns').valueChanges.subscribe((x) => {
      this.form.get('otherPronoun').setValue('');
    });
  }
}
