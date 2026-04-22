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
import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription, switchMap, tap } from 'rxjs';
import { PatronService } from '../../../service/patron.service';
import { RecordPermissionService } from '../../../service/record-permission.service';
import { ChangePasswordFormComponent } from '../change-password-form/change-password-form.component';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgClass, NgPlural, NgPluralCase, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { DateTranslatePipe, GetRecordPipe } from '@rero/ng-core';
import { JoinPipe } from '@rero/shared';

@Component({
    selector: 'admin-profile',
    templateUrl: './profile.component.html',
    imports: [TranslateDirective, NgClass, NgPlural, NgPluralCase, RouterLink, Bind, Button, AsyncPipe, DateTranslatePipe, GetRecordPipe, JoinPipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {

  private dialogService: DialogService = inject(DialogService);
  private patronService: PatronService = inject(PatronService);
  private recordPermission: RecordPermissionService = inject(RecordPermissionService);
  private translateService: TranslateService = inject(TranslateService);

  patron = signal<any>(undefined);
  private permissions = signal<any>(undefined);

  /** Observable subscription */
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.patronService.currentPatron$.pipe(
        tap((patron: any) => this.patron.set(patron)),
        switchMap((patron: any) => this.recordPermission.getPermission('patrons', patron.pid)),
        tap(permissions => this.permissions.set(permissions)),
      ).subscribe()
    );
  }

  /**
   * Check the update permission.
   *
   * @returns True if the logged user can edit the current patron.
   */
  canUpdate() {
    const p = this.permissions();
    return p && p.update && p.update.can === true;
  }

  /** Component destroy */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Open a modal dialog with the new password.
   *
   * @param patron - Patron the patron to update the password.
   */
  updatePatronPassword(patron) {
    this.dialogService.open(ChangePasswordFormComponent, {
      header: this.translateService.instant('Update Patron Password'),
      modal: true,
      focusOnShow: false,
      width: '30vw',
      data: {
        patron
      }
    });
  }
}
