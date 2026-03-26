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
import { Component, input, OnInit, ViewChild, inject, ChangeDetectionStrategy} from '@angular/core';
import { ResourcesFilesService } from '@app/admin/service/resources-files.service';
import { TranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { CONFIG, FilesizePipe, DateTranslatePipe } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { catchError, concatMap, from, map, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { FilesCollectionsComponent } from '../files-collections.component';
import { Bind } from 'primeng/bind';
import { InputGroup } from 'primeng/inputgroup';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { Message } from 'primeng/message';

@Component({
    selector: 'admin-upload-files',
    templateUrl: './upload-files.component.html',
    imports: [FilesCollectionsComponent, TranslateDirective, Bind, FileUpload, InputGroup, FormsModule, InputText, InputGroupAddon, Tooltip, Button, FilesizePipe, TranslatePipe, DateTranslatePipe, NgxSpinnerComponent, Message],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFilesComponent implements OnInit {

  private messageService: MessageService = inject(MessageService);
  fileService: ResourcesFilesService = inject(ResourcesFilesService);
  translateService: TranslateService = inject(TranslateService);
  spinner: NgxSpinnerService = inject(NgxSpinnerService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  // linked resource pid such as document
  pid = input<string>();
  // List of files for the file record.
  files: any[] = undefined;
  // the maximum number of files by file record
  maxFiles = 500;
  // input text filter
  filterText = '';
  // filtered array of files
  filteredFiles = [];
  // A file record as used by rero-invenio-files.
  parentRecord: any = null;

  // the primeng file upload component
  @ViewChild('fileUpload')
  fileUpload: FileUpload;

  nUploadedFiles = 0;

  /**
   * Component initialization.
   *
   * Retrieve files from record
   */
  ngOnInit() {
    this.getFiles();
  }

  /**
   * Convert an absolute URL to a relative path
   *
   * @param url absolute url
   * @returns relative url
   */
  toRelative(url: string): string {
    const urlObj = new URL(url);
    return urlObj.href.replace(urlObj.origin, '');
  }

  /**
   * Update the file label.
   *
   * @param file the file object to update the label.
   * @param label the new label value.
   */
  updateLabel(file, label) {
    label = label.trim();
    if (label.length === 0 || file.label === label) {
      return;
    }
    this.fileService
      .updateMetadata(this.parentRecord.id, file.key, { ...file.metadata, metadata: { label:label }})
      .subscribe((res) => {
        const newLabel = res.metadata.label;
        file.label = newLabel;
        file.metadata.label = newLabel;
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant('File'),
          detail: this.translateService.instant('Metadata have been saved successfully.'),
          life: CONFIG.MESSAGE_LIFE
        });
      });
  }


 // True if the maximum number of files is reached.
  get reachMaxFileLimit(): boolean {
    return this.files.length >= this.maxFiles;
  }

  /** Get the string used to display the search result number.
   * @returns string representation of the number of results.
   */
  getResultsText(): string {
    const remoteTotal = this.files.length;
    const totalFiltered = this.filteredFiles.length;
    if (totalFiltered === this.files.length) {
      return this.translateService.instant('{{ total }} results', { total: remoteTotal });
    }
    return totalFiltered === 0
      ? this.translateService.instant('no result')
      : this.translateService.instant('{{ total }} results of {{ remoteTotal }}', {
          total: totalFiltered,
          remoteTotal: remoteTotal,
        });
  }

  /**
   * Fired when the text to filter the items changes.
   *
   * @param event the standard event.
   */
  onTextChange(_$event): void {
    if (this.filterText.length > 0) {
      this.filteredFiles = this.files.filter((value) => value.label.toLowerCase().includes(this.filterText.toLowerCase()));
    } else {
      this.filteredFiles = this.files;
    }
  }

  /**
   *
   * @param event the standard event.
   * @param _ unused.
   */
  uploadHandler(event, _) {
    let obs: Observable<any>;
    if (event.files.length > 0) {
      this.spinner.show('file-upload');
      if (this.parentRecord == null) {
        // create the parent record
        // should not happens when a document is used as parent record
        obs = this.fileService.createParentRecord(this.pid()).pipe(
          map((record) => (this.parentRecord = record)),
          switchMap(() => {
            return this.generateCreateRequests(event);
          })
        );
      } else {
        // the parent record already exists create only the new file
        obs = this.generateCreateRequests(event);
      }
      obs
        .pipe(
          catchError((e: any) => {
            let msg = this.translateService.instant('Server error');
            if (e.error.message) {
              msg = `${msg}: ${e.error.message}`;
            }
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('File'),
              detail: msg,
              sticky: true,
              closable: true
            });
            return of([]);
          }),
          tap(() => {
            this.resetFilter();
            this.fileUpload.clear();
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('File'),
              detail: this.translateService.instant('File uploaded successfully.'),
              life: CONFIG.MESSAGE_LIFE
            });
            this.nUploadedFiles = 0;
          }),
        )
        .subscribe(() => this.spinner.hide('file-upload'));
    }
  }

  /**
   * Generate the sequential http requests.
   *
   * @param event the standard event.
   * @returns an observable of sequential http requests
   */
  private generateCreateRequests(event): Observable<any> {
    return from(event.files).pipe(
      concatMap((f: any) => this.fileService.create(this.parentRecord.id, f.name, f)),
      map((file: any) => {
        this.nUploadedFiles += 1;
        this.files = [{ label: file.metadata.label ? file.metadata.label : file.key, ...file}, ...this.files];
        this.filteredFiles =  this.files;
      }),
      // like a forkJoin
      toArray()
      );
  }

  /**
   * Filter the uploaded files.
   *
   * @param event the standard event.
   * @param _ unused.
   */
  onSelect(event, _) {
    const existingFileNames = [];
    for (const i of event.files) {
      const fileName = event.files[i].name;
      if (this.files.some((v) => v.key == fileName)) {
        existingFileNames.push(fileName);
      } else {
        event.files[i].label = fileName;
      }
    }
    if (existingFileNames.length > 0) {
      this.fileUpload.msgs.push({
        severity: 'error',
        summary: 'This filename already exists.',
        detail: `${existingFileNames.join(', ')}`,
      });
      this.fileUpload.files = this.fileUpload.files.filter((v) => !existingFileNames.some((n) => n == v.name));
    }
    const numberOfMaxUploadedFiles = this.maxFiles - this.files.length;
    if (numberOfMaxUploadedFiles < this.fileUpload.files.length) {
      this.fileUpload.files = this.fileUpload.files.slice(0, numberOfMaxUploadedFiles);
    }
  }

  /**
   * Removes a given file.
   *
   * @param file
   */
  deleteFile(file: any) {
    this.confirmationService.confirm({
      header: this.translateService.instant('Confirmation'),
      message: this.translateService.instant('Do you really want to remove this file?'),
      acceptLabel: this.translateService.instant('OK'),
      rejectLabel: this.translateService.instant('Cancel'),
      accept: () => {
        this.fileService.delete(this.parentRecord.id, file.key).pipe(
          map(() => {
            this.files = this.files.filter((f) => f.key !== file.key);
            if (this.files.length === 0) {
              this.parentRecord = null;
            }
            this.resetFilter();
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('File'),
              detail: this.translateService.instant('File removed successfully.'),
              life: CONFIG.MESSAGE_LIFE
            });
            return true;
          })
        ).subscribe();
      }
    });
  }

  /**
   * Reset the filtered files.
   */
  resetFilter() {
    this.filterText = '';
    this.filteredFiles = this.files;
  }

  /**
   * Observable for loading record and files.
   *
   * @returns Observable emitting files
   */
  private getFiles(): void {
    this.fileService.getParentRecord(this.pid()).pipe(
      map((record: any) => (this.parentRecord = record)),
      switchMap(() => {
        if(this.parentRecord == null) {
          return of([]);
        }
        return this.fileService.list(this.parentRecord.id);
      }),
      map((files) => {
        return files.map((item: any) => {
          if (item?.label == null) {
            item.label = item?.metadata?.label ? item.metadata.label : item.key;
          }
          return item;
        });
      }),
      map((files) => {
        files.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        this.files = files;
        this.filteredFiles = files;
      }),
      catchError(() => {
        return of([]);
      })
    ).subscribe();
  }
}
