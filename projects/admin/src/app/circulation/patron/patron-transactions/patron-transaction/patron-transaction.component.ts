/*
 * RERO ILS UI
 * Copyright (C) 2021-2025 RERO
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

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatronTransactionService } from '@app/admin/circulation/services/patron-transaction.service';
import { PatronTransaction, PatronTransactionEventType, PatronTransactionStatus } from '@app/admin/classes/patron-transaction';
import {
  PatronTransactionEventFormComponent
} from '../patron-transaction-event-form/patron-transaction-event-form.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { CurrencyPipe, NgClass, AsyncPipe } from '@angular/common';
import { SelectChangeEvent } from 'primeng/select';
import { AppStore, OpenCloseButtonComponent } from '@rero/shared';
import { FormsModule } from '@angular/forms';
import { OverdueTransactionDetailComponent } from './overdue-transaction-detail/overdue-transaction-detail.component';
import { DefaultTransactionDetailComponent } from './default-transaction-detail/default-transaction-detail.component';
import { PatronTransactionHistoryComponent } from './patron-transaction-history/patron-transaction-history.component';
import { DateTranslatePipe, GetRecordPipe } from '@rero/ng-core';
import { Select } from 'primeng/select';

@Component({
  selector: 'admin-patron-transaction',
  templateUrl: './patron-transaction.component.html',
  imports: [NgClass, OpenCloseButtonComponent, FormsModule, TranslateDirective, OverdueTransactionDetailComponent, DefaultTransactionDetailComponent, PatronTransactionHistoryComponent, AsyncPipe, CurrencyPipe, DateTranslatePipe, GetRecordPipe, TranslatePipe, Select],
  providers: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronTransactionComponent {

  private dialogService: DialogService = inject(DialogService);
  private appStore = inject(AppStore);
  private patronTransactionService: PatronTransactionService = inject(PatronTransactionService);
  private router: ActivatedRoute = inject(ActivatedRoute);
  private translateService: TranslateService = inject(TranslateService);
  private currencyPipe: CurrencyPipe = inject(CurrencyPipe);

  // COMPONENT ATTRIBUTES ============================================
  transaction = input<PatronTransaction>();
  isCollapsed = signal(true);
  patronTransactionStatus = PatronTransactionStatus;
  patronTransactionEventType = PatronTransactionEventType;
  menuSelectedAction = signal<MenuItem | undefined>(undefined);

  readonly menuItems = computed<MenuItem[]>(() => {
    const t = this.transaction();
    if (!t) return [];
    return [
      {
        label: [
          this.translateService.instant('Pay'),
          this.currencyPipe.transform(t.total_amount, this.appStore.organisation()?.default_currency)
        ].join(' '),
        command: () => this.patronTransactionAction('pay', 'full')
      },
      { label: this.translateService.instant('Pay a part'), command: () => this.patronTransactionAction('pay', 'part') },
      { label: this.translateService.instant('Dispute'), command: () => this.patronTransactionAction('dispute') },
      { label: this.translateService.instant('Delete'), command: () => this.patronTransactionAction('cancel') }
    ];
  });

  readonly transactionAmount = computed<number>(() => {
    const t = this.transaction();
    if (!t) return 0;
    if (t.status === PatronTransactionStatus.OPEN) {
      return t.total_amount;
    }
    let amount = 0;
    for (const event of t.get_events()) {
      if (event.type === PatronTransactionEventType.FEE) {
        amount += event.amount;
      }
    }
    return amount;
  });

  constructor() {
    effect(() => {
      const t = this.transaction();
      if (!t) return;
      if (this.router.snapshot.queryParams.event === t.pid) {
        this.isCollapsed.set(false);
      }
      this.patronTransactionService.loadTransactionHistory(t).subscribe(events => t.events = events);
    });
  }

  get organisation() {
    return this.appStore.organisation();
  }

  isDisputed(): boolean {
    const t = this.transaction();
    return (t?.status === PatronTransactionStatus.OPEN)
      ? t.events.some(e => e.type === PatronTransactionEventType.DISPUTE)
      : false;
  }

  patronTransactionEvent(event: SelectChangeEvent): void {
    event.value.command();
    this.menuSelectedAction.set(undefined);
  }

  patronTransactionAction(action: string, mode?: string): void {
    this.dialogService.open(PatronTransactionEventFormComponent, {
      header: this.translateService.instant(action),
      modal: true,
      focusOnShow: false,
      closable: true,
      width: '40vw',
      data: { action, mode, transactions: [this.transaction()] }
    });
  }

  eventLabel(event: any): string {
    return (event.subtype)
      ? `${this.translateService.instant(event.type.toString())} [${this.translateService.instant(event.subtype)}]`
      : this.translateService.instant(event.type.toString());
  }

  tagSeverity(event: any): string | undefined {
    switch (event.type) {
      case this.patronTransactionEventType.FEE: return 'danger';
      case this.patronTransactionEventType.PAYMENT: return 'success';
      case this.patronTransactionEventType.CANCEL: return 'info';
      default: return undefined;
    }
  }
}
