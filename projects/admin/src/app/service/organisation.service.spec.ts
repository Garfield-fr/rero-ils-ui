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
import { AppStore, organisation } from '@rero/shared';
import { OrganisationService } from './organisation.service';

describe('OrganisationService', () => {
  let service: OrganisationService;

  const appStoreSpy = {
    organisation: signal<any>({ ...organisation }),
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganisationService,
        { provide: AppStore, useValue: appStoreSpy },
      ]
    });
    service = TestBed.inject(OrganisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose organisation signal from AppStore', () => {
    expect(service.organisation).toBe(appStoreSpy.organisation);
  });
});
