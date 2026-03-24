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
import { Component, inject, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Item } from '@app/admin/classes/items';
import { PatronTransaction } from '@app/admin/classes/patron-transaction';
import { RecordService, DateTranslatePipe, GetRecordPipe, TruncateTextPipe } from '@rero/ng-core';
import { map, mergeMap } from 'rxjs/operators';
import { TranslateDirective } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MainTitlePipe } from '@rero/shared';
import { MainTitlePipe as MainTitlePipe_1 } from '../../../../../../../../shared/src/lib/pipe/main-title.pipe';

@Component({
    selector: 'admin-overdue-transaction-detail',
    templateUrl: './overdue-transaction-detail.component.html',
    imports: [TranslateDirective, RouterLink, AsyncPipe, DateTranslatePipe, GetRecordPipe, MainTitlePipe, TruncateTextPipe, MainTitlePipe_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverdueTransactionDetailComponent implements OnInit {

  private recordService: RecordService = inject(RecordService);

  /** Patron transaction */
  @Input() transaction: PatronTransaction;
  /** item linked to this transaction if transaction linked to a loan */
  item: Item;

  /** Load item information's if the transaction is linked to a loan */
  ngOnInit(): void {
    if (this.transaction && this.transaction.loan && this.transaction.loan.pid) {
      this.recordService.getRecord('loans', this.transaction.loan.pid, {}).pipe(
        map(data => data.metadata),
        mergeMap( data => this.recordService.getRecord('items', (data as any).item_pid.value, {})),
        map(data => new Item(data.metadata))
      ).subscribe((data) => this.item = data);
    }
  }
}
