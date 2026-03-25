/*
 * RERO ILS UI
 * Copyright (C) 2020-2024 RERO
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
import { Component, EventEmitter, inject, input, OnInit, output, ChangeDetectionStrategy} from '@angular/core';
import { RecordService, DateTranslatePipe, GetRecordPipe } from '@rero/ng-core';
import { forkJoin } from 'rxjs';
import { ItemsService } from '../../../../service/items.service';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Tag } from 'primeng/tag';
import { ContributionComponent, MainTitlePipe } from '@rero/shared';
import { CancelRequestButtonComponent } from '../../cancel-request-button.component';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MainTitlePipe as MainTitlePipe_1 } from '../../../../../../../shared/src/lib/pipe/main-title.pipe';

@Component({
    selector: 'admin-pickup-item',
    templateUrl: './pickup-item.component.html',
    imports: [RouterLink, Bind, Tag, ContributionComponent, CancelRequestButtonComponent, AsyncPipe, DateTranslatePipe, GetRecordPipe, MainTitlePipe, TranslatePipe, MainTitlePipe_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PickupItemComponent implements OnInit {

  private recordService: RecordService = inject(RecordService);
  private itemService: ItemsService = inject(ItemsService);

  // COMPONENT ATTRIBUTES =====================================================
  /** Loan */
  loan = input(undefined);
  /** Informs parent component to remove request when it is cancelled */
  cancelRequestEvent = output<any>();
  /** Item, document */
  item = undefined;
  document = undefined;

  /** OnInit hook */
  ngOnInit() {
    if (this.loan()) {
      const item$ = this.itemService.getItem(this.loan().metadata.item.barcode, this.loan().metadata.paton_pid);
      const doc$ = this.recordService.getRecord('documents', this.loan().metadata.item.document.pid, { resolve: 1, headers: { Accept: 'application/rero+json' } });
      forkJoin([item$, doc$]).subscribe(
        ([itemData, documentData]) => {
          this.item = itemData;
          this.document = documentData.metadata;
        }
      );
    }
  }

  /**
   * Emit a new cancel request
   * @param loanPid - The current loan pid
   */
  cancelRequest(loanPid: string): void {
    this.cancelRequestEvent.emit(loanPid);
  }
}
