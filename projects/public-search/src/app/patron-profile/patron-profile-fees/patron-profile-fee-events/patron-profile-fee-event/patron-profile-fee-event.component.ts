/*
 * RERO ILS UI
 * Copyright (C) 2025 RERO
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
import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { DateTranslatePipe, RecordData } from '@rero/ng-core';
import { IOrganisation } from '@rero/shared';
import type { EsResult } from '@rero/ng-core';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { Subscription } from 'rxjs';
import { PatronTransactionEventApiService } from '../../../../api/patron-transaction-event-api.service';
import { PatronProfileMenuService } from '../../../patron-profile-menu.service';

@Component({
  selector: 'public-search-patron-profile-fee-event',
  templateUrl: './patron-profile-fee-event.component.html',
  standalone: true,
  imports: [CurrencyPipe, NgClass, TranslateDirective, TranslatePipe, DateTranslatePipe, TagModule, TimelineModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronProfileFeeEventComponent implements OnInit, OnDestroy {
    private patronTransactionEventApiService: PatronTransactionEventApiService = inject(PatronTransactionEventApiService);
    private patronProfileMenuService: PatronProfileMenuService = inject(PatronProfileMenuService);

    event = input<RecordData>();

    transactionEvents;

    private subscription = new Subscription();

    get organisation(): IOrganisation {
      return this.patronProfileMenuService.currentPatron.organisation;
    }

    ngOnInit(): void {
      this.subscription.add(
        this.patronTransactionEventApiService.getEvents((this.event()!.metadata as any).pid).subscribe((response: EsResult) =>
        this.transactionEvents = response.hits.hits
      ));
    }

    ngOnDestroy(): void {
      this.subscription.unsubscribe();
    }
}
