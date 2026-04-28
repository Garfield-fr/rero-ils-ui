/*
 * RERO ILS UI
 * Copyright (C) 2021-2025 RERO
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
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AcqOrderApiService } from '@app/admin/acquisition/api/acq-order-api.service';
import { Timeline } from 'primeng/timeline';
import { filter, map, switchMap } from 'rxjs/operators';
import { AcqOrderHistoryVersion, IAcqOrder } from '../../../../classes/order';

@Component({
  selector: 'admin-order-history',
  templateUrl: './order-history.component.html',
  standalone: true,
  imports: [Timeline, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryComponent {
  private readonly acqOrderService = inject(AcqOrderApiService);

  readonly order = input.required<IAcqOrder>();

  readonly versions = toSignal(
    toObservable(this.order).pipe(
      filter(o => !!o?.pid),
      switchMap(o => this.acqOrderService.getOrderHistory(o.pid!)),
      map(versions => versions.filter(Boolean).map(v => new AcqOrderHistoryVersion(v)))
    ),
    { initialValue: [] }
  );
}
