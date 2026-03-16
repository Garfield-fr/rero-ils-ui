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
import { Component, inject, OnChanges, OnInit, input } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { IAvailability } from '../../interface/i-availability';
import { IAvailabilityService } from '../../service/i-availability.service';
import { NgClass } from '@angular/common';
import { DateTranslatePipe } from '@rero/ng-core';
import { GetTranslatedLabelPipe } from '../../pipe/get-translated-label.pipe';

@Component({
    selector: 'shared-availability',
    templateUrl: './availability.component.html',
    imports: [NgClass, DateTranslatePipe, TranslatePipe, GetTranslatedLabelPipe]
})
export class AvailabilityComponent implements OnInit, OnChanges {

  protected translateService: TranslateService = inject(TranslateService);

  /** Record Type */
  readonly recordType = input<string>(undefined);

  /** Record pid */
  readonly record = input<any>(undefined);

  /** Resource api service */
  readonly apiService = input<IAvailabilityService>(undefined);

  /** View code */
  readonly viewcode = input<string>(null);

  readonly class = input('ui:justify-top');

  /** Availability data */
  availability: IAvailability;

  /** Current language */
  language: string;

  /** OnInit hook */
  ngOnInit(): void {
    this.language = this.translateService.currentLang;
  }

  /** OnChanges hook */
  ngOnChanges(): void {
    this.apiService()
    .getAvailability(this.record().metadata.pid, this.viewcode())
    .subscribe((availability: IAvailability) => this.availability = availability);
  }
}
