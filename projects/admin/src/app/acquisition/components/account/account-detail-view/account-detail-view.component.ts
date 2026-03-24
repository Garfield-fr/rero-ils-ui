/*
 * RERO ILS UI
 * Copyright (C) 2021-2024 RERO
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

import { Component, inject, input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganisationService } from '../../../../service/organisation.service';
import { AcqAccountApiService } from '../../../api/acq-account-api.service';
import { IAcqAccount } from '../../../classes/account';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { NgClass, AsyncPipe, CurrencyPipe } from '@angular/common';
import { GetRecordPipe } from '@rero/ng-core';
import { NegativeAmountPipe } from '../../../pipes/negative-amount.pipe';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'admin-acquisition-account-detail-view',
    templateUrl: './account-detail-view.component.html',
    imports: [TranslateDirective, RouterLink, NgClass, AsyncPipe, CurrencyPipe, GetRecordPipe, TranslatePipe, NegativeAmountPipe, MessageModule, PanelModule]
})
export class AccountDetailViewComponent implements OnInit {

  private acqAccountApiService: AcqAccountApiService = inject(AcqAccountApiService);
  private organisationService: OrganisationService = inject(OrganisationService);

  // COMPONENT ATTRIBUTES =======================================================
  /** Observable resolving record data */
  readonly record$ = input.required<Observable<any>>();
  /** metadata from ES - much more complete than DB stored record */
  esRecord$: Observable<IAcqAccount>;
  /** Resource type */
  readonly type = input<string>('');

  // GETTER & SETTER ============================================================
  /** Get the current budget pid for the organisation */
  get organisation(): any {
    return this.organisationService.organisation;
  }

  /** OnInit hook */
  ngOnInit(): void {
    this.record$().subscribe((data: any) => {
      this.esRecord$ = this.acqAccountApiService.getAccount(data.metadata.pid);
    });
  }
}
