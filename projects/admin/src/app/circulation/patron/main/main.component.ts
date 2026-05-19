/*
 * RERO ILS UI
 * Copyright (C) 2019-2026 RERO
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
import { Component, inject, signal, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { HotkeysService } from '@ngneat/hotkeys';
import { AppStore, User } from '@rero/shared';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CirculationStore } from '../../store/circulation.store';
import { CardComponent } from '../card/card.component';
import { Bind } from 'primeng/bind';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { CurrencyPipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'admin-main',
    templateUrl: './main.component.html',
    imports: [CardComponent, Bind, Tabs, TabList, Ripple, Tab, RouterLink, RouterOutlet, CurrencyPipe, TranslatePipe, BadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit, OnDestroy {

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private appStore = inject(AppStore);
  private hotKeysService: HotkeysService = inject(HotkeysService);
  private translateService: TranslateService = inject(TranslateService);

  protected store = inject(CirculationStore);

  // COMPONENT ATTRIBUTES ====================================================
  private _shortcuts = [];

  barcode: string;
  items = signal<MenuItem[]>([]);
  activeTab = signal<string>('');
  subscription = new Subscription();

  get organisation() {
    return this.appStore.organisation();
  }

  constructor() {
    // React to patron changes: init tabs, load stats, register shortcuts
    toObservable(this.store.patron).pipe(
      takeUntilDestroyed(),
      filter((patron): patron is User => !!patron)
    ).subscribe((patron: any) => {
      this.initializeTabs(patron.keep_history);
      this.store.loadStats(patron.pid);
      this._unregisterShortcuts();
      this.initializeShortcuts(patron.keep_history);
      this._registerShortcuts();
    });
  }

  ngOnInit(): void {
    this.subscription.add(this.route.params.subscribe((data: any) => {
      if (Object.hasOwn(data, 'barcode') && (this.barcode !== data.barcode)) {
        this.load(data.barcode);
      }
    }));
    this.subscription.add(this.router.events.subscribe((event: NavigationEnd | any) => {
      if (event instanceof NavigationEnd) {
        this.activeTab.set(this.router.url.split('/').pop() ?? '');
      }
    }));
    this.activeTab.set(this.router.url.split('/').pop() ?? '');
  }

  ngOnDestroy(): void {
    this._unregisterShortcuts();
    this.subscription.unsubscribe();
    this.store.clear();
  }

  load(barcode: string): void {
    this.barcode = barcode;
    this.store.clear();
    this.store.loadPatron(barcode);
  }

  clearPatron(): void {
    this.router.navigate(['/circulation']);
  }

  private _registerShortcuts(): void {
    for (const shortcut of this._shortcuts) {
      const { callback } = shortcut;
      delete shortcut.callback;
      this.hotKeysService.addShortcut(shortcut).subscribe($event => callback($event));
    }
  }

  private _unregisterShortcuts(): void {
    const registeredHotKeys = this.hotKeysService.getHotkeys().map(shortcut => shortcut.keys);
    const componentShortcuts = this._shortcuts.map(shortcut => shortcut.keys);
    const intersectionShortcuts = registeredHotKeys.filter(value => componentShortcuts.includes(value));
    if (intersectionShortcuts.length > 0) {
      this.hotKeysService.removeShortcuts(intersectionShortcuts);
    }
  }

  private initializeTabs(keepHistory: boolean): void {
    const items = [
      {
        id: 'loan',
        label: this.translateService.instant('On loan'),
        routerLink: ['/circulation', 'patron', this.barcode, 'loan'],
        tag: { statistics: this.store.statistics }
      },
      {
        id: 'pickup',
        label: this.translateService.instant('To pick up'),
        routerLink: ['/circulation', 'patron', this.barcode, 'pickup'],
        tag: { statistics: this.store.statistics }
      },
      {
        id: 'pending',
        label: this.translateService.instant('Pending'),
        routerLink: ['/circulation', 'patron', this.barcode, 'pending'],
        tag: { statistics: this.store.statistics }
      },
      {
        id: 'ill',
        label: this.translateService.instant('Interlibrary loan'),
        routerLink: ['/circulation', 'patron', this.barcode, 'ill'],
        tag: { statistics: this.store.statistics }
      },
      {
        id: 'profile',
        label: this.translateService.instant('Profile'),
        routerLink: ['/circulation', 'patron', this.barcode, 'profile']
      },
      {
        id: 'fees',
        label: this.translateService.instant('Fees'),
        routerLink: ['/circulation', 'patron', this.barcode, 'fees'],
        tag: {
          severity: 'warn',
          statistics: this.store.statistics,
          withCurrency: true,
        }
      }
    ];
    if (keepHistory) {
      items.push({
        id: 'history',
        label: this.translateService.instant('History'),
        routerLink: ['/circulation', 'patron', this.barcode, 'history']
      });
    }
    this.items.set(items);
  }

  private initializeShortcuts(keepHistory: boolean): void {
    this._shortcuts = [
      {
        keys: '1',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "circulation" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'loan']);
        }
      }, {
        keys: '2',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "pickup" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'pickup']);
        }
      }, {
        keys: '3',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "pending" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'pending']);
        }
      }, {
        keys: '4',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "ILL" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'ill']);
        }
      }, {
        keys: '5',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "patron profile" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'profile']);
        }
      }, {
        keys: '6',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "fees" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'fees']);
        }
      }
    ];
    if (keepHistory) {
      this._shortcuts.push({
        keys: '7',
        group: this.translateService.instant('Patron profile shortcuts'),
        description: this.translateService.instant('Go to "history" tab'),
        callback: (_$event: KeyboardEvent) => {
          this.router.navigate(['/circulation', 'patron', this.barcode, 'history']);
        }
      });
    }
  }
}
