/*
 * RERO ILS UI
 * Copyright (C) 2024 RERO
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
import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserService } from '@rero/shared';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LibrarySwitchStorageService } from './library-switch-storage.service';

export type ISwitchLibrary = {
  pid: string;
  code: string;
  name : string;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private userService: UserService = inject(UserService);
  private librarySwitchStorageService: LibrarySwitchStorageService = inject(LibrarySwitchStorageService);

  private readonly _selectedLibrary = signal<ISwitchLibrary | null>(null);

  readonly selectedLibrary = this._selectedLibrary.asReadonly();

  get switch$(): Observable<ISwitchLibrary> {
    return toObservable(this.selectedLibrary).pipe(
      filter((library): library is ISwitchLibrary => library !== null),
      map((library: ISwitchLibrary) => library)
    );
  }

  switch(library: ISwitchLibrary): void {
    this.librarySwitchStorageService.save({
      userId: this.userService.user()!.id,
      currentLibrary: library.pid,
      libraryName: library.name
    });
    this.userService.user()!.currentLibrary = library.pid;
    this._selectedLibrary.set(library);
  }
}
