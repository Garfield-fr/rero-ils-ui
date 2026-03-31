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

import { inject, Injectable } from '@angular/core';
import { JsonObject, RecordData, RecordService } from '@rero/ng-core';
import { Organisation } from '@rero/shared/types/rero-shared';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  private recordService: RecordService = inject(RecordService);

  // SERVICE ATTRIBUTES =======================================================

  /** Observable on Record Organisation */
  private onOrganisationLoaded = new Subject<Organisation>();
  /** Organisation record */
  private record: Organisation;

  // GETTER & SETTER ==========================================================
  /** Return observable of organisation */
  get onOrganisationLoaded$(): Observable<Organisation> {
    return this.onOrganisationLoaded.asObservable();
  }
  /** Get current organisation*/
  get organisation() {
    return this.record;
  }

  /**
   * Load organisation record
   * @param pid - string
   */
  loadOrganisationByPid(pid: string) {
    this.recordService
      .getRecord<RecordData<Organisation>>('organisations', pid)
      .subscribe(orgRecord => {
        this.record = orgRecord.metadata;
        this.onOrganisationLoaded.next(this.record);
      });
  }
}
