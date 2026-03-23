// to solve error on the rero-ils public search page due to the webpack bundle
import 'zone.js';
import { createCustomElement } from '@angular/elements';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { RemoteSearchComponent } from '@rero/shared';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    if (!customElements.get('main-search-bar')) {
      const injector = appRef.injector;
      const searchBar = createCustomElement(RemoteSearchComponent, { injector });
      customElements.define('main-search-bar', searchBar);
    }
  })
  .catch(err => console.error(err));
