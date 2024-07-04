/*
 * RERO ILS UI
 * Copyright (C) 2020-2024 RERO
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
import { Injectable } from '@angular/core';
import { TranslateService } from '@rero/ng-core';
import { AppSettingsService, User, UserService } from '@rero/shared';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { OrganisationService } from './organisation.service';
import { TypeaheadFactoryService } from './typeahead-factory.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  /**
   * Constructor
   * @param _userService - UserService
   * @param _appConfigService - AppConfigService
   * @param _translateService - TranslateService
   * @param _organisationService - OrganisationService
   * @param _typeaheadFactoryService - TypeaheadFactoryService
   * @param _appSettingsService - AppSettingsService
   */
  constructor(
    private _userService: UserService,
    private _appConfigService: AppConfigService,
    private _translateService: TranslateService,
    private _organisationService: OrganisationService,
    private _typeaheadFactoryService: TypeaheadFactoryService,
    private _appSettingsService: AppSettingsService,
  ) { }

  /**
   * Function called when launching the application
   */
  load(): Observable<any> {
    return this._userService.load().pipe(
      tap((user: User) => {
        this._typeaheadFactoryService.init();
        if (user.hasAdminUiAccess) {
          // Set current library and organisation for librarian or system_librarian roles
          const library = user.patronLibrarian.libraries[0];
          user.currentLibrary = library.pid;
          user.currentOrganisation = user.patronLibrarian.organisation.pid;
          user.currentBudget = user.patronLibrarian.organisation.budget.pid;
          this._organisationService.loadOrganisationByPid(user.currentOrganisation);
        }
      }),
      switchMap(() => this.initTranslateService())
    );
  }

  /** Initialize Translate Service */
  private initTranslateService(): Observable<any> {
    let {language} = this._appSettingsService.settings;
    if (language == null) {
      const browserLang = this._translateService.getBrowserLang();
      language = browserLang.match(this._appConfigService.languages.join('|')) ?
        browserLang : this._appConfigService.defaultLanguage;
    }
    return this._translateService.setLanguage(language);
  }
}
