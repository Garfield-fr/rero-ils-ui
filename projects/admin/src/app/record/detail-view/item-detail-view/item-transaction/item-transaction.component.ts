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
import { Component, inject, input, OnDestroy, OnInit, output, ChangeDetectionStrategy} from '@angular/core';
import { ItemsService } from '@app/admin/service/items.service';
import { LoanService } from '@app/admin/service/loan.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { UserService } from '@rero/shared';
import { SelectChangeEvent, Select } from 'primeng/select';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { Bind } from 'primeng/bind';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { AsyncPipe } from '@angular/common';
import { DateTranslatePipe, GetRecordPipe } from '@rero/ng-core';

@Component({
    selector: 'admin-item-transaction',
    templateUrl: './item-transaction.component.html',
    imports: [RouterLink, Bind, Select, FormsModule, Button, Tooltip, AsyncPipe, TranslatePipe, DateTranslatePipe, GetRecordPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemTransactionComponent implements OnInit, OnDestroy {

  private userService: UserService = inject(UserService);
  private translateService: TranslateService = inject(TranslateService);
  private itemService: ItemsService = inject(ItemsService);
  private loanService: LoanService = inject(LoanService);

  // COMPONENTS ATTRIBUTES ===============================================================
  /** Loan Record */
  transaction = input<any>();
  /** Resource type */
  type = input<string>();
  /** Flag for cell background */
  background = input<boolean>();
  /** Item pid */
  itemPid = input<string>();
  /** Informs parent component to remove request when it is cancelled */
  cancelRequestEvent = output<any>();
  /** Informs parent component to update pickup location */
  updatePickupLocationEvent = output<any>();

  /** Pickup locations of the organisation */
  pickupLocations: any;

  /** Pickup default $ref */
  private pickupDefaultValue: string;
  /** Current user */
  private currentUser: any;
  /** Pickup locations observable reference */
  private pickupLocations$: any;
  /** Authorized Transaction Type to load pickup locations */
  private authorizedTypeToLoadPickupLocations = [
    'loan_request'
  ];
  currentPickupLocation: {value: string, label: string};


  /** OnInit hook */
  ngOnInit() {
    this.currentUser = this.userService.user;
    if (this.authorizedTypeToLoadPickupLocations.includes(this.type())) {
      this.pickupLocations$ = this.getPickupLocations().subscribe((pickups) => {
        this.pickupLocations = pickups;
        this.currentPickupLocation = this.pickupLocations.find(loc => loc.value === this.transaction().metadata.pickup_location_pid);
      });
    }
  }

  /** OnDestroy hook */
  ngOnDestroy() {
    if (this.authorizedTypeToLoadPickupLocations.includes(this.type())) {
      this.pickupLocations$.unsubscribe();
    }
  }


  // COMPONENT FUNCTIONS ==================================================================
  /**
   * Check if request can be cancelled.
   * @returns true if it is possible to cancel a loan
   */
  canCancelRequest(): boolean {
    return this.loanService.canCancelRequest(this.transaction());
  }

  /**
   * Check if request pickup location can be changed.
   * @returns true if it is possible to update pickup location.
   */
  canUpdateRequestPickupLocation(): boolean {
    return this.loanService.canUpdateRequestPickupLocation(this.transaction());
  }

  /** Show a confirmation dialog box for cancel request. */
  showCancelRequestDialog(event: Event): void {
    this.loanService.cancelRequestDialog(event, () => {
      this.emitCancelRequest();
    });
  }

  /** Inform parent to cancel the request. */
  emitCancelRequest(): void {
    this.cancelRequestEvent.emit(this.transaction());
  }

  /** Inform parent to cancel the request. */
  emitUpdatePickupLocation(event:  SelectChangeEvent): void {
    const data = {
      pickupLocationPid: event.value.value,
      transaction: this.transaction()
    };
    this.updatePickupLocationEvent.emit(data);
  }

  /** Get pickups by organisation pid */
  private getPickupLocations(): Observable<{label: string, value: string}> {
    const { currentLibrary } = this.currentUser;
    return this.itemService.getPickupLocations(this.itemPid()).pipe(
        map(locations => locations.map((loc: any) => {
          if (this.pickupDefaultValue === undefined && loc.library.pid === currentLibrary) {
            this.pickupDefaultValue = loc.pid;
          }
          return {
            label: loc.pickup_name || loc.name,
            value: loc.pid
          };
        }))
    );
  }
}
