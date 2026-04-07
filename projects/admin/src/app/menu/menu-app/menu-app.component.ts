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
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@rero/shared';
import { map, startWith } from 'rxjs/operators';
import { MENU_APP } from '../menu-definition/menu-app';
import { LibraryService } from '../service/library.service';
import { MenuTranslateService } from '../service/menu-translate.service';
import { MenuService } from '../service/menu.service';
import { Bind } from 'primeng/bind';
import { Menubar } from 'primeng/menubar';
import { Ripple } from 'primeng/ripple';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { MenuUserComponent } from '../menu-user/menu-user.component';

@Component({
    selector: 'admin-menu-app',
    templateUrl: './menu-app.component.html',
    imports: [Bind, Menubar, Ripple, RouterLink, NgClass, MenuUserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuAppComponent {

  private translateService: TranslateService = inject(TranslateService);
  private userService: UserService = inject(UserService);
  private menuService: MenuService = inject(MenuService);
  private menuTranslateService: MenuTranslateService = inject(MenuTranslateService);
  private libraryService: LibraryService = inject(LibraryService);

  private readonly currentLanguage = toSignal(
    this.translateService.onLangChange.pipe(
      map(() => this.translateService.currentLang),
      startWith(this.translateService.currentLang)
    ),
    { initialValue: this.translateService.currentLang }
  );

  readonly items = computed(() => {
    this.currentLanguage();
    return this.menuTranslateService.process(this.menuService.appMenuItems());
  });

  private readonly initializeMenu = effect(() => {
    if (!this.userService.user()) {
      return;
    }

    this.menuService.generateAppMenu(MENU_APP);
  });

  private readonly syncLibrarySelection = effect(() => {
    const library = this.libraryService.selectedLibrary();
    if (!library) {
      return;
    }

    this.menuService.updateLibraryLink(library);
  });
}
