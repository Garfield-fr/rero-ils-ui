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

import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { TranslateLoader as BaseCoreTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader, NgCoreTranslateService, primeNGConfig } from '@rero/ng-core';
import { SharedModule } from '@rero/shared';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { providePrimeNG } from 'primeng/config';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import {
  fieldPasswordMatchValidator,
} from 'projects/public-search/src/app/patron-profile/patron-profile-password/patron-profile-password.component';
import { patronProfileRoutes } from 'projects/public-search/src/app/routes/patron-profile-routes';
import { AppConfigService } from './app-config-service.service';
import { AppInitializerService } from './app-initializer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(patronProfileRoutes),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: BaseCoreTranslateLoader,
          useClass: CoreTranslateLoader,
          deps: [CoreConfigService, HttpClient],
        },
        isolate: false,
      }),
      FormlyModule.forRoot({
        validators: [{ name: 'passwordMatch', validation: fieldPasswordMatchValidator }],
      }),
      SharedModule,
      LoadingBarHttpClientModule,
      TabsModule,
      MessageModule,
      MenuModule,
      BadgeModule,
      TimelineModule
    ),
    provideAppInitializer(() => {
      const appInitializerService = inject(AppInitializerService);
      return appInitializerService.load();
    }),
    {
      provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
    { provide: TranslateService, useClass: NgCoreTranslateService },
    { provide: CoreConfigService, useClass: AppConfigService },
    ConfirmationService,
    MessageService,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
  ],
};
