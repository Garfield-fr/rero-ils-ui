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

import { inject, Injectable, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RecordData, RecordService } from '@rero/ng-core';
import { UserService } from '@rero/shared';
import { Organisation } from '@rero/shared/types/rero-shared';
import { filter, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  private recordService: RecordService = inject(RecordService);
  private userService: UserService = inject(UserService);

  readonly organisation: Signal<Organisation | null> = toSignal(
    toObservable(this.userService.user).pipe(
      filter((user) => !!user?.currentOrganisation),
      switchMap((user) =>
        this.recordService
          .getRecord<RecordData<Organisation>>('organisations', user.currentOrganisation)
          .pipe(map((orgRecord) => orgRecord.metadata))
      )
    ),
    { initialValue: null }
  );
}
