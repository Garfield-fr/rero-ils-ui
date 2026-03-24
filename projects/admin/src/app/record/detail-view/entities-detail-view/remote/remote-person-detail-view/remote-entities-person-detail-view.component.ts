/*
 * RERO ILS UI
 * Copyright (C) 2019-2023 RERO
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

import { Component, Input, ChangeDetectionStrategy} from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Nl2brPipe } from '@rero/ng-core';
import { UrlActivePipe } from '@rero/shared';
import { UrlActivePipe as UrlActivePipe_1 } from '../../../../../../../../shared/src/lib/pipe/url-active.pipe';

@Component({
    selector: 'admin-remote-entities-person-detail-view',
    templateUrl: './remote-entities-person-detail-view.component.html',
    imports: [TranslateDirective, TranslatePipe, Nl2brPipe, UrlActivePipe, UrlActivePipe_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteEntitiesPersonDetailViewComponent {

  /** record metadata */
  @Input() record: any;

  /** record source */
  @Input() source: string;

  /** Disabled source link */
  disabledSourceLink = ['rero'];

  /**
   * Disabled link
   * @param source - string
   * @returns boolean
   */
  disabledLink(source: string) {
    return !this.disabledSourceLink.includes(source);
  }
}
