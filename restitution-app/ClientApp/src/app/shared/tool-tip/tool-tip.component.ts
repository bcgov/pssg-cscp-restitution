import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ToolTipTriggerComponent implements OnInit {
  @Input() trigger = '';

  constructor() {}

  ngOnInit() {}
}
