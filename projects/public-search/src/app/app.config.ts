/*
 * RERO ILS UI
 * Copyright (C) 2019-2025 RERO
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
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavigationStart, provideRouter, Router } from '@angular/router';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { TranslateLoader as BaseCoreTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, CoreTranslateLoader, NgCoreTranslateService, primeNGConfig, TruncateTextPipe } from '@rero/ng-core';
import { MainTitlePipe } from '@rero/shared';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { AppConfigService } from './app-config.service';
import { AppInitializerService } from './app-initializer.service';
import { CustomRequestInterceptor } from './interceptor/custom-request.interceptor';
import { CollectionsRouteService } from './routes/collections-route.service';
import { DocumentsRouteService } from './routes/documents-route.service';
import { resourceRouteToken } from './routes/route-collection.service';
import { RouteFactoryService } from './routes/route-factory.service';
import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
    provideAppInitializer(() => {
      const appInitializerService = inject(AppInitializerService);
      return appInitializerService.load();
    }),
    provideAppInitializer(() => {
      const router = inject(Router);
      const routeFactoryService = inject(RouteFactoryService);
      router.events.subscribe(async routerEvent => {
        if (routerEvent instanceof NavigationStart) {
          let url = routerEvent.url;
          const position = url.indexOf('?');
          if (position > -1) {
            url = url.substr(0, position);
          }
          const urlParams = url.split('/').filter(param => param);
          if (urlParams.length === 3) {
            const view = urlParams[0];
            const resource = urlParams[2];
            if (view && resource) {
              routeFactoryService.createRouteByResourceNameAndView(resource, view);
            }
          }
        }
      });
    }),
    { provide: CoreConfigService, useClass: AppConfigService },
    { provide: TranslateService, useClass: NgCoreTranslateService },
    { provide: LOCALE_ID, useFactory: (translate: TranslateService) => translate.currentLang, deps: [TranslateService] },
    { provide: HTTP_INTERCEPTORS, useClass: CustomRequestInterceptor, multi: true },
    { provide: resourceRouteToken, useClass: DocumentsRouteService, multi: true },
    { provide: resourceRouteToken, useClass: CollectionsRouteService, multi: true },
    MainTitlePipe,
    TruncateTextPipe,
    ConfirmationService,
    MessageService,
  ]
};
