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
import { Component, effect, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { SerialHoldingDetailViewComponent } from './serial-holding-detail-view/serial-holding-detail-view.component';

@Component({
    selector: 'admin-holding-detail-view',
    templateUrl: './holding-detail-view.component.html',
    imports: [SerialHoldingDetailViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingDetailViewComponent {

  private router: Router = inject(Router);

  readonly record$ = input.required<Observable<any>>();
  readonly type = input<string>('');

  readonly record = toSignal(
    toObservable(this.record$).pipe(switchMap(obs$ => obs$))
  );

  constructor() {
    effect(() => {
      const r = this.record();
      // TODO: At this time, only 'serial' holding should be displayed. Then redirect user to the document detail view
      if (r && r.metadata.holdings_type !== 'serial') {
        this.router.navigate(['/errors/403'], { skipLocationChange: true });
      }
    });
  }
}
