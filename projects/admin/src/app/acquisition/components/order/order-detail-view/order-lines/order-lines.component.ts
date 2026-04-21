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
import { Component, effect, inject, input, OnDestroy, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import { AppStore } from '@rero/shared';
import { Subscription } from 'rxjs';
import { AcqOrderApiService } from '../../../../api/acq-order-api.service';
import { AcqOrderStatus, IAcqOrder, IAcqOrderLine } from '../../../../classes/order';
import { OrderLineComponent } from '../order-line/order-line.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'admin-order-lines',
    templateUrl: './order-lines.component.html',
    imports: [OrderLineComponent, TranslateDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderLinesComponent implements OnInit, OnDestroy {

  private acqOrderApiService: AcqOrderApiService = inject(AcqOrderApiService);
  private appStore = inject(AppStore);

  // COMPONENTS ATTRIBUTES ====================================================
  /** Acquisition order pid */
  order = input.required<IAcqOrder>();
  /** Acquisition order lines to display */
  readonly orderLines = signal<IAcqOrderLine[] | undefined>(undefined);

  /** all component subscription */
  private subscriptions = new Subscription();

  constructor() {
    effect(() => { this.loadOrderLines(); });
  }

  /** OnInit hook */
  ngOnInit(): void {
    this.subscriptions.add(
      this.acqOrderApiService
        .deletedOrderLineSubject$
        .subscribe(
          (orderLine: IAcqOrderLine) => this.orderLines.update(lines => lines?.filter((line: IAcqOrderLine) => line.pid !== orderLine.pid))
        )
    );
  }

  canAdd(): boolean {
    // rollover
    if (!this.order().is_current_budget) {
      return false;
    }
    // owning library
    if (this.appStore.currentLibraryPid() !== this.order().library?.pid) {
      return false;
    }
    // order status
    return [AcqOrderStatus.PENDING, AcqOrderStatus.CANCELLED].some(status => status == this.order().status);
  }

  /** OnDestroy hook */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // PRIVATE COMPONENT METHODS ================================================
  /** load order lines related to this order */
  private loadOrderLines(): void {
    this.acqOrderApiService
      .getOrderLines(this.order().pid)
      .subscribe((lines: IAcqOrderLine[]) => this.orderLines.set(lines));
  }
}
