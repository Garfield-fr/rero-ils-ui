/*
 * RERO ILS UI
 * Copyright (C) 2021-2025 RERO
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
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { RecordService } from '@rero/ng-core';
import { SharedModule, testUserPatronWithSettings, UserApiService, UserService } from '@rero/shared';
import { cloneDeep } from 'lodash-es';
import { of } from 'rxjs';
import { PatronTransactionApiService } from '../../api/patron-transaction-api.service';
import { PatronProfileMenuService } from '../patron-profile-menu.service';
import { PatronProfileService } from '../patron-profile.service';
import { PatronApiService } from '../../api/patron-api.service';
import { PatronProfileFeesComponent } from './patron-profile-fees.component';
import { PatronProfileFeeComponent } from './patron-profile-fee/patron-profile-fee.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

@Component({ selector: 'public-search-patron-profile-fee', standalone: true, template: '' })
class StubPatronProfileFeeComponent {
  @Input() record: any;
}

describe('PatronProfileFeeComponent', () => {
  let component: PatronProfileFeesComponent;
  let fixture: ComponentFixture<PatronProfileFeesComponent>;
  let patronProfileService: PatronProfileService;
  let patronProfileMenuService: PatronProfileMenuService;
  let userService: UserService;

  const apiResponse = {
    aggregations: {},
    hits: {
      total: {
        relation: 'eq',
        value: 1
      },
      hits: [
        {
          metadata: {
            pid: '1'
          }
        }
      ]
    },
    links: {}
  };

  const patronTransactionApiServiceSpy = { getFees: vi.fn() };
  patronTransactionApiServiceSpy.getFees.mockReturnValue(of(apiResponse));

  const userApiServiceSpy = { getLoggedUser: vi.fn() };
  userApiServiceSpy.getLoggedUser.mockReturnValue(of(testUserPatronWithSettings));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        TranslateModule.forRoot(),
        SharedModule,

        PatronProfileFeesComponent
    ],
    providers: [
        { provide: UserApiService, useValue: userApiServiceSpy },
        { provide: PatronTransactionApiService, useValue: patronTransactionApiServiceSpy },
        { provide: PatronApiService, useValue: { getOverduePreviewByPatronPid: vi.fn().mockReturnValue(of([])) } },
        { provide: RecordService, useValue: { getRecord: vi.fn().mockReturnValue(of(null)), MAX_REST_RESULTS_SIZE: 1000 } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideNoopAnimations()
    ]
})
    .overrideComponent(PatronProfileFeesComponent, {
      remove: { imports: [PatronProfileFeeComponent] },
      add: { imports: [StubPatronProfileFeeComponent] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatronProfileFeesComponent);
    patronProfileService = TestBed.inject(PatronProfileService);
    component = fixture.componentInstance;
    component.feesTotal = 12.50;
    userApiServiceSpy.getLoggedUser.mockReturnValue(of(cloneDeep(testUserPatronWithSettings)));
    userService = TestBed.inject(UserService);
    userService.load().subscribe();
    patronProfileMenuService = TestBed.inject(PatronProfileMenuService);
    patronProfileMenuService.init();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the total amount', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('12.5');
  });
});
