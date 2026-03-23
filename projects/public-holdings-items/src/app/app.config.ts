/*
 * RERO ILS UI
 * Copyright (C) 2021-2026 RERO
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
import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { TranslateLoader as BaseTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CoreConfigService,
  CoreTranslateLoader,
  NgCoreTranslateService,
  primeNGConfig,
  provideCore,
} from '@rero/ng-core';
import { SharedModule } from '@rero/shared';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { providePrimeNG } from 'primeng/config';
import { DividerModule } from 'primeng/divider';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { AppConfigService } from './app-config-service.service';
import { AppInitializerService } from './app-initializer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    importProvidersFrom(
      AccordionModule,
      TabsModule,
      CardModule,
      MessageModule,
      MenubarModule,
      DividerModule,
      FormlyModule.forRoot(),
      FormlyPrimeNGModule,
      TranslateModule.forRoot({
        loader: {
          provide: BaseTranslateLoader,
          useClass: CoreTranslateLoader,
          deps: [CoreConfigService, HttpClient],
        },
        isolate: false,
      }),
      SharedModule,
      LoadingBarHttpClientModule,
      LoadingBarModule
    ),
    provideAppInitializer(() => {
      const appInitializerService = inject(AppInitializerService);
      return appInitializerService.load();
    }),
    provideCore(),
    { provide: TranslateService, useClass: NgCoreTranslateService },
    { provide: CoreConfigService, useClass: AppConfigService },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
  ],
};
