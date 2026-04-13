/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
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
import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganisationService } from '@app/admin/service/organisation.service';
import { ResourcesFilesService } from '@app/admin/service/resources-files.service';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { AutoComplete } from 'primeng/autocomplete';
import { Tooltip } from 'primeng/tooltip';
import { Chip } from 'primeng/chip';

@Component({
    selector: 'admin-files-collections',
    templateUrl: './files-collections.component.html',
    imports: [TranslateDirective, FormsModule, ReactiveFormsModule, Bind, AutoComplete, Tooltip, PrimeTemplate, Chip, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesCollectionsComponent {

  private messageService = inject(MessageService);
  private resourcesFilesService = inject(ResourcesFilesService);
  private translateService = inject(TranslateService);
  private organisationService = inject(OrganisationService);

  // current record
  record = signal<any>(null);

  // form control for the collection editor
  formGroup = new FormGroup({
    collections: new FormControl<string[] | null>(null)
  });

  constructor() {
    // Sync service record changes to local signal
    this.resourcesFilesService.currentParentRecord$.pipe(
      takeUntilDestroyed()
    ).subscribe(record => this.record.set(record));

    // Sync record signal changes to form without emitting valueChanges
    effect(() => {
      const rec = this.record();
      if (rec?.metadata?.collections) {
        this.formGroup.get('collections')!.setValue(rec.metadata.collections, { emitEvent: false });
      } else {
        this.formGroup.get('collections')!.setValue(null, { emitEvent: false });
      }
    });

    // Save on form value changes
    this.formGroup.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(() => this.save());
  }

  /**
   * Generate the public interface collection search link.
   *
   * @param name - the collection name
   * @returns - url on the public interface
   */
  getCollectionLink(name: string): string {
    const viewcode = this.organisationService.organisation().code;
    return `/${viewcode}/search/documents?q=files.collections.raw:(${name})&simple=0`;
  }

  getIndex(collection: string): number {
    const value = this.formGroup.get('collections')?.value?.indexOf(collection);
    if (value == null) {
      return -1;
    }
    return value;
  }

  /**
   * Save the form and put the new value on the backend.
   */
  save(): void {
    const rec = this.record();
    if (!rec) return;
    const coll = Array.from(new Set(this.formGroup.get('collections')!.value));
    const metadata = rec.metadata;
    if (coll) {
      metadata.collections = coll;
    } else {
      delete metadata.collections;
    }
    this.resourcesFilesService
      .updateParentRecordMetadata(rec.id, { metadata })
      .subscribe(updatedRecord => this.record.set(updatedRecord));
    this.formGroup.markAsPristine();
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('File'),
      detail: this.translateService.instant('Collections have been saved successfully.'),
      life: CONFIG.MESSAGE_LIFE
    });
  }
}
