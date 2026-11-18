import { Component, Input, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FieldComponent implements OnInit {
  @Input() required = false;
  @Input() showChevrons = true;
  @Input() valid = true;
  @Input() label: string;
  @Input() tooltipReference: TemplateRef<any>;
  @Input() leadingText: string;
  @Input() errorMessage: string;
  @Input() disabled: boolean;

  tooltipText = '';

  constructor() {}

  ngOnInit() {
    if (this.tooltipReference) {
      const view = this.tooltipReference.createEmbeddedView({});
      this.tooltipText = view.rootNodes
        .map((node: Node) => node.textContent ?? '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      view.destroy();
    }
  }
}
