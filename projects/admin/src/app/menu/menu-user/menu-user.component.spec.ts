/*
 * RERO ILS UI
 * Copyright (C) 2024 RERO
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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { MenuUserComponent } from './menu-user.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '../service/menu.service';
import { MenuTranslateService } from '../service/menu-translate.service';
import { UserService } from '@rero/shared';
import { LibrarySwitchStorageService } from '../service/library-switch-storage.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { ISwitchLibrary, LibraryService } from '../service/library.service';
import { MENU_IDS } from '../menu-definition/menu-ids';
import { MenubarModule } from 'primeng/menubar';

describe('AppMenuUserComponent', () => {
  let component: MenuUserComponent;
  let fixture: ComponentFixture<MenuUserComponent>;
  let libraryService: LibraryService;
  let translateService: TranslateService;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  const menuItems: MenuItem[] = [
    {
      name: 'library',
      translateLabel: 'library',
      id: MENU_IDS.LIBRARY_MENU,
      items: [
        {
          name: 'library name',
          code: 'library-code',
          pid: '1' }
      ]
    },
    {
      name: 'menu',
      translateLabel: 'menu',
      id: MENU_IDS.USER.MENU,
      items: [
        {
          name: 'language',
          id: MENU_IDS.USER.LANGUAGE,
          items: [
            {
              label: 'french',
              code: 'fr',
              id: 'lang-fr'
            },
            {
              label: 'English',
              code: 'en',
              id: 'lang-en'
            },
          ] },
        {
          label: 'logout',
          id: MENU_IDS.USER.LOGOUT,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          command: () => {} },
      ] },
  ];

  const librarySwitch: ISwitchLibrary = {
    pid: '1',
    code: 'library-code',
    name: 'library name'
  };

  const libraryMenuSignal = signal({ menu: menuItems[0], libraryActive: librarySwitch });
  const menuServiceSpy = { libraryMenu: libraryMenuSignal, generateMenuLanguages: vi.fn(), updateLibraryQueryParams: vi.fn(), logout: vi.fn() };
  menuServiceSpy.generateMenuLanguages.mockImplementation(() => [
    {
      label: 'french',
      code: 'fr',
      id: 'lang-fr',
      styleClass: translateService?.currentLang === 'fr' ? 'ui:font-bold' : ''
    },
    {
      label: 'English',
      code: 'en',
      id: 'lang-en',
      styleClass: translateService?.currentLang === 'en' ? 'ui:font-bold' : ''
    },
  ]);

  const menuTranslateServiceSpy = { process: vi.fn() };
  menuTranslateServiceSpy.process.mockImplementation((items: MenuItem[]) => items);

  const userServiceSpy = { } as any;
  userServiceSpy.user = signal({
    id: 1,
    currentLibrary: 'foo'
  });

  const librarySwitchStorageServiceSpy = { save: vi.fn() };

  const routerSpy = { navigate: vi.fn() };

  beforeEach(async () => {
    menuServiceSpy.updateLibraryQueryParams.mockReset();
    routerSpy.navigate.mockReset();

    await TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        MenubarModule,
        MenuUserComponent,
    ],
    providers: [
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: MenuTranslateService, useValue: menuTranslateServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: LibrarySwitchStorageService, useValue: librarySwitchStorageServiceSpy },
        { provide: Router, useValue: routerSpy },
        LibraryService,
        TranslateService
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(MenuUserComponent);
    component = fixture.componentInstance;

    libraryService = TestBed.inject(LibraryService);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
    translateService.use('en');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the menu', () => {
    expect(fixture.debugElement.query(By.css('p-menubar'))).not.toBeNull();
  });

  it('should change the library menu', () => {
    expect(component.items().find((item: MenuItem) => item.id === MENU_IDS.LIBRARY_MENU)?.items?.[0].styleClass).toBeUndefined();
    libraryService.switch(librarySwitch);
    libraryMenuSignal.set({
      menu: {
        ...menuItems[0],
        label: librarySwitch.code,
        items: [{ ...menuItems[0].items[0], styleClass: 'ui:font-bold' }]
      },
      libraryActive: librarySwitch
    });
    fixture.detectChanges();
    expect(menuServiceSpy.updateLibraryQueryParams).toHaveBeenCalledWith(librarySwitch);
    expect(component.items().find((item: MenuItem) => item.id === MENU_IDS.LIBRARY_MENU)?.items?.[0].styleClass).toEqual('ui:font-bold');
  });

  it('should change the language menu', () => {
    expect(component.items()
      .find((item: MenuItem) => item.id === MENU_IDS.USER.MENU).items
      .find((item: MenuItem) => item.id === MENU_IDS.USER.LANGUAGE).items
      .find((item: MenuItem) => item.id === 'lang-en').styleClass)
      .toEqual('ui:font-bold');

    translateService.use('fr');
    fixture.detectChanges();
    expect(component.items()
      .find((item: MenuItem) => item.id === MENU_IDS.USER.MENU).items
      .find((item: MenuItem) => item.id === MENU_IDS.USER.LANGUAGE).items
      .find((item: MenuItem) => item.id === 'lang-fr').styleClass)
      .toEqual('ui:font-bold');
  });
});
