import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CancelApplicationDialog implements OnInit {
  applicationType: string;

  constructor(
    public dialogRef: MatDialogRef<CancelApplicationDialog>,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeMe(): void {
    this.dialogRef.close(false);
  }

  cancelApplication(): void {
    this.dialogRef.close(true);
  }

  ngOnInit() {
    this.applicationType = this.data;
  }
}
