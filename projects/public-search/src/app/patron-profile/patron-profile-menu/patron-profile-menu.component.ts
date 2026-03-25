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
import { Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IMenu, PatronProfileMenuService } from '../patron-profile-menu.service';

@Component({
    selector: 'public-search-patron-profile-menu',
    templateUrl: './patron-profile-menu.component.html',
    standalone: true,
    imports: [FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileMenuComponent {

  private patronProfileMenuService: PatronProfileMenuService = inject(PatronProfileMenuService);

  patronPid = input<string>();

  selectedOrganisation: IMenu;

  /**
   * Is menu visible
   * @return boolean
   */
  get isVisible(): boolean {
    return this.patronProfileMenuService.isMultiOrganisation;
  }

  /**
   * Get menu lines (organisation)
   * @return array
   */
  get organisations(): IMenu[] {
    const menuSelected = this.patronProfileMenuService.menu
      .find((menu: any) => menu.value === this.patronPid);
    if (menuSelected) {
      this.selectedOrganisation = menuSelected;
    }
    return this.patronProfileMenuService.menu;
  }

  /** on change */
  onChange(patronPid: string): void {
    this.patronProfileMenuService.change(patronPid);
  }
}
