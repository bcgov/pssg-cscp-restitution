import { Component, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { HealthCheckService } from '../services/health-check.service';

@Component({
  selector: 'app-outage',
  template: `
    <div class="outage-container">
      <h1>Service Unavailable</h1>
      <p>
        The Restitution application is currently unavailable. Please try again later or contact the Restitution Unit:
      </p>
      <p>
        Telephone: 604-660-4898<br />
        Toll Free: 1-844-660-4898<br />
        Email:
        <a href="mailto:restitution@gov.bc.ca">restitution&#64;gov.bc.ca</a>
      </p>
    </div>
  `,
  styles: [
    `
      .outage-container {
        max-width: 600px;
        margin: 80px auto;
        padding: 32px;
        text-align: center;
      }
      .outage-container h1 {
        margin-bottom: 24px;
      }
      .outage-container a {
        text-decoration: underline;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class OutageComponent {
  private readonly healthCheckService = inject(HealthCheckService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.healthCheckService.isHealthy()) {
        this.router.navigateByUrl('/');
      }
    });
  }
}
