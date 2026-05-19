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
import { inject, Injectable, signal } from '@angular/core';
import {
  PatronTransaction,
  PatronTransactionEvent,
  PatronTransactionEventType,
  PatronTransactionStatus
} from '@app/admin/classes/patron-transaction';
import { RouteToolService } from '@app/admin/routes/route-tool.service';
import { TranslateService } from '@ngx-translate/core';
import type { EsResult } from '@rero/ng-core';
import { CONFIG, RecordService } from '@rero/ng-core';
import { AppStore } from '@rero/shared';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatronTransactionService {

  private recordService: RecordService = inject(RecordService);
  private appStore = inject(AppStore);
  private routeToolService: RouteToolService = inject(RouteToolService);
  private translateService: TranslateService = inject(TranslateService);
  private messageService: MessageService = inject(MessageService);

  private readonly _patronTransactions = signal<PatronTransaction[]>([]);

  /** Current loaded patron transactions */
  readonly patronTransactions = this._patronTransactions.asReadonly();

  /**
   * Allow to build the query to send through the API to retrieve desired data
   * @param patronPid - the patron pid
   * @param loanPid - the loan pid
   * @param type - the patron transaction main type
   * @param status - the patron transaction status
   * @returns string representing the query to used based on function arguments
   */
  private _buildQuery(patronPid?: string, loanPid?: string, type?: string, status?: string): string {
    const params: string[] = [];
    if (patronPid !== undefined) {
      params.push(`patron.pid:${patronPid}`);
    }
    if (loanPid !== undefined) {
      params.push(`loan.pid:${loanPid}`);
    }
    if (type !== undefined) {
      params.push(`type:${type}`);
    }
    if (status !== undefined) {
      params.push(`status:${status}`);
    }
    return params.join(' AND ');
  }

  /**
   * Load all patron-transactions corresponding to query parameter
   * @param query - The query used to retrieve `PatronTransaction`
   * @param sort - The field used to sort the `PatronTransaction`
   * @returns an observable of `PatronTransaction` corresponding to criteria
   */
  private _loadPatronTransactions(query: string, sort = '-creation_date'): Observable<PatronTransaction[]> {
    return this.recordService.getRecords(
      'patron_transactions',
      { query, page: 1, itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE, sort }
    ).pipe(
      map((data: EsResult) => data.hits as any),
      map((hits: any) => +this.recordService.totalHits(hits.total) === 0 ? [] : hits.hits),
      map((hits: any[]) => hits.map((hit: any) => new PatronTransaction(hit.metadata)))
    );
  }

  /**
   * Observable on PatronTransactions about a specific loan
   * @param loanPid - the loan pid
   * @param type - the patron transaction type to retrieve
   * @param status - the patron transactions status to retrieve
   * @returns an observable of `PatronTransaction` corresponding to criteria
   */
  patronTransactionsByLoan$(loanPid: string, type?: string, status?: string): Observable<PatronTransaction[]> {
    const query = this._buildQuery(undefined, loanPid, type, status);
    return this.recordService.getRecords('patron_transactions', { query, page: 1, itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE }).pipe(
      map((data: EsResult) => data.hits as any),
      map((hits: any) => +this.recordService.totalHits(hits.total) === 0 ? [] : hits.hits),
      map((hits: any[]) => hits.map((hit: any) => new PatronTransaction(hit.metadata)))
    );
  }

  /**
   * Search for `PatronTransactions` about a specific patron
   * @param patronPid - the patron pid
   * @param type - the patron transaction type to retrieve
   * @param status - the patron transactions status to retrieve
   * @returns an observable of `PatronTransaction` corresponding to criteria
   */
  patronTransactionsByPatron$(patronPid: string, type?: string, status?: string): Observable<PatronTransaction[]> {
    const query = this._buildQuery(patronPid, undefined, type, status);
    return this._loadPatronTransactions(query);
  }

  /**
   * Load patron transactions by patron and update the patronTransactions signal.
   * Returns the Observable so callers can chain further operators.
   * @param patronPid - the patron pid
   * @param type - the patron transaction type to retrieve
   * @param status - the patron transactions status to retrieve
   */
  loadPatronTransactionsByPatron(patronPid: string, type?: string, status?: string): Observable<PatronTransaction[]> {
    return this.patronTransactionsByPatron$(patronPid, type, status).pipe(
      tap(transactions => this._patronTransactions.set(transactions))
    );
  }

  /** Reset the patron transactions signal to an empty list. */
  clear(): void {
    this._patronTransactions.set([]);
  }

  /**
   * Fire-and-forget version of loadPatronTransactionsByPatron.
   * Updates the patronTransactions signal asynchronously.
   * @param patronPid - the patron pid
   * @param type - the patron transaction type to retrieve
   * @param status - the patron transactions status to retrieve
   */
  emitPatronTransactionByPatron(patronPid: string, type?: string, status?: string): void {
    this.loadPatronTransactionsByPatron(patronPid, type, status).subscribe();
  }

  /**
   * Load events linked to a patron transaction
   * @param transaction - the parent transaction
   */
  loadTransactionHistory(transaction: PatronTransaction): Observable<any> {
    const query = `parent.pid:${transaction.pid}`;
    return this.recordService.getRecords('patron_transaction_events', { query, page: 1, itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE }).pipe(
      map((data: EsResult) => data.hits as any),
      map((hits: any) => +this.recordService.totalHits(hits.total) === 0 ? [] : hits.hits),
      map((hits: any[]) => hits.map((hit: any) => new PatronTransactionEvent(hit.metadata)))
    );
  }

  /**
   * Compute the total due amount for a list of patron-transactions.
   * Only patron-transactions with a status === "open" are used to compute the total
   * @param transactions - the transactions to process
   * @returns total amount of open transactions
   */
  computeTotalTransactionsAmount(transactions: PatronTransaction[]): number {
    return transactions.reduce((accumulator, transaction) => {
      return (transaction.status === PatronTransactionStatus.OPEN)
        ? parseFloat((accumulator + transaction.total_amount).toFixed(2))
        : accumulator;
    }, 0);
  }


  // PatronTransaction API methods ================================================================

  /**
   * Create PatronTransactionEvent skeleton with data from current context
   * @param transaction - the parent patron transaction
   * @returns An object with `parent`, `operator` and `library` fields fill with current context
   */
  private _buildTransactionEventsSkeleton(transaction: PatronTransaction): any {
    return {
      parent: {
        $ref: this.routeToolService.apiService.getRefEndpoint('patron_transactions', transaction.pid)
      },
      operator: {
        $ref: this.routeToolService.apiService.getRefEndpoint('patrons', this.appStore.user().patronLibrarian.pid)
      },
      library: {
        $ref: this.routeToolService.apiService.getRefEndpoint('libraries', this.appStore.currentLibraryPid())
      }
    };
  }

  /**
   * Allow to register a payment about a patron transaction
   * @param transaction - the parent patron transaction
   * @param amount - the paid amount
   * @param paymentMethod - Method used to pay the patron transaction
   */
  payPatronTransaction(transaction: PatronTransaction, amount: number, paymentMethod: string): void {
    const record = this._buildTransactionEventsSkeleton(transaction);
    record.type = PatronTransactionEventType.PAYMENT;
    record.subtype = paymentMethod;
    record.amount = amount;
    this._createTransactionEvent(record, transaction.patron.pid);
  }

  /**
   * Allow to register a dispute about a patron transaction
   * @param transaction: PatronTransaction - the parent patron transaction
   * @param reason: The reason of the dispute
   */
  disputePatronTransaction(transaction: PatronTransaction, reason: string): void {
    const record = this._buildTransactionEventsSkeleton(transaction);
    record.type = PatronTransactionEventType.DISPUTE;
    record.note = reason;
    this._createTransactionEvent(record, transaction.patron.pid);
  }

  /**
   * Allow to register a 'cancel' about a patron transaction
   * @param transaction - the parent patron transaction
   * @param amount - the amount to cancel
   * @param reason - The reason why the transaction is canceled
   */
  cancelPatronTransaction(transaction: PatronTransaction, amount: number, reason: string): void {
    const record = this._buildTransactionEventsSkeleton(transaction);
    record.type = PatronTransactionEventType.CANCEL;
    record.amount = amount;
    record.note = reason;
    this._createTransactionEvent(record, transaction.patron.pid);
  }

  /**
   * Call API to create the PatronTransactionEvent
   * @param record - data to send through the API
   * @param affectedPatron - the user pid affected by this new transaction event
   */
  private _createTransactionEvent(record: any, affectedPatron: string): void {
    this.recordService.create('patron_transaction_events', record).subscribe({
      next: () => {
        this.emitPatronTransactionByPatron(affectedPatron, undefined, 'open');
        const translateType = this.translateService.instant(record.type);
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('Patron'),
          detail: this.translateService.instant('{{ type }} registered', { type: translateType }),
          life: CONFIG.MESSAGE_LIFE
        });
      },
      error: (error) => {
        const errorMessage = (Object.hasOwn(error, 'message') && Object.hasOwn(error.message(), 'message'))
          ? error.message.message
          : 'Server error :: ' + (error.title || error.toString());
        const message = '[' + error.status + ' - ' + error.statusText + '] ' + errorMessage;
        const translateType = this.translateService.instant(record.type);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('{{ type }} creation failed!', { type: translateType }),
          detail: message,
          sticky: true,
          closable: true
        });
      }
    });
  }
}
