/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ItemApiService } from '@app/admin/api/item-api.service';
import { IssueService } from '@app/admin/service/issue.service';
import { RecordService, DateTranslatePipe, GetRecordPipe, Nl2brPipe } from '@rero/ng-core';

import { IPermissions, IssueItemStatus, PERMISSION_OPERATOR, PERMISSIONS, UserService, InheritedCallNumberComponent, AvailabilityComponent, PermissionsDirective, ItemHoldingsCallNumberPipe, KeyExistsPipe, MainTitlePipe, SafeUrlPipe } from '@rero/shared';
import { DateTime } from 'luxon';
import { Observable, Subscription } from 'rxjs';
import { Item, ItemNote } from '../../../classes/items';
import { HoldingsService } from '../../../service/holdings.service';
import { OperationLogsService } from '@rero/shared';
import { OrganisationService } from '../../../service/organisation.service';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { RecordMaskedComponent } from '../record-masked/record-masked.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgClass, NgPlural, NgPluralCase, AsyncPipe, JsonPipe, CurrencyPipe } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { CirculationLogsDialogComponent } from '../../circulation-logs/circulation-logs-dialog.component';
import { ItemTransactionsComponent } from './item-transactions/item-transactions.component';
import { ItemFeesComponent } from './item-fees/item-fees.component';
import { LocalFieldComponent } from '../local-field/local-field.component';
import { ItemInCollectionPipe } from '../../../pipe/item-in-collection.pipe';
import { MainTitlePipe as MainTitlePipe_1 } from '../../../../../../shared/src/lib/pipe/main-title.pipe';
import { SafeUrlPipe as SafeUrlPipe_1 } from '../../../../../../shared/src/lib/pipe/safe-url.pipe';
import { ItemHoldingsCallNumberPipe as ItemHoldingsCallNumberPipe_1 } from '../../../../../../shared/src/lib/pipe/item-holdings-call-number.pipe';
import { KeyExistsPipe as KeyExistsPipe_1 } from '../../../../../../shared/src/lib/pipe/key-exists.pipe';
import { Badge } from 'primeng/badge';

@Component({
    selector: 'admin-item-detail-view',
    templateUrl: './item-detail-view.component.html',
    providers: [IssueService],
    styles: ['dl * { margin-bottom: 0; }'],
    imports: [Bind, Button, RouterLink, RecordMaskedComponent, TranslateDirective, InheritedCallNumberComponent, AvailabilityComponent, NgClass, Tooltip, Tabs, TabList, Ripple, Tab, NgPlural, NgPluralCase, TabPanels, TabPanel, CirculationLogsDialogComponent, ItemTransactionsComponent, ItemFeesComponent, PermissionsDirective, LocalFieldComponent, AsyncPipe, JsonPipe, CurrencyPipe, TranslatePipe, DateTranslatePipe, GetRecordPipe, ItemHoldingsCallNumberPipe, KeyExistsPipe, MainTitlePipe, Nl2brPipe, SafeUrlPipe, ItemInCollectionPipe, MainTitlePipe_1, SafeUrlPipe_1, ItemHoldingsCallNumberPipe_1, KeyExistsPipe_1, Badge]
})
export class ItemDetailViewComponent implements OnChanges, OnDestroy {

  public itemApiService: ItemApiService = inject(ItemApiService);
  private recordService: RecordService = inject(RecordService);
  private holdingService: HoldingsService = inject(HoldingsService);
  private operationLogsService: OperationLogsService= inject(OperationLogsService);
  private organisationService: OrganisationService = inject(OrganisationService);
  private userService: UserService = inject(UserService);

  /** Document record */
  @Input() record: any;
  /** Record permissions */
  @Input() recordPermissions: any;

  /** Permissions */
  permissions: IPermissions = PERMISSIONS;
  permissionOperator = PERMISSION_OPERATOR;

  /** Location record */
  location: any;
  /** Load operation logs on show */
  showOperationLogs = false;
  /** reference to ItemIssueStatus */
  issueItemStatus = IssueItemStatus;

  /** Record subscription */
  private subscription: Subscription = new Subscription();

  /**
   * Is operation log enabled
   * @return boolean
   */
  get isEnabledOperationLog(): boolean {
    return this.operationLogsService.isLogVisible('items');
  }

  get isDisplayLocalFieldsTab(): boolean {
    return this.userService.user.currentLibrary === this.record.metadata.library.pid;
  }

  /**
   * Get organisation currency
   * @return string
   */
  get organisationCurrency(): string {
    return this.organisationService.organisation.default_currency;
  }

  /** returns an array of claim dates in DESC order */
  get claimsDates(): string[] {
    return this.record.metadata.issue.claims.dates
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.record?.currentValue != null) {
      this.recordService.getRecord('locations', changes.record.currentValue.metadata.location.pid, { resolve: 1 }).subscribe(data => this.location = data);
    }
  }
  /** OnDestroy hook */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Is public note
   * @param note - ItemNote
   * @returns boolean
   */
  isPublicNote(note: ItemNote): boolean {
    return Item.PUBLIC_NOTE_TYPES.includes(note.type);
  }

  /**
   * has temporary item type
   * @return boolean
   */
  hasTemporaryItemType(): boolean {
    if ('temporary_item_type' in this.record.metadata) {
      const endDateValue = this.record.metadata.temporary_item_type.end_date || undefined;
      return !(endDateValue && DateTime.fromISO(endDateValue) < DateTime.now());
    }
    return false;
  }

  /** Update item status */
  updateItemStatus(): void {
    this.recordService.getRecord('items', this.record.metadata.pid, { resolve: 1 })
      .subscribe((item: any) => this.record = item);
  }

  /**
   * Make the method getIcon available here
   * @return string
   */
  getIcon(status: IssueItemStatus): string {
    return this.holdingService.getIcon(status);
  }
}
