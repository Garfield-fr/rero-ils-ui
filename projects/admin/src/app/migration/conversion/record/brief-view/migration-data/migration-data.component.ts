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

import { Component, Input, ChangeDetectionStrategy} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { DateTranslatePipe } from '@rero/ng-core';
import { MainTitlePipe } from '@rero/shared';
import { MainTitlePipe as MainTitlePipe_1 } from '../../../../../../../../shared/src/lib/pipe/main-title.pipe';

@Component({
    selector: 'admin-migration-data',
    templateUrl: './migration-data.component.html',
    imports: [RouterLink, Bind, Tag, TranslateDirective, DateTranslatePipe, MainTitlePipe, TranslatePipe, MainTitlePipe_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrationDataBriefComponent {
  // current record
  @Input() record: any;

  // detail URL
  @Input() detailUrl: { link: string; external: boolean };

  /**
   * Get the conversion status.
   */
  get status() {
    return this.record?.metadata?.conversion?.status;
  }

}
