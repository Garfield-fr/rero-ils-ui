/*
 * RERO ILS UI
 * Copyright (C) 2019-2025 RERO
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
import { Routes } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { PERMISSIONS } from '@rero/shared';
import { of } from 'rxjs';
import { ErrorPageComponent } from './error/error-page/error-page.component';
import { PermissionGuard } from './guard/permission.guard';
import { PermissionDetailViewComponent } from './record/detail-view/permission-detail-view/permission-detail-view.component';
import { circulationPoliciesRouteResolver } from './routes/circulation-policies-route';
import { collectionsRouteResolver } from './routes/collections-route';
import { documentsRouteResolver } from './routes/documents-route';
import { entitiesLocalRouteResolver } from './routes/entities-local-route';
import { entitiesRemoteRouteResolver } from './routes/entities-remote-route';
import { entitiesRouteResolver } from './routes/entities-route';
import { holdingsRouteResolver } from './routes/holdings-route';
import { illRequestsRouteResolver } from './routes/ill-requests-route';
import { importDocumentsRouteResolver } from './routes/import-documents-route';
import { issuesRouteResolver } from './routes/issues-route';
import { itemTypeRouteResolver } from './routes/item-types-route';
import { itemsRouteResolver } from './routes/items-route';
import { librariesRouteResolver } from './routes/libraries-route';
import { loansRouteResolver } from './routes/loans-route';
import { localFieldsRouteResolver } from './routes/local-fields-route';
import { locationsRouteResolver } from './routes/locations-route';
import { patronTransactionEventsRouteResolver } from './routes/patron-transaction-events-route';
import { patronTypesRouteResolver } from './routes/patron-types-route';
import { patronsRouteResolver } from './routes/patrons-route';
import { statisticsCfgRouteResolver } from './routes/statistics-cfg-route';
import { templatesRouteResolver } from './routes/templates-route';
import { FrontpageComponent } from './widgets/frontpage/frontpage.component';

export const routes: Routes = [
  {
    path: 'migrations',
    loadChildren: () => import('./migration/migration-routing.module').then((m) => m.MIGRATION_ROUTES),
  },
  {
    path: '',
    component: FrontpageComponent,
    title: _('Home'),
    children: [
      {
        path: 'records/item_types',
        loadChildren: () => import('./routes/item-types-route').then((m) => m.itemTypesRoutes),
        resolve: { types: itemTypeRouteResolver },
      },
      {
        path: 'records/patron_types',
        loadChildren: () => import('./routes/patron-types-route').then((m) => m.patronTypesRoutes),
        resolve: { types: patronTypesRouteResolver },
      },
      {
        path: 'records/circ_policies',
        loadChildren: () => import('./routes/circulation-policies-route').then((m) => m.circulationPoliciesRoutes),
        resolve: { types: circulationPoliciesRouteResolver },
      },
      {
        path: 'records/libraries',
        loadChildren: () => import('./routes/libraries-route').then((m) => m.librariesRoutes),
        resolve: { types: librariesRouteResolver },
      },
      {
        path: 'records/ill_requests',
        loadChildren: () => import('./routes/ill-requests-route').then((m) => m.illRequestsRoutes),
        resolve: { types: illRequestsRouteResolver },
        data: { linkPrefix: 'records' },
      },
      {
        path: 'records/stats_cfg',
        loadChildren: () => import('./routes/statistics-cfg-route').then((m) => m.statisticsCfgRoutes),
        resolve: { types: statisticsCfgRouteResolver },
      },
      {
        path: 'records/collections',
        loadChildren: () => import('./routes/collections-route').then((m) => m.collectionsRoutes),
        resolve: { types: collectionsRouteResolver },
      },
      {
        path: 'records/patrons',
        loadChildren: () => import('./routes/patrons-route').then((m) => m.patronsRoutes),
        resolve: { types: patronsRouteResolver },
      },
      {
        path: 'records/templates',
        loadChildren: () => import('./routes/templates-route').then((m) => m.templatesRoutes),
        resolve: { types: templatesRouteResolver },
      },
      {
        path: 'records/issues',
        loadChildren: () => import('./routes/issues-route').then((m) => m.issuesRoutes),
        resolve: { types: issuesRouteResolver },
        data: { adminMode: () => of({ can: false, message: '' }), detailUrl: '/records/items/detail/:pid' },
      },
      {
        path: 'records/loans',
        loadChildren: () => import('./routes/loans-route').then((m) => m.loansRoutes),
        resolve: { types: loansRouteResolver },
        data: {
          showSearchInput: false,
          adminMode: () => of({ can: false, message: '' }),
        },
      },
      {
        path: 'records/patron_transaction_events',
        loadChildren: () => import('./routes/patron-transaction-events-route').then((m) => m.patronTransactionEventsRoutes),
        resolve: { types: patronTransactionEventsRouteResolver },
        data: {
          showSearchInput: false,
          adminMode: () => of({ can: false, message: '' }),
        },
      },
      {
        path: 'records/entities',
        loadChildren: () => import('./routes/entities-route').then((m) => m.entitiesRoutes),
        resolve: { types: entitiesRouteResolver },
      },
      {
        path: 'records/holdings',
        loadChildren: () => import('./routes/holdings-route').then((m) => m.holdingsRoutes),
        resolve: { types: holdingsRouteResolver },
      },
      {
        path: 'records/locations',
        loadChildren: () => import('./routes/locations-route').then((m) => m.locationsRoutes),
        resolve: { types: locationsRouteResolver },
      },
      {
        path: 'records/local_entities',
        loadChildren: () => import('./routes/entities-local-route').then((m) => m.entitiesLocalRoutes),
        resolve: { types: entitiesLocalRouteResolver },
      },
      {
        path: 'records/remote_entities',
        loadChildren: () => import('./routes/entities-remote-route').then((m) => m.entitiesRemoteRoutes),
        resolve: { types: entitiesRemoteRouteResolver },
        data: { adminMode: () => of({ can: false, message: '' }) },
      },
      {
        path: 'records/local_fields',
        loadChildren: () => import('./routes/local-fields-route').then((m) => m.localFieldsRoutes),
        resolve: { types: localFieldsRouteResolver },
        data: { adminMode: () => of({ can: false, message: '' }) },
      },
      {
        path: 'records/documents',
        loadChildren: () => import('./routes/documents-route').then((m) => m.documentsRoutes),
        resolve: { types: documentsRouteResolver },
      },
      {
        path: 'records/items',
        loadChildren: () => import('./routes/items-route').then((m) => m.itemsRoutes),
        resolve: { types: itemsRouteResolver },
      },
      {
        // must be after all specific records/ routes — matches external import sources (e.g. records/bnf)
        path: 'records/:type',
        loadChildren: () => import('./routes/import-documents-route').then((m) => m.importDocumentsRoutes),
        resolve: { types: importDocumentsRouteResolver },
      },
      {
        path: 'circulation',
        loadChildren: () => import('./circulation/circulation-routing.module').then((m) => m.circulationRoutes),
      },
      {
        path: 'acquisition',
        loadChildren: () => import('./acquisition/acquisition-routing.module').then((m) => m.acquisitionsRoutes),
      },
      {
        path: 'permissions/matrix',
        component: PermissionDetailViewComponent,
        title: _('Permissions matrix'),
        canActivate: [PermissionGuard],
        data: {
          permissions: [PERMISSIONS.PERM_MANAGEMENT],
        },
      },
      {
        path: 'errors/:status_code',
        component: ErrorPageComponent,
        title: _('Error'),
      },
      {
        path: '**',
        component: ErrorPageComponent,
        title: _('Error'),
      },
    ]
  }
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   // for debug
//   //imports: [RouterModule.forRoot(routes, { enableTracing: true })],
//   exports: [RouterModule],
// })
// export class AppRoutingModule {}
