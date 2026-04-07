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
import { Component, inject, input, OnInit, output, ChangeDetectionStrategy} from '@angular/core';
import { HoldingsService } from '@app/admin/service/holdings.service';
import { RecordPermissionService } from '@app/admin/service/record-permission.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { EsRecord, UserService, GetTranslatedLabelPipe } from '@rero/shared';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { ItemRequestComponent } from '../../item-request/item-request.component';
import { RecordMaskedComponent } from '../../../record-masked/record-masked.component';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { HoldingDetailComponent } from '../holding-detail/holding-detail.component';
import { Nl2brPipe } from '@rero/ng-core';
import { GetTranslatedLabelPipe as GetTranslatedLabelPipe_1 } from '../../../../../../../../shared/src/lib/pipe/get-translated-label.pipe';

@Component({
    selector: 'admin-holding-header',
    templateUrl: './holding-header.component.html',
    imports: [RecordMaskedComponent, Bind, Button, RouterLink, Tooltip, HoldingDetailComponent, TranslatePipe, GetTranslatedLabelPipe, Nl2brPipe, GetTranslatedLabelPipe_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingHeaderComponent implements OnInit {
  private recordPermissionService: RecordPermissionService = inject(RecordPermissionService);
  private holdingService: HoldingsService = inject(HoldingsService);
  private userService: UserService = inject(UserService);
  private translateService: TranslateService = inject(TranslateService);
  private dialogService: DialogService = inject(DialogService);

  holding = input.required<EsRecord>();
  isCurrentOrganisation = input.required<boolean>();

  deleteHolding = output<EsRecord>();

  /** shortcut for holding type */
  holdingType: 'electronic' | 'serial' | 'standard';
  /** Holding permissions */
  permissions: any;

  get language(): string {
    return this.translateService.currentLang;
  }

  get cannotRequestInfoMessage(): string {
    return this.recordPermissionService.generateTooltipMessage(this.permissions.canRequest.reasons, 'request');
  }

  get deleteInfoMessage(): string {
    return this.recordPermissionService.generateTooltipMessage(
      this.permissions.delete.reasons,
      'delete'
    );
  }

  /** onInit hook */
  ngOnInit() {
    this.holdingType = this.holding().metadata.holdings_type;
    if (this.isCurrentOrganisation()) {
      this._getPermissions();
    }
  }

  addRequest(recordPid: string, recordType: string): void {
    const ref: DynamicDialogRef = this.dialogService.open(ItemRequestComponent, {
      header: this.translateService.instant('Holdings Request'),
      modal: true,
      width: '30vw',
      closable: true,
      data: { recordPid, recordType }
    });
    ref.onClose.subscribe((value?: boolean) => {
      if (value) {
        this._getPermissions();
      }
    });
  }

  delete() {
    this.deleteHolding.emit(this.holding());
  }

  private _getPermissions(): void {
    const permissionObs = this.recordPermissionService.getPermission('holdings', this.holding().metadata.pid);
    const canRequestObs = this.holdingService.canRequest(this.holding().metadata.pid);
    forkJoin([permissionObs, canRequestObs]).subscribe(
      ([permissions, canRequest]) => {
        this.permissions = this.recordPermissionService
          .membership(
            this.userService.user(),
            this.holding().metadata.library.pid,
            permissions
          );
        this.permissions.canRequest = canRequest;
    });
  }
}
