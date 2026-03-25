/*
 * RERO ILS UI
 * Copyright (C) 2019-2025 RERO
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
import { Component, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SharedModule, UserService } from '@rero/shared';
import { ItemApiService } from '../../api/item-api.service';
import { ItemRequestComponent } from './item-request.component';
import { PickupLocationComponent } from '../request/pickup-location/pickup-location.component';

@Component({
    selector: 'public-search-item',
    templateUrl: './item.component.html',
    imports: [TranslateDirective, SharedModule, TranslatePipe, ItemRequestComponent, PickupLocationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {

  private translateService = inject(TranslateService);
  public itemApiService = inject(ItemApiService);
  public userService = inject(UserService);

  /** Item record */
  item = input<any>();

  /** View code */
  viewcode = input<string>();

  /** context */
  context = input<string>();

  /** Temporary item type circulation */
  circulationInformation: string | undefined = undefined;

  /** Authorized types of note */
  noteAuthorizedTypes: string[] = [
    'binding_note',
    'condition_note',
    'general_note',
    'patrimonial_note',
    'provenance_note'
  ];

  showRequestDialog = false;

  constructor() {
    effect(() => {
      const item = this.item();
      if (item) {
        const { circulation_information } = item.metadata.item_type;
        if (circulation_information) {
          const information = circulation_information.find((obj: any) => obj.language === this.translateService.currentLang);
          if (information) {
            this.circulationInformation = information.label;
          }
        }
      }
    });
  }

  /** Current interface language */
  get language() {
    return this.translateService.currentLang;
  }
}
