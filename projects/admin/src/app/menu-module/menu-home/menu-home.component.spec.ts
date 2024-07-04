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

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { MenuService } from '../service/menu.service';
import { MenuHomeComponent } from './menu-home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('MenuHomeComponent', () => {
  let component: MenuHomeComponent;
  let fixture: ComponentFixture<MenuHomeComponent>;

  const items: MenuItem[] = [
    {
      label: 'Menu 1',
      items: [
        {
          label: 'Foo',
          url: '/foo'
        }
      ]
    }
  ];

  const menuServiceSpy = jasmine.createSpyObj('MenuService', ['']);
  menuServiceSpy.appMenuItems = items;

  const ActivatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        MenuHomeComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: ActivatedRouteSpy },
        { provide: MenuService, useValue: menuServiceSpy },
        TranslateService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the menu', () => {
    expect(fixture.debugElement.query(By.css('p-tieredmenu'))).not.toBeNull();
  });
});
