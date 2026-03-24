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

import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';

import { IPermissions, PERMISSIONS, PermissionsService, PermissionsDirective, LinkPermissionsDirective, JoinPipe } from '@rero/shared';
import { Observable, Subscription } from 'rxjs';
import { roleTagSeverity } from '../../../utils/roles';
import { Bind } from 'primeng/bind';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Ripple } from 'primeng/ripple';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgClass, AsyncPipe, I18nPluralPipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { PatronPermissionsComponent } from './patron-permissions/patron-permissions.component';
import { DateTranslatePipe, GetRecordPipe, Nl2brPipe } from '@rero/ng-core';
import { JoinPipe as JoinPipe_1 } from '../../../../../../shared/src/lib/pipe/join.pipe';
import { Message } from 'primeng/message';

type PatronPhone = {
  value: string;
  type?: string;
  weight: number;
}

@Component({
    selector: 'admin-patron-detail-view',
    templateUrl: './patron-detail-view.component.html',
    imports: [Bind, ButtonDirective, PermissionsDirective, RouterLink, Accordion, AccordionPanel, Ripple, AccordionHeader, AccordionContent, TranslateDirective, NgClass, Tag, LinkPermissionsDirective, PatronPermissionsComponent, AsyncPipe, I18nPluralPipe, TranslatePipe, DateTranslatePipe, GetRecordPipe, JoinPipe, Nl2brPipe, JoinPipe_1, Message]
})
export class PatronDetailViewComponent implements OnInit,  OnDestroy {

  private permissionsService: PermissionsService = inject(PermissionsService);

  // COMPONENT ATTRIBUTES =====================================================
  /** Data from patron we received */
  readonly record$ = input.required<Observable<any>>();
  /** the api response record */
  record: any;
  /** Current displayed/used patron */
  patron: any;
  /** Patron phones */
  phones: PatronPhone[] = [];
  /** record type */
  readonly type = input<string>('');
  /** Load operation logs on show */
  showOperationLogs = false;
  /** collapsed sections */
  sectionCollapsed = {
    user: false,
    librarian: true,
    patron: false,
    permissions: true,
    notes: false
  };

  /** Subscription to (un)follow the record$ Observable */
  private subscription$ = new Subscription();

  permissions: IPermissions = PERMISSIONS;

  get canAccessDisplayPermissions(): boolean {
    return this.permissionsService.canAccess(PERMISSIONS.PERM_MANAGEMENT);
  }

  /** OnInit hook */
  ngOnInit() {
    this.subscription$ = this.record$().subscribe((record) => {
      this.record = record;
      this.patron = record.metadata;
      this.phones = this.processPhones(record.metadata);
    });
  }

  /** OnDestroy hook */
  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  // COMPONENTS FUNCTIONS =====================================================

  /**
   * Get the color badge to apply for a specific role
   * @param role: the role to check.
   * @return the primeng badge class to use for this role.
   */
  getRoleTagSeverity(role: string): string {
    return roleTagSeverity(role);
  }

  /** Get the badge color to use for a note type
   *  @param noteType - the note type
   */
  getNoteBadgeColor(noteType: string): string {
    switch (noteType) {
      case 'public_note': return 'info';
      case 'staff_note': return 'warn';
      default: return 'secondary';
    }
  }

  private processPhones(record: any): PatronPhone[] {
    const data: PatronPhone[] = [];
    if (record.mobile_phone) {
      data.push({value: record.mobile_phone, type: 'Mobile', weight: 10});
    }
    if (record.home_phone) {
      data.push({value: record.home_phone, type: 'Home', weight: 7});
    }
    if (record.business_phone) {
      data.push({value: record.business_phone, type: 'Business', weight: 7});
    }
    if (record.other_phone) {
      data.push({value: record.other_phone, type: 'Other', weight: -1});
    }
    return data.sort((a, b) => b.weight - a.weight);
  }
}
