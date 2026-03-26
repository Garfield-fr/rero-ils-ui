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
import { Component, inject, input, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { RecordService, UpperCaseFirstPipe } from '@rero/ng-core';

import { UserService } from '@rero/shared';
import { Observable, Subscription } from 'rxjs';
import { Library } from '../../../classes/library';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Bind } from 'primeng/bind';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { Ripple } from 'primeng/ripple';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { LocationComponent } from './location/location.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { DayOpeningHoursComponent } from './day-opening-hours/day-opening-hours.component';
import { ExceptionDateComponent } from './exception-date/exception-date.component';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { Tag } from 'primeng/tag';
import { CountryCodeTranslatePipe } from '../../../pipe/country-code-translate.pipe';
import { Badge } from 'primeng/badge';

@Component({
    selector: 'admin-library-detail-view',
    templateUrl: './library-detail-view.component.html',
    imports: [TranslateDirective, Bind, Accordion, AccordionPanel, Ripple, AccordionHeader, Button, RouterLink, AccordionContent, LocationComponent, NgClass, DayOpeningHoursComponent, ExceptionDateComponent, Divider, NgTemplateOutlet, Fieldset, Tag, UpperCaseFirstPipe, TranslatePipe, CountryCodeTranslatePipe, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryDetailViewComponent implements OnInit, OnDestroy {

  private recordService: RecordService = inject(RecordService);
  private userService: UserService = inject(UserService);

  // COMPONENT ATTRIBUTES =====================================================
  /** Observable resolving record data */
  readonly record$ = input.required<Observable<any>>();
  /** Resource type */
  readonly type = input<string>('');
  /** the library record as `Library` */
  record: Library = null;
  /** linked locations */
  locations = [];
  /** Is the current logged user can add locations */
  isUserCanAddLocation = false;

  /** Record subscription */
  private recordObs: Subscription;

  /** OnInit hook */
  ngOnInit() {
   this.recordObs = this.record$().subscribe((data: any) => {
      const libraryPid = data.metadata.pid;
      this.record = new Library(data.metadata);
      this.isUserCanAddLocation = this.userService.user.currentLibrary === libraryPid;
      // Load linked locations
      this.recordService
        .getRecords('locations', { query: `library.pid:${libraryPid}`, page: 1, itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE, sort: 'name' })
        .subscribe((record: any) => this.locations = record.hits.hits || []);
   });
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.recordObs.unsubscribe();
  }

  // COMPONENT FUNCTIONS ======================================================
  /**
   * Delete a location event listener
   * This function catch the event emitted when a location is deleted and removed the deleted location
   * from the known locations list
   * @param deletedLocationPid - The deleted location pid
   */
  deleteLocation(deletedLocationPid: Event): void {
    this.locations = this.locations.filter((location: any) => deletedLocationPid !== location.metadata.pid);
  }

}
