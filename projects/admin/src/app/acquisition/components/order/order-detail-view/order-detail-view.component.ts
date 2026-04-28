/*
 * RERO ILS UI
 * Copyright (C) 2021-2025 RERO
 * Copyright (C) 2021 UCLouvain
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
import { I18nPluralPipe, NgClass, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AcqOrderApiService } from '@app/admin/acquisition/api/acq-order-api.service';
import { AcqReceiptApiService } from '@app/admin/acquisition/api/acq-receipt-api.service';
import { RecordPermissionService } from '@app/admin/service/record-permission.service';
import { CurrentLibraryPermissionValidator } from '@app/admin/utils/permissions';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { extractIdOnRef, Nl2brPipe } from '@rero/ng-core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { SharedModule } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { filter, map, switchMap } from 'rxjs/operators';
import { AcqOrderStatus, IAcqOrder } from '../../../classes/order';
import { NoteBadgeColorPipe } from '../../../pipes/note-badge-color.pipe';
import { NotesComponent } from '../../notes/notes.component';
import { ReceiptListComponent } from '../../receipt/receipt-list/receipt-list.component';
import { OrderEmailFormComponent } from '../order-email-form/order-email-form.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderLinesComponent } from './order-lines/order-lines.component';

@Component({
    selector: 'admin-acquisition-order-detail-view',
    templateUrl: './order-detail-view.component.html',
    imports: [NgClass, Bind, Button, OrderSummaryComponent, TranslateDirective, Tag, Tabs, TabList, Ripple, Tab, TabPanels, TabPanel, Accordion, AccordionPanel, AccordionHeader, RouterLink, AccordionContent, OrderLinesComponent, OrderHistoryComponent, NotesComponent, ReceiptListComponent, I18nPluralPipe, Nl2brPipe, TranslatePipe, NoteBadgeColorPipe, TooltipModule, Message, Badge, SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailViewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller: ViewportScroller = inject(ViewportScroller);
  private readonly recordPermissionService: RecordPermissionService = inject(RecordPermissionService);
  private readonly acqOrderService: AcqOrderApiService = inject(AcqOrderApiService);
  private readonly permissionValidator: CurrentLibraryPermissionValidator = inject(CurrentLibraryPermissionValidator);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly acqReceiptApiService: AcqReceiptApiService = inject(AcqReceiptApiService);
  private readonly dialogService: DialogService = inject(DialogService);

  // COMPONENT ATTRIBUTES =====================================================
  readonly record = input<any>();
  readonly type = input<string>('');

  order = signal<IAcqOrder | undefined>(undefined);
  notesCollapsed = true;
  acqOrderStatus = AcqOrderStatus;
  modalRef: DynamicDialogRef | null | undefined;

  readonly recordPermissions = toSignal(
    toObservable(this.order).pipe(
      filter((o): o is IAcqOrder => !!o?.pid),
      switchMap(o =>
        this.recordPermissionService.getPermission('acq_orders', o.pid!).pipe(
          map(p => this.permissionValidator.validate(p, o.library?.pid ?? ''))
        )
      )
    )
  );

  readonly tabActiveIndex = toSignal(
    this.route.queryParamMap.pipe(map(params => params.get('tab') || 'order')),
    { initialValue: 'order' }
  );

  // COMPUTED ==================================================================
  canPlaceOrder = computed(() => {
    const o = this.order();
    return o?.status === AcqOrderStatus.PENDING && o?.account_statement?.provisional?.total_amount > 0;
  });

  canAddLine = computed(() =>
    this.order()?.status === AcqOrderStatus.PENDING && this.recordPermissions()?.update?.can
  );

  disabledReceipts = computed(() =>
    [AcqOrderStatus.PENDING, AcqOrderStatus.CANCELLED].some((status) => status === this.order()?.status)
  );

  createInfoMessage = computed(() =>
    this.recordPermissionService.generateTooltipMessage(this.recordPermissions()?.create?.reasons, 'create')
  );

  constructor() {
    effect(() => {
      const r = this.record();
      if (r?.metadata?.pid) {
        this.order.set(r.metadata);
      }
    });

    effect((onCleanup) => {
      this.acqReceiptApiService.lastDeletedReceipt();
      this.acqReceiptApiService.lastDeletedReceiptLine();
      const pid = untracked(() => this.order()?.pid);
      if (!pid) return;
      const sub = this.acqOrderService.getOrder(pid, 1)
        .subscribe(order => this.order.set(order));
      onCleanup(() => sub.unsubscribe());
    });
  }

  // COMPONENT FUNCTIONS =======================================================

  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  scrollTo(e: Event, anchorId: string): void {
    e.preventDefault();
    this.scroller.scrollToAnchor(anchorId);
  }

  placeOrderDialog(): void {
    this.modalRef = this.dialogService.open(OrderEmailFormComponent, {
      header: this.translateService.instant('Place order'),
      modal: true,
      focusOnShow: false,
      width: '60vw',
      data: { order: this.order() },
    });
    this.modalRef.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((order?: IAcqOrder) => {
      if (order) {
        if (order.vendor.$ref) {
          order.vendor.pid = extractIdOnRef(order.vendor.$ref);
        }
        this.order.set(order);
      }
    });
  }
}
