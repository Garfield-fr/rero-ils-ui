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
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CONFIG, RecordService } from '@rero/ng-core';
import { AppStore, PatronBlockedMessagePipe, User } from '@rero/shared';
import { MessageService } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, shareReplay, tap } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { HoldingsService } from '../../../../service/holdings.service';
import { ItemsService } from '../../../../service/items.service';
import { LoanService } from '../../../../service/loan.service';

@Component({
    selector: 'admin-item-request',
    templateUrl: './item-request.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Bind, Button, RouterLink, Card, FormsModule, ReactiveFormsModule, FormlyModule, TranslatePipe, PatronBlockedMessagePipe, Message],
})
export class ItemRequestComponent implements OnInit {

  private appStore = inject(AppStore);
  private recordService: RecordService = inject(RecordService);
  private httpClient: HttpClient = inject(HttpClient);
  private loanService: LoanService = inject(LoanService);
  private translateService: TranslateService = inject(TranslateService);
  private itemService: ItemsService = inject(ItemsService);
  private holdingService: HoldingsService = inject(HoldingsService);
  private messageService: MessageService = inject(MessageService);
  private dynamicDialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogRef: DynamicDialogRef = inject(DynamicDialogRef);

  /** Record pid */
  recordPid: any;
  /** Record type */
  recordType?: string;
  /** Service */
  service: any;
  /** form */
  form: UntypedFormGroup = new UntypedFormGroup({});
  /** form fields */
  formFields = signal<FormlyFieldConfig[] | undefined>(undefined);
  /** model */
  model = signal<FormModel | undefined>(undefined);
  /** patron record */
  patron = signal<any>(null);
  /** Dynamic message for can_request validator */
  canRequestMessage?: string;
  /** On submit event */
  onSubmit = new EventEmitter<any>();
  /** Requested item(s) */
  requestedBy = signal<any[] | null>(null);
  /** Request in progress */
  requestInProgress = signal(false);

  /** Pickup default $ref */
  private pickupDefaultValue?: string;
  /** Current user */
  private currentUser?: User | null;

  /** OnInit hook */
  ngOnInit() {
    this.currentUser = this.appStore.user();
    const { data } = this.dynamicDialogConfig;
    this.recordPid = data.recordPid;
    this.recordType = data.recordType;
    this.service = (this.recordType === 'item') ? this.itemService : this.holdingService;
    if (this.recordType === 'item') {
      this.loanService.requestedBy$(this.recordPid).subscribe(v => this.requestedBy.set(v));
    }
    this.initForm();
  }

  /**
   * Submit form
   * @param model - Object
   */
  submit(model: FormModel) {
    if (this.currentUser?.currentLibrary && this.currentUser.patronLibrarian.pid) {
      this.requestInProgress.set(true);
      const body: RequestBody = {
        pickup_location_pid: model.pickup,
        patron_pid: this.patron().pid,
        transaction_library_pid: this.currentUser.currentLibrary,
        transaction_user_pid: this.currentUser.patronLibrarian.pid,
        ...(this.recordType === 'item'
          ? { item_pid: this.recordPid }
          : { holding_pid: this.recordPid, description: model.description }
        )
      };
      this.httpClient.post(`/api/${this.recordType}/request`, body)
      .pipe(tap(() => this.requestInProgress.set(false)))
      .subscribe({
        next: () => {
          this.onSubmit.next(undefined);
          this.closeModal(true);
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('Item request'),
            detail: this.translateService.instant('Request registered.'),
            life: CONFIG.MESSAGE_LIFE
          });
        },
        error: () => this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('Item request'),
          detail: this.translateService.instant('An error has occurred. Please try again.'),
          sticky: true,
          closable: true
        })
      });
    }
  }

  /**
   * Close modal dialog
   * @param event - Event
   */
  closeModal(value?: boolean) {
    this.dynamicDialogRef.close(value);
  }

  /**
   * Init form
   */
  initForm() {
    if (this.currentUser) {
      this.getPickupLocations().subscribe(pickups => {
        this.formFields.set([
          {
            key: 'patronBarcode',
            type: 'input',
            focus: true,
            props: {
              label: this.translateService.instant('Patron barcode'),
              required: true,
              keydown: (_, event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }
            },
            asyncValidators: {
              userExist: {
                expression: (fc: AbstractControl) =>  {
                  return  this.getPatron(fc.value).pipe(
                    map((result: any) => {
                      this.patron.set((result.length === 1) ? result[0].metadata : null);
                      fc.markAsTouched();
                      return result.length === 1;
                    })
                  );
                },
                message: () => this.translateService.instant('Patron not found.')
              },
              can_request: {
                expression: (fc: AbstractControl) =>  {
                  return this.service.canRequest(this.recordPid, this.currentUser.currentLibrary, fc.value).pipe(
                    catchError((error) => of({ can: false, reasons: { error: error.message } })),
                    map((result: any) => {
                      if (!result.can) {
                        this.patron.set(null);
                        const reasons = result.reasons || { error: 'Not defined error' };
                        this.canRequestMessage = Object.values(reasons)[0] as string;
                      }
                      fc.markAsTouched();
                      return result.can;
                    })
                  )
                },
                message: () => this.translateService.instant(this.canRequestMessage)
              }
            }
          },
          {
            key: 'pickup',
            type: 'select',
            props: {
              appendTo: 'body',
              label: this.translateService.instant('Pickup location'),
              required: true,
              placeholder: this.translateService.instant('Select…'),
              options: pickups,
              filter: true
            }
          }
        ]);
        if (this.recordType === 'holding') {
          this.formFields.update(fields => [...(fields ?? []), {
            key: 'description',
            type: 'input',
            props: {
              label: this.translateService.instant('Collection or item year, volume, number, pages'),
              placeholder: this.translateService.instant('Year / Volume / Number / Pages'),
              maxLength: 100,
              required: true,
            }
          }]);
        }
        this.model.set({
          patronBarcode: null,
          pickup: this.pickupDefaultValue,
          description: null,
        });
      });
    }
  }


  /**
   * Get pickup location available for the item
   * @return observable with pickup locations information (name and pid)
   */
  private getPickupLocations(): Observable<any[]> {
    const { currentLibrary } = this.currentUser;
    return this.service.getPickupLocations(this.recordPid).pipe(
      map((locations: any) => locations.map((loc: any) => {
        const libraryPid = loc.library.$ref.split('/').pop();
        if (this.pickupDefaultValue === undefined && libraryPid === currentLibrary) {
          this.pickupDefaultValue = loc.pid;
        }
        return {
          label: loc.pickup_name || loc.name,
          value: loc.pid
        };
      }))
    );
  }

  /**
   * Get patron record by barcode
   * @param barcode - string
   * @return observable
   */
  private getPatron(barcode: string): Observable<any[] | Error> {
    const query = `barcode:${barcode}`;
    return this.recordService.getRecords('patrons', { query, page: 1, itemsPerPage: 1 }).pipe(
      debounceTime(500),
      map((result: any) => this.recordService.totalHits(result.hits.total) === 0 ? [] : result.hits.hits),
      shareReplay(1)
    );
  }
}

/**
 * Interface to define fields on form
 */
type FormModel = {
  patronBarcode: string;
  pickup: string;
  description?: string;
}

type RequestBody = {
  pickup_location_pid: string;
  patron_pid: string;
  transaction_library_pid: string;
  transaction_user_pid: string;
  item_pid?: string;
  holding_pid?: string;
  description?: string;
}
