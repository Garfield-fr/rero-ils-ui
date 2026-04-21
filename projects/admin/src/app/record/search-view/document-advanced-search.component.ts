/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
 * Copyright (C) 2021-2023 UCLouvain
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
import { Component, DestroyRef, inject, output, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DocumentAdvancedSearchFormComponent } from './document-advanced-search-form/document-advanced-search-form.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Bind } from 'primeng/bind';
import { Button } from 'primeng/button';

@Component({
    selector: 'admin-document-advanced-search',
    template: `
    @if (!simple) {
      <p-button
        [label]="'Build advanced query' | translate"
        outlined
        icon="fa fa-search"
        iconPos="right"
        (onClick)="openModalBox()"
      />
    }
  `,
    imports: [Bind, Button, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentAdvancedSearchComponent {

  private dialogService: DialogService = inject(DialogService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private translateService: TranslateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  /** Simple search */
  simple = true;

  /** Query event */
  queryString = output<string>();

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: any) => {
      if (params.simple) {
        if (Array.isArray(params.simple)) {
          this.simple = params.simple.length > 0 ? ('1' === params.simple[0]) : true;
        } else {
          this.simple = ('1' === params.simple);
        }
      } else {
        this.simple = true;
      }
    });
  }

  /** Opening the advanced search dialog */
  openModalBox(): void {
    const ref: DynamicDialogRef = this.dialogService.open(DocumentAdvancedSearchFormComponent, {
      modal: true,
      width: "60vw",
      closable: true,
      header: this.translateService.instant('Build advanced query'),
    });
    ref.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryString?: string) => {
        if (queryString) {
          this.queryString.emit(queryString);
        }
      });
  }
}
