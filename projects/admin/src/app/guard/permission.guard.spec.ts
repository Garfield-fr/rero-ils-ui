/*
 * RERO ILS UI
 * Copyright (C) 2022-2025 RERO
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
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PERMISSION_OPERATOR, PERMISSIONS, PermissionsService } from '@rero/shared';
import { filter, firstValueFrom } from 'rxjs';
import { ErrorPageComponent } from 'projects/admin/src/app/error/error-page/error-page.component';
import { permissionGuard } from './permission.guard';

describe('permissionGuard', () => {
  let permissionsService: PermissionsService;
  let router: Router;

  const routes = [
    { path: 'errors/403', component: ErrorPageComponent }
  ];

  const routeSnapshot = {
    data: { permissions: [PERMISSIONS.DOC_SEARCH, PERMISSIONS.DOC_CREATE, PERMISSIONS.ILL_SEARCH] }
  } as any as ActivatedRouteSnapshot;

  const runGuard = (route: ActivatedRouteSnapshot): boolean =>
    TestBed.runInInjectionContext(() =>
      permissionGuard(route, {} as RouterStateSnapshot) as boolean
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes), TranslateModule.forRoot()],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    permissionsService = TestBed.inject(PermissionsService);
    router = TestBed.inject(Router);
  });

  async function waitForNavigation(): Promise<void> {
    await firstValueFrom(
      router.events.pipe(filter(e => e instanceof NavigationEnd))
    );
  }

  it('should allow access when one matching permission is present (OR)', () => {
    permissionsService.setPermissions([PERMISSIONS.DOC_SEARCH]);
    expect(runGuard(routeSnapshot)).toBe(true);
  });

  it('should deny access and redirect to 403 when no matching permission', async () => {
    permissionsService.setPermissions([PERMISSIONS.ITTY_SEARCH]);
    const navPromise = waitForNavigation();
    expect(runGuard(routeSnapshot)).toBe(false);
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('should deny access when route data has no permissions', async () => {
    permissionsService.setPermissions([PERMISSIONS.ILL_SEARCH]);
    const snapshot = structuredClone(routeSnapshot);
    snapshot.data = {};
    const navPromise = waitForNavigation();
    expect(runGuard(snapshot)).toBe(false);
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('should deny access when not all permissions are present (AND)', async () => {
    permissionsService.setPermissions([PERMISSIONS.DOC_CREATE, PERMISSIONS.HOLD_CREATE]);
    const snapshot = structuredClone(routeSnapshot);
    snapshot.data = { ...snapshot.data, operator: PERMISSION_OPERATOR.AND };
    const navPromise = waitForNavigation();
    expect(runGuard(snapshot)).toBe(false);
    await navPromise;
    expect(router.url).toBe('/errors/403');
  });

  it('should allow access when all permissions are present (AND)', () => {
    permissionsService.setPermissions([PERMISSIONS.DOC_SEARCH, PERMISSIONS.DOC_CREATE, PERMISSIONS.ILL_SEARCH]);
    const snapshot = structuredClone(routeSnapshot);
    snapshot.data = { ...snapshot.data, operator: PERMISSION_OPERATOR.AND };
    expect(runGuard(snapshot)).toBe(true);
  });
});
