/*
 * RERO ILS UI
 * Copyright (C) 2025 RERO
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

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RecordService } from '@rero/ng-core';
import { organisation, UserService } from '@rero/shared';
import { of } from 'rxjs';
import { OrganisationService } from './organisation.service';

describe('OrganisationService', () => {
  let service: OrganisationService;

  const mockUser = signal<any>({ currentOrganisation: '1' });
  const userServiceSpy = { user: mockUser };
  const recordServiceSpy = { getRecord: vi.fn() };
  recordServiceSpy.getRecord.mockReturnValue(of({ ...organisation }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganisationService,
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ]
    });
    service = TestBed.inject(OrganisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose organisation as a signal', () => {
    expect(service.organisation).toBeDefined();
  });

  it('should resolve organisation from user currentOrganisation', () => {
    TestBed.flushEffects();
    expect(recordServiceSpy.getRecord).toHaveBeenCalledWith('organisations', '1');
  });
});
