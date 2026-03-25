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

import { Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'admin-migration-search',
    templateUrl: './migration-search.component.html',
    styles: [`
    li.list-group-item {
      border-bottom-style: double;
      border-bottom-width: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrationSearchComponent {
  adminMode = input<any>();
  currentType = input<any>();
  types = input<any>();
  detailUrl = input<any>();
  showSearchInput = input<any>();
  q = input<any>();
  page = input<any>();
  size = input<any>();
  sort = input<any>();
  aggregationsFilters = input<any>();

  hits: any[] = [];
  aggregations: any[] = [];

  refresh(_refresh: boolean): void {}
}
