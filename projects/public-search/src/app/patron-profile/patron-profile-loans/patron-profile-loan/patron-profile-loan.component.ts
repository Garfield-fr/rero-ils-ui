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
import { I18nPluralPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CONFIG, DateTranslatePipe } from '@rero/ng-core';
import { ArrayTranslatePipe, IOrganisation, JoinPipe, OpenCloseButtonComponent } from '@rero/shared';
import { DateTime } from 'luxon';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs/operators';
import { CanExtend, LoanApiService } from '../../../api/loan-api.service';
import { PatronProfileMenuService } from '../../patron-profile-menu.service';
import { PatronProfileService } from '../../patron-profile.service';
import { PatronProfileDocumentComponent } from '../../patron-profile-document/patron-profile-document.component';

@Component({
    selector: 'public-search-patron-profile-loan',
    templateUrl: './patron-profile-loan.component.html',
    standalone: true,
    imports: [
      NgClass,
      TranslateDirective,
      TranslatePipe,
      DateTranslatePipe,
      I18nPluralPipe,
      ArrayTranslatePipe,
      JoinPipe,
      OpenCloseButtonComponent,
      ButtonModule,
      TagModule,
      TooltipModule,
      PatronProfileDocumentComponent,
      NgTemplateOutlet,
    ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileLoanComponent implements OnInit {

  private loanApiService: LoanApiService = inject(LoanApiService);
  private translateService: TranslateService = inject(TranslateService);
  private patronProfileMenuService: PatronProfileMenuService = inject(PatronProfileMenuService);
  private patronProfileService: PatronProfileService = inject(PatronProfileService);

  private messageService: MessageService = inject(MessageService);

  // COMPONENT ATTRIBUTES =====================================================
  /** Loan record */
  record = input<any>();

  /** Document section is collapsed */
  isCollapsed = true;
  /** Renew action done */
  actionDone = false;
  /** Renew action success */
  actionSuccess = false;
  /** Request in progress */
  renewInProgress = false;
  /** Loan can extend */
  canExtend = {
    can: false,
    reasons: {}
  };
  /** Fees */
  fees = 0;

  // GETTER & SETTER ==========================================================
  /** Get organisation for current patron */
  get organisation(): IOrganisation {
    return this.patronProfileMenuService.currentPatron.organisation;
  }

  /** Get current viewcode */
  get viewcode(): string {
    return this.patronProfileMenuService.currentPatron.organisation.code;
  }
  /** Check if the loan should be returned in very few days */
  get isDueSoon(): boolean {
    const metadata = this.record()?.metadata;
    return (metadata?.is_late)
      ? false
      : DateTime.fromISO(metadata?.due_soon_date) <= DateTime.now();
  }

    /** Get the cannot extend reasons messages as an array for template pipes */
  get reasons(): string[] {
    return Object.values(this.canExtend?.reasons || {});
  }

  /** OnInit hook */
  ngOnInit(): void {
    this.loanApiService
      .canExtend(this.record()?.metadata?.pid)
      .subscribe((response: CanExtend) => this.canExtend = response);
  }

  // COMPONENTS FUNCTIONS =====================================================
  /** Renew the current loan */
  renew(): void {
    const patronPid = this.patronProfileMenuService.currentPatron.pid;
    this.renewInProgress = true;
    const metadata = this.record()?.metadata;
    this.loanApiService.renew({
      pid: metadata?.pid,
      item_pid: metadata?.item.pid,
      transaction_location_pid: metadata?.item.location.pid,
      transaction_user_pid: patronPid
    })
      .pipe(finalize(() => this.renewInProgress = false))
      .subscribe((extendLoan: any) => {
      this.actionDone = true;
      if (extendLoan !== undefined) {
        this.actionSuccess = true;
        const metadata = this.record()?.metadata;
        if (metadata) {
          ['end_date', 'extension_count', 'is_late', 'due_soon_date'].map(field => metadata[field] = extendLoan[field]);
          if ('overdue' in metadata) {
            delete metadata.overdue;
          }
        }
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('Success'),
          detail: this.translateService.instant('The item has been renewed.'),
          life: CONFIG.MESSAGE_LIFE
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('Error'),
          detail: this.translateService.instant('Error during the renewal of the item.'),
          closable: true
        });
      }
    });
  }
}
