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
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecordSearchPageComponent } from '@rero/ng-core';

@Component({
    selector: 'admin-import-record-search',
    templateUrl: './import-record-search.component.html',
    imports: [RecordSearchPageComponent]
})
export class ImportRecordSearchComponent implements OnInit {
  private _route = inject(ActivatedRoute);

  options: maxRecordSize[] = [
    { name: "10", size: 10 },
    { name: "20", size: 20 },
    { name: "50", size: 50 }
  ];

  maxRecordsSelected = signal(undefined);

  ngOnInit(): void {
    this.maxRecordsSelected.set(this.options.find(
      (option: maxRecordSize) => option.size === parseInt(this._route.snapshot.queryParams.size)
    ));
  }
}

export type maxRecordSize = {
  name: string;
  size: number;
}
