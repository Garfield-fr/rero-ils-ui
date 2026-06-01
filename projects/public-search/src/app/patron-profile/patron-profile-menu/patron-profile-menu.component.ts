/*
 * RERO ILS UI
 * Copyright (C) 2021-2024 RERO
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
import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IMenu, PatronProfileMenuService } from '../patron-profile-menu.service';

@Component({
    selector: 'public-search-patron-profile-menu',
    templateUrl: './patron-profile-menu.component.html',
    imports: [FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileMenuComponent {

  private patronProfileMenuService = inject(PatronProfileMenuService);

  patronPid = input<string>();

  organisations = computed<IMenu[]>(() => this.patronProfileMenuService.menu);

  isVisible = computed(() => this.organisations().length > 1);

  selectedOrganisation = computed<IMenu | undefined>(() =>
    this.organisations().find(menu => menu.value === this.patronPid())
  );

  onChange(patronPid: string): void {
    this.patronProfileMenuService.change(patronPid);
  }
}
