import { enableProdMode, provideZonelessChangeDetection, provideAppInitializer, inject, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerFormlyExtension } from './app/acquisition/formly/extension';
import { OrderLineTypeComponent } from './app/acquisition/formly/type/field-order-line.type';
import { ReceiptLinesTypeComponent } from './app/acquisition/formly/type/receipt-lines.type';
import { InputNoLabelWrapperComponent } from './app/acquisition/formly/wrapper/input-no-label.wrapper';



import { environment } from './environments/environment';
import { AppInitializerService } from './app/service/app-initializer.service';
import { APP_BASE_HREF, PlatformLocation, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { NoCacheHeaderInterceptor } from './app/interceptor/no-cache-header.interceptor';
import { UserCurrentLibraryInterceptor } from './app/interceptor/user-current-library.interceptor';
import { TranslateService, TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { NgCoreTranslateService, RemoteAutocompleteService, CoreConfigService, TruncateTextPipe, RecordHandleErrorService as CoreRecordHandleErrorService, withNgCoreFormly, registerNgCoreFormlyExtension, ComponentCanDeactivateGuard, primeNGConfig, CallbackArrayFilterPipe, DetailButtonComponent, EditorComponent, ErrorComponent, ExportButtonComponent, FilesizePipe, ListFiltersComponent, MarkdownPipe, MenuSortComponent, ReadMoreComponent, RecordSearchAggregationComponent, RecordSearchComponent, RecordSearchPageComponent, SearchFiltersComponent, SearchInputComponent, SearchTabsComponent, UpperCaseFirstPipe, TranslateLanguagePipe, CoreTranslateLoader } from '@rero/ng-core';
import { RemoteAutocompleteService as UiRemoteAutocompleteService } from './app/record/editor/formly/primeng/remote-autocomplete/remote-autocomplete.service';
import { remoteAutocompleteToken } from './app/record/editor/formly/primeng/remote-autocomplete/remote-autocomplete-factory.service';
import { DocumentsRemoteService } from './app/record/editor/formly/primeng/remote-autocomplete/remote/documents-remote.service';
import { ItemsRemoteService } from './app/record/editor/formly/primeng/remote-autocomplete/remote/items-remote.service';
import { MefRemoteService } from './app/record/editor/formly/primeng/remote-autocomplete/remote/mef-remote.service';
import { PatronsRemoteService } from './app/record/editor/formly/primeng/remote-autocomplete/remote/patrons-remote.service';
import { AppConfigService } from './app/service/app-config.service';
import { MainTitlePipe, ItemHoldingsCallNumberPipe } from '@rero/shared';
import { CurrentLibraryPermissionValidator } from './app/utils/permissions';
import { ReceivedOrderPermissionValidator } from './app/acquisition/utils/permissions';
import { CountryCodeTranslatePipe } from './app/pipe/country-code-translate.pipe';
import { RecordHandleErrorService } from './app/service/record.handle-error.service';
import { provideFormlyCore, FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { HotkeysShortcutPipe } from '@ngneat/hotkeys';
import { CipoPatronTypeItemTypeComponent } from './app/record/formly/type/cipo-patron-type-item-type/cipo-patron-type-item-type.component';
import { RepeatTypeComponent } from './app/record/editor/type/repeat-section.type';
import { FormlyFieldSelect } from '@ngx-formly/primeng/select';
import { FieldCustomInputTypeComponent } from './app/record/editor/type/field-custom.type';
import { EntityAutocompleteComponent } from './app/record/editor/formly/primeng/entity-autocomplete/entity-autocomplete.component';
import { UserIdComponent } from './app/record/editor/wrappers/user-id.component';
import { IdentifiedbyValueComponent } from './app/record/editor/wrappers/identifiedby-value.component';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';


import { FileUploadModule } from 'primeng/fileupload';
import { MenubarModule } from 'primeng/menubar';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
    provideAppInitializer(() => {
        const appInitializerService = inject(AppInitializerService);
        return appInitializerService.load();
    }),
    {
        provide: APP_BASE_HREF,
        useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
        deps: [PlatformLocation],
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: NoCacheHeaderInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: UserCurrentLibraryInterceptor,
        multi: true,
    },
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
    // TODO: needed for production build, remove this after it is fixed in the
    // @ngneat/hotkeys library
    ItemHoldingsCallNumberPipe,
    CountryCodeTranslatePipe,
    { provide: CoreRecordHandleErrorService, useClass: RecordHandleErrorService },
    provideHttpClient(withInterceptorsFromDi()),
    provideFormlyCore(withNgCoreFormly()),
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
    provideZonelessChangeDetection(),
    importProvidersFrom(
      AppRoutingModule,
      FormlyModule.forChild({
        types: [
          { name: 'receipt-lines', component: ReceiptLinesTypeComponent },
          { name: 'order-line', component: OrderLineTypeComponent },
        ],
        wrappers: [
          { name: 'input-no-label', component: InputNoLabelWrapperComponent }
        ]
      }),
      TranslateModule.forRoot({
        loader: {
          provide: BaseTranslateLoader,
          useClass: CoreTranslateLoader,
          deps: [CoreConfigService, HttpClient],
        },
        isolate: false,
      }),
      LoadingBarHttpClientModule
    )
]
})
  .catch(err => console.error(err));
