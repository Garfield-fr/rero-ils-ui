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

import { MenuDisplayComponent } from './menu-display.component';
import { MenuItem } from 'primeng/api';
import { By } from '@angular/platform-browser';

describe('MenubarComponent', () => {
  let component: MenuDisplayComponent;
  let fixture: ComponentFixture<MenuDisplayComponent>;

  const menuItems: MenuItem[] = [
    {
      label: 'Menu 1',
      items: [
        {
          label: 'foo',
          url: 'bar'
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuDisplayComponent);
    fixture.componentRef.setInput('items', menuItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the menu', () => {
    expect(fixture.debugElement.query(By.css('p-menubar'))).not.toBeNull();
  });
});
