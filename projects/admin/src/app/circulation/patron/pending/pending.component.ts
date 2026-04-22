/*
 * RERO ILS UI
 * Copyright (C) 2020-2025 RERO
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

import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { PatronService } from '../../../service/patron.service';
import { CirculationStatsService } from '../service/circulation-stats.service';
import { TranslateDirective } from '@ngx-translate/core';
import { PendingItemComponent } from './pending-item/pending-item.component';
import { Card } from 'primeng/card';

@Component({
    selector: 'admin-pending',
    templateUrl: './pending.component.html',
    imports: [TranslateDirective, PendingItemComponent, Card],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingComponent implements OnInit {

  private patronService: PatronService = inject(PatronService);
  private circulationStatsService: CirculationStatsService = inject(CirculationStatsService);

  loans = signal<any[] | undefined>(undefined);
  private patron = signal<any>(undefined);

  ngOnInit() {
    this.patronService.currentPatron$.subscribe((patron: any) => {
      this.patron.set(patron);
      if (patron) {
        this.patronService.getItemsRequested(patron.pid)
        .subscribe(loans => {
          this.loans.set(loans);
        });
      }
    });
  }

  /**
   * Remove the canceled request on the loans list.
   * @param loanId, the canceled loan id
   */
  cancelRequest(loanId: any): void {
    this.loans.update(loans => (loans ?? []).filter((element: any) => element.id !== loanId));
    this.circulationStatsService.updateStats(this.patron().pid);
  }
}
