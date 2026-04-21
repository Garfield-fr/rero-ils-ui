/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
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

import { Component, inject, input, model, OnInit, output, ChangeDetectionStrategy} from '@angular/core';
import { LoanState } from '@app/admin/classes/loans';
import { RecordService, DateTranslatePipe } from '@rero/ng-core';
import { NgClass } from '@angular/common';
import { OpenCloseButtonComponent, ContributionComponent, InheritedCallNumberComponent, IdAttributePipe, MainTitlePipe } from '@rero/shared';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'admin-requested-item',
    templateUrl: './requested-item.component.html',
    imports: [NgClass, OpenCloseButtonComponent, RouterLink, ContributionComponent, InheritedCallNumberComponent, Bind, Button, TranslateDirective, DateTranslatePipe, IdAttributePipe, MainTitlePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestedItemComponent implements OnInit {

  private recordService: RecordService = inject(RecordService);

  // COMPONENT ATTRIBUTES ====================================================

  // Input/Output attributes
  /** requested item */
  item = input<any>();
  /** Is the detail should be collapsed */
  isCollapsed = model<boolean>();
  /** the callout css class to use for this item */
  callout = input<string>(null);
  /** Event emit when a request is validate */
  requestValidated = output();

  // Class attributes
  /** document related to the item */
  document;
  /** reference to LoanState class :: To use LoanState into template */
  LoanState = LoanState;

  /** OnInit hook */
  ngOnInit() {
    if (this.item()) {
      this.recordService.getRecord('documents', this.item().loan.document_pid, {
        resolve: 1,
        headers: { Accept: 'application/rero+json, application/json' }
      }).subscribe(document => this.document = document.metadata);
    }
  }

  // COMPONENT FUNCTIONS ====================================================
  /** Validate a request */
  validateRequest() {
    this.requestValidated.emit(this.item().barcode);
  }

  /** Get the callout css code if needed.
   *  The callout css is used to highlight a request for a particular reason (new request, validated request, ...)
   */
  getCallout() {
    return (this.callout() !== null)
      ? `callout ${this.callout()}`
      : null;
  }
}
