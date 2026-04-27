/*
 * RERO ILS UI
 * Copyright (C) 2024-2025 RERO
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
import { computed, inject, Injectable, signal } from '@angular/core';
import { LoanFixedDateService } from '@app/admin/circulation/services/loan-fixed-date.service';

export type ICirculationSetting = {
  key: string;    /** the setting internal key */
  label: string;  /** the setting label to display to user */
  value: unknown; /** the setting value */
  extra?: {
    remember?: boolean;
    severity?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CirculationSettingsService {

  private loanFixedDateService: LoanFixedDateService = inject(LoanFixedDateService);

  private readonly _settings = signal<ICirculationSetting[]>([]);

  readonly settings = this._settings.asReadonly();
  readonly hasSettings = computed(() => this._settings().length > 0);
  readonly storedDueDate = this.loanFixedDateService.dueDate;

  add(setting: ICirculationSetting): void {
    this._settings.update(s => [...s, setting]);
    if (setting.key === 'endDate' && setting.extra?.remember && typeof setting.value === 'string') {
      this.loanFixedDateService.set(setting.value);
    }
  }

  clear(): void {
    this._settings.set([]);
  }

  remove(key: string): void {
    const idx = this._settings().findIndex(s => s.key === key);
    if (idx >= 0) {
      if (key === 'endDate' && this._settings()[idx].extra?.remember) {
        console.log('Removing checkout date setting:', this._settings()[idx]);
        this.loanFixedDateService.remove();
      }
      this._settings.update(s => s.filter((_, i) => i !== idx));
    }
  }
}
