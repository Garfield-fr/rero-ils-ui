/*
 * RERO ILS UI
 * Copyright (C) 2021-2024 RERO
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
import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import { _, TranslateDirective } from "@ngx-translate/core";
import type { Error, EsResult } from '@rero/ng-core';
import { Paginator, ShowMorePagerComponent } from '@rero/shared';
import { PanelModule } from 'primeng/panel';
import { Observable, Subscription } from 'rxjs';
import { LoanApiService } from '../../api/loan-api.service';
import { PatronProfileMenuService } from '../patron-profile-menu.service';
import { ITabEvent, PatronProfileService } from '../patron-profile.service';
import { PatronProfileRequestComponent } from './patron-profile-request/patron-profile-request.component';

@Component({
    selector: 'public-search-patron-profile-requests',
    templateUrl: './patron-profile-requests.component.html',
    imports: [TranslateDirective, PanelModule, ShowMorePagerComponent, PatronProfileRequestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileRequestsComponent implements OnInit, OnDestroy {

  private loanApiService: LoanApiService = inject(LoanApiService);
  private patronProfileService: PatronProfileService = inject(PatronProfileService);
  private patronProfileMenuService: PatronProfileMenuService = inject(PatronProfileMenuService);

  /** First call of get record */
  readonly loaded = signal(false);

  /** requests records */
  readonly records = signal<any[]>([]);

  /** Records paginator */
  paginator: Paginator;

  /** Observable subscription */
  private subscription = new Subscription();

  /** OnInit hook */
  ngOnInit(): void {
    this.paginator = new Paginator();
    this.paginator
      .setHiddenInfo(
        _('({{ count }} hidden request)'),
        _('({{ count }} hidden requests)')
      );
    this.subscription.add(
      this.paginator.more$.subscribe((page: number) => {
        this._requestQuery(page).subscribe((response: EsResult) => {
          this.records.update(r => [...r, ...response.hits.hits]);
        });
      })
    );
    this.subscription.add(
      this.patronProfileService.tabsEvent$.subscribe((event: ITabEvent) => {
        if (event.name === 'request') {
          if (event.count === 0) {
            this.loaded.set(true);
          } else {
            this._requestQuery(1).subscribe((response: EsResult) => {
              this.paginator.setRecordsCount(response.hits.total.value);
              this.records.set(response.hits.hits);
              this.loaded.set(true);
            });
          }
        }
      })
    );
    this.subscription.add(
      this.patronProfileService.cancelRequestEvent$.subscribe((requestPid: string) => {
        this.records.update(r => r.filter(record => record.metadata.pid !== requestPid));
        this.paginator.setRecordsCount(this.records().length);
      })
    );
    /** Cleaning up after the change of organization */
    this.subscription.add(
      this.patronProfileMenuService.onChange$.subscribe(() => {
        this.paginator.setRecordsCount(0);
        this.records.set([]);
        this.loaded.set(false);
      })
    );
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Request query
   * @param page, number
   * @return Observable
   */
  private _requestQuery(page: number): Observable<EsResult | Error> {
    const patronPid = this.patronProfileMenuService.currentPatron.pid;
    return this.loanApiService
      .getRequest(patronPid, page, this.paginator.getRecordsPerPage());
  }
}
