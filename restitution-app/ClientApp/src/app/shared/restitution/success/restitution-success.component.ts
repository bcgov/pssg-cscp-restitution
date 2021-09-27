import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { StateService } from '../../../services/state.service';
import { ResitutionForm } from '../../enums-list';

@Component({
  selector: 'restitution-success',
  templateUrl: './restitution-success.component.html',
  styleUrls: ['./restitution-success.component.scss']
})
export class RestitutionSuccessComponent {
  constructor(private router: Router, private state: StateService) {
    this.router.navigateByUrl("/restitution-success");
  }

  submitAnotherApplication() {
    this.state.cloning = true;
    let type = this.state.data.type;
    if (type.val === ResitutionForm.Victim.val) {
      this.router.navigate(['/victim']);
    }
    else if (type.val === ResitutionForm.Offender.val) {
      this.router.navigate(['/offender']);
    }
    else if (type.val === ResitutionForm.VictimEntity.val) {
      this.router.navigate(['/victim-entity']);
    }
    else {
      //not implemented...
    }
  }
}
