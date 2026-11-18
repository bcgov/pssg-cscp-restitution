import { Component, inject, isDevMode, OnInit, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Configuration } from './interfaces/configuration.interface';
import { ConfigurationStore } from './store/configuration/configuration.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppComponent implements OnInit {
  title = '';
  previousUrl: string;
  apiPath = environment.apiRootUrl;
  public isNewUser: boolean;
  public isDevMode: boolean;
  private readonly configurationStore = inject(ConfigurationStore);

  constructor(
    private renderer: Renderer2,
    private router: Router
  ) {
    this.isDevMode = isDevMode();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let prevSlug = this.previousUrl;
        let nextSlug = event.url.slice(1);
        if (!nextSlug) nextSlug = 'home';
        if (prevSlug) {
          this.renderer.removeClass(document.body, 'ctx-' + prevSlug);
        }
        if (nextSlug) {
          this.renderer.addClass(document.body, 'ctx-' + nextSlug);
        }
        this.previousUrl = nextSlug;
      }
    });
  }

  get configuration(): Configuration {
    return this.configurationStore.configuration();
  }

  get error(): boolean {
    return !!this.configurationStore.error();
  }

  get showAnnouncementBanner(): boolean {
    return this.configurationStore.showAnnouncementBanner();
  }

  get announcementMessage(): string {
    return this.configurationStore.configuration().outageMessage ?? '';
  }

  ngOnInit(): void {
    if (this.configurationStore.error()) {
      console.error('Failed to fetch configuration:', this.configurationStore.error());
    }
  }

  isIE10orLower() {
    if (window.document['documentMode']) {
      return true;
    }

    return false;
  }
}
