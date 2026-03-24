/*
 * RERO ILS UI
 * Copyright (C) 2020-2024 RERO
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

import { Component, inject, OnInit } from '@angular/core';
import { MenuService } from '../service/menu.service';
import { MenuItem } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { RouterLink } from '@angular/router';
import { TieredMenu } from 'primeng/tieredmenu';

@Component({
    selector: 'admin-menu-dashboard',
    templateUrl: './menu-dashboard.component.html',
    imports: [Bind, Card, Ripple, RouterLink, TieredMenu]
})
export class MenuDashboardComponent implements OnInit {

  private menuService: MenuService = inject(MenuService);

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.items = this.menuService.appMenuItems;
  }
}
