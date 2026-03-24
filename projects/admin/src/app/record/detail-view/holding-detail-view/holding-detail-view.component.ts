/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
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
import { Component, inject, input, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { SerialHoldingDetailViewComponent } from './serial-holding-detail-view/serial-holding-detail-view.component';

@Component({
    selector: 'admin-holding-detail-view',
    templateUrl: './holding-detail-view.component.html',
    imports: [SerialHoldingDetailViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingDetailViewComponent implements OnInit , OnDestroy {

  private router: Router = inject(Router);

  /** Observable resolving record data */
  readonly record$ = input.required<Observable<any>>();

  /** Resource type */
  readonly type = input<string>('');

  /** Record */
  record: any;

  /** The observer to the record observable */
  private recordObs: Subscription;

  /**
   * Init hook
   */
  ngOnInit() {
    this.recordObs = this.record$().subscribe(record => {
      this.record = record;
      // TODO : At this time, only 'serial' holding should be displayed. Then redirect user to the document detail view
      if (this.record.metadata.holdings_type !== 'serial') {
        this.router.navigate(['/errors/403'], { skipLocationChange: true });
      }
    });
  }

  /**
   * Destroy hook
   */
  ngOnDestroy(): void {
    this.recordObs.unsubscribe();
  }

}
