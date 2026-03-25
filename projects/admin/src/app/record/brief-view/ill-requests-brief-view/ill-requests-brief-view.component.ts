/*
 * RERO ILS UI
 * Copyright (C) 2020-2024 RERO
 * Copyright (C) 2020-2023 UCLouvain
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
import { Component, inject, input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { getTagSeverityFromStatus } from '@app/admin/utils/utils';
import { RecordService, DateTranslatePipe } from '@rero/ng-core';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'admin-ill-requests-brief-view',
    templateUrl: './ill-requests-brief-view.component.html',
    imports: [RouterLink, Bind, Tag, TranslateDirective, TranslatePipe, DateTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllRequestsBriefViewComponent  implements OnInit {

  private recordService: RecordService = inject(RecordService);

  // COMPONENT ATTRIBUTES =======================================================
  /** Record */
  record = input<any>();
  /** Type of record */
  type = input<string>();
  /** Detail Url */
  detailUrl = input<{ link: string, external: boolean }>();

  /** the requester of the ILL request */
  requester = null;

  tagSeverity: string;

  /** Init hook */
  ngOnInit() {
    if (this.record()) {
      this.recordService.getRecord('patrons', this.record().metadata.patron.pid).subscribe(
        (patron) => this.requester = patron.metadata
      );
      this.tagSeverity = getTagSeverityFromStatus(this.record().metadata.status);
    }
  }
}
