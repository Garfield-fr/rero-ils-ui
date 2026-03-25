/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import { Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import { IPatronPermission, PermissionApiService } from 'projects/admin/src/app/api/permission-api.service';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Bind } from 'primeng/bind';
import { InputText } from 'primeng/inputtext';
import { PatronPermissionComponent } from './patron-permission/patron-permission.component';

@Component({
    selector: 'admin-patron-permissions',
    templateUrl: './patron-permissions.component.html',
    imports: [TranslateDirective, Bind, InputText, PatronPermissionComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronPermissionsComponent {

  private permissionApiService: PermissionApiService = inject(PermissionApiService);

  // COMPONENT ATTRIBUTES =====================================================
  /** Show or hide */
  hidden = input(false);
  /** Patron pid */
  pid = input<string>();

  /** User permissions */
  permissions: IPatronPermission[] = [];
  /** User permissions filtered */
  filteredPermissions: IPatronPermission[] = [];

  constructor() {
    effect(() => {
      if (!this.hidden() && this.permissions.length === 0) {
        this.permissionApiService
          .getUserPermissions(this.pid())
          .subscribe((permissions: IPatronPermission[]) => {
            this.permissions = permissions;
            this.filteredPermissions = permissions;
          });
      }
    });
  }

  // PUBLIC FUNCTIONS =========================================================
  /**
   * Filtering of the list according to the user's input in the input field.
   * @param value - value text
   */
  filterPermissions(value: string): void {
    this.filteredPermissions = this.permissions.filter((permission: IPatronPermission) => permission.name.includes(value));
  }
}
