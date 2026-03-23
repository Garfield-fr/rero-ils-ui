/*
 * RERO ILS UI
 * Copyright (C) 2021 RERO
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
import { Component, Input } from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Nl2brPipe, TruncateTextPipe } from '@rero/ng-core';
import { ArrayTranslatePipe, JoinPipe, JournalVolumePipe, NotesFilterPipe, OpenCloseButtonComponent } from '@rero/shared';
import { TagModule } from 'primeng/tag';
import { LoanStatusBadgePipe } from '../../../pipe/loan-status-badge.pipe';

@Component({
    selector: 'public-search-patron-profile-ill-request',
    templateUrl: './patron-profile-ill-request.component.html',
    standalone: true,
    imports: [
      TranslateDirective,
      TranslatePipe,
      Nl2brPipe,
      TruncateTextPipe,
      ArrayTranslatePipe,
      JoinPipe,
      JournalVolumePipe,
      NotesFilterPipe,
      OpenCloseButtonComponent,
      TagModule,
      LoanStatusBadgePipe,
    ]
})
export class PatronProfileIllRequestComponent {

  /** Ill record */
  @Input() record: any;

  /** Detail collapsed */
  isCollapsed = true;
}
