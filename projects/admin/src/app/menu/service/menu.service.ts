/*
 * RERO ILS UI
 * Copyright (C) 2024-2025 RERO
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
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { CoreConfigService } from '@rero/ng-core';
import type { EsResult } from '@rero/ng-core';
import { PERMISSION_OPERATOR, PermissionsService, UserService } from '@rero/shared';
import { cloneDeep } from 'lodash-es';
import { MenuItem } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { LibraryApiService } from '../api/library-api.service';
import { MENU_IDS } from '../menu-definition/menu-ids';
import { LibrarySwitchStorageService } from './library-switch-storage.service';
import { ISwitchLibrary, LibraryService } from './library.service';

type LibraryRecord = {
  metadata: {
    pid: string;
    code: string;
    name: string;
  };
};

type LibraryMenuData = {
  menu: MenuItem;
  libraryActive: ISwitchLibrary;
};

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private userService: UserService = inject(UserService);
  private libraryApiService: LibraryApiService = inject(LibraryApiService);
  private libraryService: LibraryService = inject(LibraryService);
  private librarySwitchDataStorage: LibrarySwitchStorageService = inject(LibrarySwitchStorageService);
  private translateService: TranslateService = inject(TranslateService);
  private configService: CoreConfigService = inject(CoreConfigService);
  private httpClient: HttpClient = inject(HttpClient);
  private permissionsService: PermissionsService = inject(PermissionsService);

  private libraryKeys = ['library', 'owner_library', 'owning_library'];

  private readonly _logoutVersion = signal(0);
  private readonly _applicationMenuItems = signal<MenuItem[]>([]);

  readonly appMenuItems = this._applicationMenuItems.asReadonly();
  readonly logoutVersion = this._logoutVersion.asReadonly();
  readonly logout$ = toObservable(this.logoutVersion).pipe(
    filter((logoutVersion: number) => logoutVersion > 0),
    map(() => true)
  );

  private readonly libraries = toSignal(
    toObservable(this.userService.user).pipe(
      map((user) => user?.patronLibrarian?.libraries.map((library: { pid: string }) => library.pid) ?? []),
      switchMap((librariesPid: string[]) => {
        if (librariesPid.length === 0) {
          return of([] as LibraryRecord[]);
        }

        return this.libraryApiService.findByLibrariesPidAndOrderBy$(librariesPid).pipe(
          map((results: EsResult) => results.hits.total.value > 0
            ? results.hits.hits.map((library) => ({
              metadata: {
                pid: String(library.metadata['pid']),
                code: String(library.metadata['code']),
                name: String(library.metadata['name'])
              }
            }))
            : []
          )
        );
      })
    ),
    { initialValue: [] as LibraryRecord[] }
  );

  readonly libraryMenu = computed<LibraryMenuData | undefined>(() => {
    const libraries = this.libraries();
    if (libraries.length === 0) {
      return undefined;
    }

    const libraryActive = this.resolveActiveLibrary(libraries);
    if (!libraryActive) {
      return undefined;
    }

    return {
      menu: {
        label: libraryActive.code,
        icon: 'fa fa-random',
        id: MENU_IDS.LIBRARY_MENU,
        items: libraries
          .slice()
          .sort((a: LibraryRecord, b: LibraryRecord) => a.metadata.code.localeCompare(b.metadata.code))
          .map((library: LibraryRecord) => ({
            label: `[${library.metadata.code}] ${library.metadata.name}`,
            code: library.metadata.code,
            pid: library.metadata.pid,
            styleClass: library.metadata.pid === libraryActive.pid ? 'ui:font-bold' : '',
            command: () => this.libraryService.switch({
              pid: library.metadata.pid,
              code: library.metadata.code,
              name: library.metadata.name
            })
          }))
      },
      libraryActive
    };
  });

  private readonly libraryMenu$ = toObservable(this.libraryMenu);

  public generateMenuLanguages(): MenuItem[] {
    const languagesMenu: MenuItem[] = [];
    const currentLanguage = this.translateService.currentLang;
    this.configService.languages.forEach((language: string) => {
      languagesMenu.push({
        label: this.translateService.instant(`ui_language_${language}`),
        translateLabel: `ui_language_${language}`,
        id: `lang-${language}`,
        styleClass: currentLanguage === language ? 'ui:font-bold' : '',
        command: () => this.httpClient
          .post(`/language`, {lang: language})
          .subscribe(() => this.translateService.use(language))
      });
    });

    return languagesMenu.sort((a: MenuItem, b: MenuItem) => String(a.label).localeCompare(String(b.label)));
  }

  public generateMenuLibrary$(): Observable<LibraryMenuData | undefined> {
    return this.libraryMenu$;
  }

  public generateAppMenu(menuItems: MenuItem[]): MenuItem[] {
    const items = this.processMenuApp(cloneDeep(menuItems)).filter((item: MenuItem | undefined): item is MenuItem => !!item);
    this._applicationMenuItems.set(items);

    return items;
  }

  public updateLibraryLink(library: ISwitchLibrary): void {
    const menuItems = cloneDeep(this.appMenuItems());
    const item = menuItems
      .find((menuItem: MenuItem) => menuItem.id === MENU_IDS.APP.ADMIN.MENU)?.items
      ?.find((menuItem: MenuItem) => menuItem.id === MENU_IDS.APP.ADMIN.MY_LIBRARY);

    if (!item?.routerLink) {
      return;
    }

    const routerLink = [...item.routerLink];
    routerLink[4] = library.pid;
    item.routerLink = routerLink;
    this._applicationMenuItems.set(this.updateQueryParams(menuItems, library));
  }

  public updateLibraryQueryParams(library: ISwitchLibrary): void {
    this._applicationMenuItems.update((menuItems: MenuItem[]) => this.updateQueryParams(cloneDeep(menuItems), library));
  }

  public logout(): void {
    this._logoutVersion.update((logoutVersion: number) => logoutVersion + 1);
  }

  private processMenuApp(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.map((item: MenuItem) => {
      let canAccess = true;
      if (item.access) {
        canAccess = this.permissionsService.canAccess(
          item.access.permissions,
          item.access.operator || PERMISSION_OPERATOR.OR
        );
      }
      if (!canAccess) {
        return;
      }

      delete item['access'];

      if (!item.url && !item.routerLink && item.items) {
        item.items = this.processMenuApp(item.items).filter((item: any) => item);
      }

      return item;
    });
  }

  private resolveActiveLibrary(libraries: LibraryRecord[]): ISwitchLibrary | undefined {
    const selectedLibrary = this.libraryService.selectedLibrary();
    if (selectedLibrary) {
      return selectedLibrary;
    }

    const currentLibrary = this.userService.user()?.currentLibrary;
    let libraryActive = undefined;

    if (!this.librarySwitchDataStorage.has()) {
      libraryActive = libraries.find((library: LibraryRecord) => library.metadata.pid === currentLibrary);
    } else {
      const data = this.librarySwitchDataStorage.get();
      libraryActive = libraries.find((library: LibraryRecord) => library.metadata.pid === data.currentLibrary);
      if (!libraryActive) {
        libraryActive = libraries.find((library: LibraryRecord) => library.metadata.pid === currentLibrary);
      }
    }

    if (!libraryActive) {
      return undefined;
    }

    return {
      pid: libraryActive.metadata.pid,
      code: libraryActive.metadata.code,
      name: libraryActive.metadata.name
    };
  }

  private updateQueryParams(menuItems: MenuItem[], library: ISwitchLibrary): MenuItem[] {
    menuItems.forEach((item: MenuItem) => {
      if (item.queryParams) {
        item.queryParams = this.processQueryParams(item.queryParams as Record<string, unknown>, library);
      }
      if (item.items) {
        item.items = this.updateQueryParams(item.items, library);
      }
    });

    return menuItems;
  }

  private processQueryParams(queryParams: Record<string, unknown>, library: ISwitchLibrary): Record<string, unknown> {
    Object.keys(queryParams).forEach((key: string) => {
      if (this.libraryKeys.includes(key)) {
        queryParams[key] = library.pid;
      }
    });

    return queryParams;
  }
}
