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
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { _, TranslateDirective } from "@ngx-translate/core";
import type { Error, EsResult } from '@rero/ng-core';
import { Paginator, ShowMorePagerComponent } from '@rero/shared';
import { PanelModule } from 'primeng/panel';
import { Select } from 'primeng/select';
import { Observable, Subscription } from 'rxjs';
import { LoanApiService } from '../../api/loan-api.service';
import { PatronProfileMenuService } from '../patron-profile-menu.service';
import { PatronProfileLoanComponent } from './patron-profile-loan/patron-profile-loan.component';

@Component({
    selector: 'public-search-patron-profile-loans',
    templateUrl: './patron-profile-loans.component.html',
    standalone: true,
    imports: [FormsModule, TranslateDirective, Select, PanelModule, ShowMorePagerComponent, PatronProfileLoanComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileLoansComponent implements OnInit, OnDestroy {

  private loanApiService: LoanApiService = inject(LoanApiService);
  private patronProfileMenuService: PatronProfileMenuService = inject(PatronProfileMenuService);

  /** Observable subscription */
  private _subscription = new Subscription();

  /** First get record */
  readonly loaded = signal(false);

  /** loans records */
  readonly records = signal<any[]>([]);

  /** sort criteria */
  sortCriteria = 'duedate';

  /** sort options */
  sortOptions = [
    { value: 'duedate', label: 'Due date (earliest)' },
    { value: '-duedate', label: 'Due date (latest)' }
  ];

  /** paginator page */
  page = 1;

  /** number of records per paginator page */
  nRecords = 20;

  /** Records paginator */
  paginator: Paginator;

  /** OnInit hook */
  ngOnInit(): void {
    this._initializePaginatorAndSubscription();
    this._initialLoad();
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /** Initialize paginator and subscription */
  private _initializePaginatorAndSubscription(): void {
    this.paginator = new Paginator();
    this.paginator
      .setRecordsPerPage(this.nRecords)
      .setHiddenInfo(
        _('({{ count }} hidden loan)'),
        _('({{ count }} hidden loans)')
      );

    this._subscription = new Subscription();
    this._subscription.add(
      this.paginator.more$.subscribe((page: number) => {
        this._loanQuery(page).subscribe((response: EsResult) => {
          this.records.update(r => [...r, ...response.hits.hits]);
          this.page = page;
        });
      })
    );
    this._subscription.add(
      this.patronProfileMenuService.onChange$.subscribe(() => {
        this._resetPaginator();
      })
    );
  }

  /** Initial records load */
  private _initialLoad(): void {
    this._loanQuery(1).subscribe((response: EsResult) => {
      this.paginator.setRecordsCount(response.hits.total.value);
      this.records.set(response.hits.hits);
      this.loaded.set(true);
    });
  }

  /**
   * Loan query
   * @param page - number
   * @return Observable
   */
  private _loanQuery(page: number): Observable<EsResult | Error> {
    const patronPid = this.patronProfileMenuService.currentPatron.pid;
    return this.loanApiService
      .getOnLoan(patronPid, page, this.paginator.getRecordsPerPage(), undefined, this.sortCriteria);
  }

  /** Reset paginator when patron profile menu has changed */
  private _resetPaginator(){
    this._loanQuery(1).subscribe((response: EsResult) => {
      this.paginator
        .setPage(1)
        .setRecordsCount(response.hits.total.value);

      this.records.set(response.hits.hits);
      this.page = 1;
      this.loaded.set(true);
    });
  }

   /**
    * Allow to sort loans list using a sort criteria
    * @param sortCriteria: the sort criteria to use for sorting the list
    */
  selectingSortCriteria(sortCriteria: string) {
    this.sortCriteria = sortCriteria;
    this.paginator.setRecordsPerPage(this.page * this.nRecords);

    this._loanQuery(1).subscribe((response: EsResult) => {
      this.records.set(response.hits.hits);
      this.paginator.setRecordsPerPage(this.nRecords);
      this.loaded.set(true);
    });
  }

}
