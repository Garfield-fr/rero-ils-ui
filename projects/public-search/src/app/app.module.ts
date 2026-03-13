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
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, inject, Injector, LOCALE_ID, NgModule, provideAppInitializer } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { TranslateLoader as BaseCoreTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreConfigService, NgCoreTranslateService, primeNGConfig, RecordSearchComponent, RecordSearchPageComponent, CoreTranslateLoader, TruncateTextPipe } from '@rero/ng-core';
import { MainTitlePipe, RemoteSearchComponent, SharedModule } from '@rero/shared';
// BucketNameService removed — no longer part of ng-core v21
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from "primeng/config";
import { DividerModule } from 'primeng/divider';
import { AppConfigService } from './app-config.service';
import { AppInitializerService } from './app-initializer.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CollectionBriefComponent } from './collection-brief/collection-brief.component';
import { DocumentBriefComponent } from './document-brief/document-brief.component';
import { DocumentRecordSearchComponent } from './document-record-search/document-record-search.component';
import { ErrorPageComponent } from './error/error-page.component';
import { CustomRequestInterceptor } from './interceptor/custom-request.interceptor';
import { MainComponent } from './main/main.component';


@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        ErrorPageComponent,
        DocumentRecordSearchComponent,
        DocumentBriefComponent,
        CollectionBriefComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        RecordSearchComponent,
        RecordSearchPageComponent,
        DividerModule,
        TranslateModule.forRoot({
            loader: {
                provide: BaseCoreTranslateLoader,
                useClass: CoreTranslateLoader,
                deps: [CoreConfigService, HttpClient]
            },
            isolate: false
        }),
        SharedModule,
        LoadingBarHttpClientModule,
        LoadingBarRouterModule
    ],
    providers: [
      provideAppInitializer(() => {
        const appInitializerService = inject(AppInitializerService);
        return appInitializerService.load();
      }),
      { provide: CoreConfigService, useClass: AppConfigService },
      { provide: TranslateService, useClass: NgCoreTranslateService },
      { provide: LOCALE_ID, useFactory: (translate: TranslateService) => translate.currentLang, deps: [TranslateService] },
      { provide: HTTP_INTERCEPTORS, useClass: CustomRequestInterceptor, multi: true },
      MainTitlePipe,
      TruncateTextPipe,
      ConfirmationService,
      MessageService,
      provideAnimationsAsync(),
      providePrimeNG(primeNGConfig),
      MainTitlePipe,
      TruncateTextPipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule implements DoBootstrap {

  private injector: Injector = inject(Injector);

  ngDoBootstrap(appRef: ApplicationRef): void {
    appRef.bootstrap(AppComponent);
    if (!customElements.get('main-search-bar')) {
      const searchBar = createCustomElement(RemoteSearchComponent, { injector: this.injector });
      customElements.define('main-search-bar', searchBar);
    }
  }
}
