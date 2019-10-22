/*
 * RERO ILS UI
 * Copyright (C) 2019 RERO
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

import { TestBed } from '@angular/core/testing';

import { CirculationPolicyFormService } from './circulation-policy-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule, SharedModule } from '@rero/ng-core';

describe('CirculationPolicyFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      FormsModule,
      CoreModule,
      SharedModule,
      FormsModule,
      ReactiveFormsModule
    ]
  }));

  it('should be created', () => {
    const service: CirculationPolicyFormService = TestBed.get(CirculationPolicyFormService);
    expect(service).toBeTruthy();
  });
});