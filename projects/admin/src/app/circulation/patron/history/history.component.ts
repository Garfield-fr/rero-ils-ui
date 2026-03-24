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

import { Component, inject, ChangeDetectionStrategy} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RecordService } from '@rero/ng-core';
import { map, switchMap } from 'rxjs/operators';
import { OperationLogsApiService } from '@rero/shared';
import { PatronService } from '../../../service/patron.service';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { HistoryLogComponent } from './history-log/history-log.component';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'admin-history',
    templateUrl: './history.component.html',
    imports: [TranslateDirective, HistoryLogComponent, TranslatePipe, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {

  private patronService: PatronService = inject(PatronService);
  private operationLogsApiService: OperationLogsApiService = inject(OperationLogsApiService);

  /** History logs */
  historyLogs = toSignal(
    this.patronService.currentPatron$.pipe(
      switchMap((patron: any) => {
        return this.operationLogsApiService.getCheckInHistory(
          patron.pid,
          1,
          RecordService.MAX_REST_RESULTS_SIZE
        ).pipe(
          map((result: any) => {
            return result.hits.hits;
          })
        );
      })
    ),
    { initialValue: null }
  );
}
