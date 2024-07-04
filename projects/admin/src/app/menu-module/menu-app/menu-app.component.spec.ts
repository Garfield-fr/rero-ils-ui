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

import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@rero/shared';
import { MenuItem } from 'primeng/api';
import { MENU_IDS } from '../definition/menu-ids';
import { LibrarySwitchStorageService } from '../service/library-switch-storage.service';
import { ISwitchLibrary, LibraryService } from '../service/library.service';
import { MenuTranslateService } from '../service/menu-translate.service';
import { MenuService } from '../service/menu.service';
import { MenuAppComponent } from './menu-app.component';

describe('MenuAppComponent', () => {
  let component: MenuAppComponent;
  let fixture: ComponentFixture<MenuAppComponent>;
  let libraryService: LibraryService;

  const menuItems: MenuItem[] = [
    {
      label: 'Menu 1',
      id: MENU_IDS.APP.ADMIN.MENU,
      items: [
        {
          label: 'Foo',
          id: MENU_IDS.APP.ADMIN.MY_LIBRARY,
          routerLink: ['/', 'records', 'libraries', 'detail', 'foo']
        }
      ]
    }
  ];

  const librarySwitch: ISwitchLibrary = {
    pid: '1',
    code: 'Foo',
    name: 'Bar'
  };

  const menuServiceSpy = jasmine.createSpyObj('MenuService', ['updateLibraryLink', 'generateAppMenu']);
  menuServiceSpy.generateAppMenu.and.returnValue(menuItems);

  const menuTranslateServiceSpy = jasmine.createSpyObj('MenuTranslateService', ['process']);
  menuTranslateServiceSpy.process.and.returnValue(menuItems);

  const userServiceSpy = jasmine.createSpyObj('UserService', ['']);
  userServiceSpy.user = {
    id: 1,
    currentLibrary: 'foo'
  };

  const librarySwitchStorageServiceSpy = jasmine.createSpyObj('LibrarySwitchStorageService', ['save']);

  const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MenuAppComponent
      ],
      providers: [
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: MenuTranslateService, useValue: menuTranslateServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: LibrarySwitchStorageService, useValue: librarySwitchStorageServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        LibraryService,
        TranslateService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    libraryService = TestBed.inject(LibraryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the menu', () => {
    expect(fixture.debugElement.query(By.css('p-menubar'))).not.toBeNull();
  });

  it('should change the menu id', () => {
    libraryService.switch(librarySwitch);
    expect(menuServiceSpy.updateLibraryLink).toHaveBeenCalled();
  });
});
