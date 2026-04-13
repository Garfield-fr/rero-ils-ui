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
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideAppInitializer,
} from '@angular/core';
import { APP_BASE_HREF, DatePipe, PlatformLocation } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  ComponentCanDeactivateGuard,
  CoreConfigService,
  CoreTranslateLoader,
  NgCoreTranslateService,
  primeNGConfig,
  RecordHandleErrorService as CoreRecordHandleErrorService,
  registerNgCoreFormlyExtension,
  RemoteAutocompleteService,
  TruncateTextPipe,
  withNgCoreFormly,
} from '@rero/ng-core';
import { ItemHoldingsCallNumberPipe, MainTitlePipe } from '@rero/shared';
import { FORMLY_CONFIG, FormlyModule, provideFormlyCore } from '@ngx-formly/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { providePrimeNG } from 'primeng/config';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { registerFormlyExtension } from './acquisition/formly/extension';
import { OrderLineTypeComponent } from './acquisition/formly/type/field-order-line.type';
import { ReceiptLinesTypeComponent } from './acquisition/formly/type/receipt-lines.type';
import { InputNoLabelWrapperComponent } from './acquisition/formly/wrapper/input-no-label.wrapper';
import { IdentifiedbyValueComponent } from './record/editor/wrappers/identifiedby-value.component';
import { UserIdComponent } from './record/editor/wrappers/user-id.component';
import { ReceivedOrderPermissionValidator } from './acquisition/utils/permissions';
import { NoCacheHeaderInterceptor } from './interceptor/no-cache-header.interceptor';
import { UserCurrentLibraryInterceptor } from './interceptor/user-current-library.interceptor';
import { CountryCodeTranslatePipe } from './pipe/country-code-translate.pipe';
import { RemoteAutocompleteService as UiRemoteAutocompleteService } from './record/editor/formly/primeng/remote-autocomplete/remote-autocomplete.service';
import { remoteAutocompleteToken } from './record/editor/formly/primeng/remote-autocomplete/remote-autocomplete-factory.service';
import { DocumentsRemoteService } from './record/editor/formly/primeng/remote-autocomplete/remote/documents-remote.service';
import { ItemsRemoteService } from './record/editor/formly/primeng/remote-autocomplete/remote/items-remote.service';
import { MefRemoteService } from './record/editor/formly/primeng/remote-autocomplete/remote/mef-remote.service';
import { PatronsRemoteService } from './record/editor/formly/primeng/remote-autocomplete/remote/patrons-remote.service';
import { routes } from './app.routes';
import { AppConfigService } from './service/app-config.service';
import { AppInitializerService } from './service/app-initializer.service';
import { RecordHandleErrorService } from './service/record.handle-error.service';
import { CurrentLibraryPermissionValidator } from './utils/permissions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAppInitializer(() => {
      const appInitializerService = inject(AppInitializerService);
      return appInitializerService.load();
    }),
    {
      provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
    { provide: HTTP_INTERCEPTORS, useClass: NoCacheHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UserCurrentLibraryInterceptor, multi: true },
    { provide: TranslateService, useExisting: NgCoreTranslateService },
    { provide: RemoteAutocompleteService, useExisting: UiRemoteAutocompleteService },
    { provide: remoteAutocompleteToken, useExisting: DocumentsRemoteService, multi: true },
    { provide: remoteAutocompleteToken, useExisting: ItemsRemoteService, multi: true },
    { provide: remoteAutocompleteToken, useExisting: MefRemoteService, multi: true },
    { provide: remoteAutocompleteToken, useExisting: PatronsRemoteService, multi: true },
    { provide: CoreConfigService, useClass: AppConfigService },
    {
      provide: LOCALE_ID,
      useFactory: (translate: TranslateService) => translate.currentLang,
      deps: [TranslateService],
    },
    MainTitlePipe,
    TruncateTextPipe,
    DatePipe,
    CurrentLibraryPermissionValidator,
    ReceivedOrderPermissionValidator,
    // TODO: needed for production build, remove this after it is fixed in the @ngneat/hotkeys library
    ItemHoldingsCallNumberPipe,
    CountryCodeTranslatePipe,
    { provide: CoreRecordHandleErrorService, useClass: RecordHandleErrorService },
    provideHttpClient(withInterceptorsFromDi()),
    provideFormlyCore(withNgCoreFormly() as any),
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerNgCoreFormlyExtension,
      deps: [TranslateService],
    },
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerFormlyExtension,
      deps: [TranslateService],
    },
    ComponentCanDeactivateGuard,
    ConfirmationService,
    MessageService,
    DialogService,
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
    provideTranslateService({
      loader: provideTranslateLoader(CoreTranslateLoader),
    }),
    importProvidersFrom(
      FormlyModule.forChild({
        types: [
          { name: 'receipt-lines', component: ReceiptLinesTypeComponent },
          { name: 'order-line', component: OrderLineTypeComponent },
        ],
        wrappers: [
          { name: 'input-no-label', component: InputNoLabelWrapperComponent },
          { name: 'identifiedby-value', component: IdentifiedbyValueComponent },
          { name: 'user-id', component: UserIdComponent },
        ],
      }),
      LoadingBarHttpClientModule
    ),
  ],
};
