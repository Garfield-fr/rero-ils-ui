/*
 * RERO ILS UI
 * Copyright (C) 2021-2025 RERO
 * Copyright (C) 2021-2022 UCLouvain
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
import { PERMISSION_OPERATOR, PERMISSIONS } from '@rero/shared';
import { of } from 'rxjs';
import { PermissionGuard } from '../guard/permission.guard';
import { AccountListComponent } from './components/account/account-list/account-list.component';
import { AccountTransferComponent } from './components/account/account-transfer/account-transfer.component';
import { accountsRouteResolver } from './routes/accounts-route';
import { budgetsRouteResolver } from './routes/budgets-route';
import { orderLinesRouteResolver } from './routes/order-lines-route';
import { ordersRouteResolver } from './routes/orders-route';
import { receiptLinesRouteResolver } from './routes/receipt-lines-route';
import { receiptsRouteResolver } from './routes/receipts-route';
import { vendorsRouteResolver } from './routes/vendors-route';

export const acquisitionsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'accounts',
    pathMatch: 'full',
  },
  {
    path: 'accounts/transfer',
    component: AccountTransferComponent,
    title: _('Accounts'),
    canActivate: [PermissionGuard],
    data: {
      permissions: [PERMISSIONS.ACAC_TRANSFER],
    },
  },
  {
    path: 'accounts',
    component: AccountListComponent,
    title: _('Accounts'),
    canActivate: [PermissionGuard],
    data: {
      permissions: [PERMISSIONS.ACAC_ACCESS, PERMISSIONS.ACAC_SEARCH],
      operator: PERMISSION_OPERATOR.AND,
    },
  },
  {
    path: 'records/acq_accounts',
    loadChildren: () => import('./routes/accounts-route').then((m) => m.accountsRoutes),
    resolve: { types: accountsRouteResolver },
  },
  {
    path: 'records/budgets',
    loadChildren: () => import('./routes/budgets-route').then((m) => m.budgetsRoutes),
    resolve: { types: budgetsRouteResolver },
    data: { adminMode: () => of({ can: false, message: '' }) },
  },
  {
    path: 'records/acq_orders',
    loadChildren: () => import('./routes/orders-route').then((m) => m.ordersRoutes),
    resolve: { types: ordersRouteResolver },
  },
  {
    path: 'records/acq_order_lines',
    loadChildren: () => import('./routes/order-lines-route').then((m) => m.orderLinesRoutes),
    resolve: { types: orderLinesRouteResolver },
  },
  {
    path: 'records/acq_receipts',
    loadChildren: () => import('./routes/receipts-route').then((m) => m.receiptsRoutes),
    resolve: { types: receiptsRouteResolver },
  },
  {
    path: 'records/acq_receipt_lines',
    loadChildren: () => import('./routes/receipt-lines-route').then((m) => m.receiptLinesRoutes),
    resolve: { types: receiptLinesRouteResolver },
  },
  {
    path: 'records/vendors',
    loadChildren: () => import('./routes/vendors-route').then((m) => m.vendorsRoutes),
    resolve: { types: vendorsRouteResolver },
  },
];
