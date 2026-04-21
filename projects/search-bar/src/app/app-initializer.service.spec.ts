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

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppStore, testUserPatronWithSettings, User } from '@rero/shared';
import { of } from 'rxjs';
import { AppInitializerService } from './app-initializer.service';

describe('AppInitializerService', () => {
  let appInitializerService: AppInitializerService;

  const appStoreSpy = {
    load: vi.fn().mockReturnValue(of(new User(testUserPatronWithSettings)))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        AppInitializerService,
        { provide: AppStore, useValue: appStoreSpy }
      ]
    });
    appInitializerService = TestBed.inject(AppInitializerService);
  });

  it('should be created', () => {
    expect(appInitializerService).toBeTruthy();
  });

  it('should return an instance of User', () => {
    appInitializerService.load().subscribe((loggedUser: User) => {
      expect(loggedUser).toBeInstanceOf(User);
      expect(loggedUser.id).toEqual(testUserPatronWithSettings.id);
    });
  });
});
