/*
 * RERO ILS UI
 * Copyright (C) 2021-2024 RERO
 * Copyright (C) 2021 UCLouvain
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

import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { AcqOrderApiService } from '../../../api/acq-order-api.service';
import { AcqReceiptApiService } from '../../../api/acq-receipt-api.service';
import { AcqOrderLineStatus, AcqOrderStatus, IAcqOrder } from '../../../classes/order';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { NgTemplateOutlet, AsyncPipe, CurrencyPipe } from '@angular/common';
import { DateTranslatePipe, GetRecordPipe } from '@rero/ng-core';

@Component({
    selector: 'admin-order-summary',
    templateUrl: './order-summary.component.html',
    imports: [TranslateDirective, RouterLink, Bind, Tag, NgTemplateOutlet, AsyncPipe, CurrencyPipe, DateTranslatePipe, GetRecordPipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummaryComponent {

  private acqOrderApiService = inject(AcqOrderApiService);
  private acqReceiptApiService = inject(AcqReceiptApiService);

  // COMPONENTS ATTRIBUTES ====================================================
  order = input.required<IAcqOrder>();

  /** reference to AcqOrderStatus class */
  acqOrderStatus = AcqOrderStatus;

  constructor() {
    effect(() => {
      const orderLine = this.acqOrderApiService.lastDeletedOrderLine();
      if (orderLine && orderLine.status !== AcqOrderLineStatus.CANCELLED) {
        const o = untracked(() => this.order());
        o.account_statement.provisional.total_amount -= orderLine.total_amount;
        o.account_statement.provisional.quantity -= orderLine.quantity;
      }
    });

    effect(() => {
      const receipt = this.acqReceiptApiService.lastDeletedReceipt();
      if (receipt) {
        // TODO :: reduce the order expenditure amount.
        untracked(() => this.order()).account_statement.expenditure.quantity -= receipt.quantity ?? 0;
      }
    });
  }
}
