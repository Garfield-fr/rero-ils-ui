/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
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
import { Component, inject, input } from '@angular/core';

import { Observable } from 'rxjs';
import { OrganisationService } from '../../../service/organisation.service';

@Component({
    selector: 'admin-patron-types-detail-view',
    templateUrl: './patron-types-detail-view.component.html',
    standalone: false
})
export class PatronTypesDetailViewComponent {

  private organisationService: OrganisationService = inject(OrganisationService);
  /** Observable resolving record data */
  readonly record$ = input.required<Observable<any>>();

  /** Resource type */
  readonly type = input<string>('');

  /** Get current organisation
   *  @return: current organisation
   */
  get organisation() {
    return this.organisationService.organisation;
  }
}
