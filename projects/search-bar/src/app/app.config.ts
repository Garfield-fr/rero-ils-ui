/*
 * RERO ILS UI
 * Copyright (C) 2019-2026 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader, NgCoreTranslateService, primeNGConfig, TruncateTextPipe } from '@rero/ng-core';
import { MainTitlePipe } from '@rero/shared';
import { providePrimeNG } from 'primeng/config';
import { importProvidersFrom } from '@angular/core';
import { AppInitializerService } from './app-initializer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: BaseTranslateLoader,
          useClass: CoreTranslateLoader,
          deps: [CoreConfigService, HttpClient],
        },
        isolate: false,
      }),
    ),
    { provide: TranslateService, useClass: NgCoreTranslateService },
    provideAppInitializer(() => {
      const translateService = inject(NgCoreTranslateService);
      translateService.initialize();
      const appInitializerService = inject(AppInitializerService);
      return appInitializerService.load();
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
    MainTitlePipe,
    TruncateTextPipe,
  ],
};
