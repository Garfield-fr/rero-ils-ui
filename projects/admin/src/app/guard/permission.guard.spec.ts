/*
 * RERO ILS UI
 * Copyright (C) 2022-2024 RERO
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
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PERMISSION_OPERATOR, PERMISSIONS, PermissionsService } from '@rero/shared';
import { cloneDeep } from 'lodash-es';
import { filter, firstValueFrom } from 'rxjs';
import { ErrorPageComponent } from 'projects/admin/src/app/error/error-page/error-page.component';

import { PermissionGuard } from './permission.guard';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let permissionsService: PermissionsService;
  let router: Router;

  const routes = [
    {
      path: 'errors/403',
      component: ErrorPageComponent
    }
  ];

  const activatedRouteSnapshotSpy = { } as any;
  activatedRouteSnapshotSpy.data = { permissions: [ PERMISSIONS.DOC_SEARCH, PERMISSIONS.DOC_CREATE, PERMISSIONS.ILL_SEARCH ] };

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterModule.forRoot(routes),
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    guard = TestBed.inject(PermissionGuard);
    permissionsService = TestBed.inject(PermissionsService);
    router = TestBed.inject(Router);
  });

  async function waitForNavigation(): Promise<void> {
    await firstValueFrom(
      router.events.pipe(filter(e => e instanceof NavigationEnd))
    );
  }

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('Should allow access', async () => {
    permissionsService.setPermissions([ PERMISSIONS.DOC_SEARCH ]);
    const access = await firstValueFrom(guard.canActivate(activatedRouteSnapshotSpy));
    expect(access).toBe(true);
  });

  it('Should not allow access if missing permissions in route data', async () => {
    permissionsService.setPermissions([ PERMISSIONS.ILL_SEARCH ]);
    const routeSnapshot = cloneDeep(activatedRouteSnapshotSpy);
    routeSnapshot.data = {};
    const navPromise = waitForNavigation();
    await firstValueFrom(guard.canActivate(routeSnapshot));
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('Should not allow access', async () => {
    permissionsService.setPermissions([ PERMISSIONS.ITTY_SEARCH ]);
    const navPromise = waitForNavigation();
    await firstValueFrom(guard.canActivate(activatedRouteSnapshotSpy));
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('Should not allow access if the 2 permissions are not present (and operator)', async () => {
    permissionsService.setPermissions([ PERMISSIONS.DOC_CREATE, PERMISSIONS.HOLD_CREATE ]);
    const routeSnapshot = cloneDeep(activatedRouteSnapshotSpy);
    routeSnapshot.data['operator'] = PERMISSION_OPERATOR.AND;
    const navPromise = waitForNavigation();
    await firstValueFrom(guard.canActivate(routeSnapshot));
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('Should allow access if the 3 permissions are present (and operator)', async () => {
    permissionsService.setPermissions([ PERMISSIONS.DOC_SEARCH, PERMISSIONS.DOC_CREATE, PERMISSIONS.ILL_SEARCH ]);
    const routeSnapshot = cloneDeep(activatedRouteSnapshotSpy);
    routeSnapshot.data['operator'] = PERMISSION_OPERATOR.AND;
    const access = await firstValueFrom(guard.canActivate(routeSnapshot));
    expect(access).toBe(true);
  });
});
