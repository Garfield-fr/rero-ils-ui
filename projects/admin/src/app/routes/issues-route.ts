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
import { ResolveFn, Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { RecordData, RecordSearchPageComponent, RecordType, RouteDataTypesInterface } from '@rero/ng-core';
import { IssueItemStatus, PERMISSIONS } from '@rero/shared';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { permissionGuard } from '../guard/permission.guard';
import { IssuesBriefViewComponent } from '../record/brief-view/issues-brief-view/issues-brief-view.component';
import { BaseRoute } from './base-route';

export const issuesRouteResolver: ResolveFn<Partial<RecordType>[]> = () =>
  new IssuesRoute().getTypes();

export const issuesRoutes: Routes = [
  {
    path: '',
    component: RecordSearchPageComponent,
    title: _('Late issues'),
    canActivate: [permissionGuard],
    data: {
      permissions: [PERMISSIONS.ISSUE_MANAGEMENT],
    },
  },
];

class IssuesRoute extends BaseRoute implements RouteDataTypesInterface {
  /** Route name */
  readonly name = 'issues';

  /** Record type */
  readonly recordType = 'items';

  getTypes(): Partial<RecordType>[] {
    const types: Partial<RecordType>[] = [
      {
        key: this.name,
        label: 'Issues',
        index: 'items',
        component: IssuesBriefViewComponent,
        searchFilters: [this.expertSearchFilter()],
        permissions: (record: RecordData) => this.routeToolService.permissions(record, this.recordType),
        preFilters: {
          or_issue_status: [IssueItemStatus.LATE],
          organisation: null,
        },
        aggregationsBucketSize: 10,
        aggregationsOrder: ['library', 'location', 'item_type', 'vendor', 'claims_count', 'claims_date'],
        aggregationsExpand: ['library'],
        listHeaders: {
          Accept: 'application/rero+json, application/json',
        },
        exportFormats: [
          {
            label: 'CSV',
            format: 'csv',
            endpoint: this.routeToolService.apiService.getEndpointByType('item/inventory'),
            disableMaxRestResultsSize: true,
          },
        ],
        showFacetsIfNoResults: true,
      },
    ];
    // TODO: Refactor this after the change of AppInitializer service with user.
    toObservable(this.routeToolService.appStore.user, { injector: this.routeToolService.injector })
      .pipe(filter(u => !!u), take(1)).subscribe(() => {
        const { patronLibrarian } = this.routeToolService.appStore.user();
        if (patronLibrarian) {
          (types[0].preFilters as any).organisation = patronLibrarian.organisation.pid;
        }
      });
    return types;
  }
}
