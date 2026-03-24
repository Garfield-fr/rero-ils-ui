/*
 * RERO ILS UI
 * Copyright (C) 2023-2024 RERO
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
import { HttpClient } from "@angular/common/http";
import { Component, inject, input, OnDestroy, OnInit, viewChild } from '@angular/core';
import { AppConfigService } from "@app/admin/service/app-config.service";
import { TranslateService, TranslateDirective, TranslatePipe } from "@ngx-translate/core";

import { Observable, Subscription } from 'rxjs';
import { NgClass, AsyncPipe } from "@angular/common";
import { Bind } from "primeng/bind";
import { Fieldset } from "primeng/fieldset";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { Ripple } from "primeng/ripple";
import { ReportsListComponent } from "./reports-list/reports-list.component";
import { ReportDataComponent } from "./report-data/report-data.component";
import { DateTranslatePipe, GetRecordPipe, Nl2brPipe } from "@rero/ng-core";
import { Message } from "primeng/message";

@Component({
    selector: "admin-statistics-cfg-view",
    templateUrl: "./statistics-cfg-detail-view.component.html",
    imports: [TranslateDirective, NgClass, Bind, Fieldset, Tabs, TabList, Ripple, Tab, TabPanels, TabPanel, ReportsListComponent, ReportDataComponent, AsyncPipe, TranslatePipe, DateTranslatePipe, GetRecordPipe, Nl2brPipe, Message]
})
export class StatisticsCfgDetailViewComponent implements OnInit, OnDestroy {

  private httpClient: HttpClient = inject(HttpClient);
  private appConfigService: AppConfigService = inject(AppConfigService);
  private translateService: TranslateService = inject(TranslateService);

  /** Observable resolving record data */
  readonly record$ = input.required<Observable<any>>();

  /** Resource type */
  readonly type = input<string>('');

  /** the api response record */
  record: any;

  // the current preview values
  liveData: any = null;

  // Error on data loading
  liveDataError: string = undefined;

  /** Subscription to (un)follow the record$ Observable */
  private subscriptions = new Subscription();

  /** OnInit hook */
  ngOnInit() {
    this.subscriptions = this.record$().subscribe((record) => {
      this.record = record;
    });
  }

  /** onDestroy hook */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** Preview values corresponding to the current configuration. */
  getLiveValues(): void {
    // only once
    if (this.liveData != null) {
      return;
    }
    this.liveDataError = undefined;
    const { pid } = this.record.metadata;
    const baseUrl = this.appConfigService.apiEndpointPrefix;
    this.httpClient
      .get(`${baseUrl}/stats_cfg/live/${pid}`)
      .subscribe({
        next: (res) => (this.liveData = res),
        error: () => this.liveDataError = this.translateService.instant('Data loading error')
      });
  }
}
