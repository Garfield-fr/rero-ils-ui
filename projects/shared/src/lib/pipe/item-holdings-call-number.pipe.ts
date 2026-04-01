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
import { inject, Injector, Pipe, PipeTransform, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RecordService } from '@rero/ng-core';
import { map, startWith } from 'rxjs/operators';

type CallNumberSource = 'item' | 'holding' | undefined;

type CallNumber = {
  source: CallNumberSource;
  value: string | undefined;
};

type ItemCallNumbers = {
  first: CallNumber;
  second: CallNumber;
};

type RecordMetadata = {
  call_number?: string;
  second_call_number?: string;
  holding?: { pid?: string };
};

@Pipe({ name: 'itemHoldingsCallNumber', pure: false })
export class ItemHoldingsCallNumberPipe implements PipeTransform {

  protected recordService: RecordService = inject(RecordService);
  private readonly injector = inject(Injector);
  private readonly cache = new Map<string, Signal<ItemCallNumbers>>();

  /**
   * Get item call numbers
   * @return object: first, second are the item first, second call numbers.
   */
  transform(record: unknown): ItemCallNumbers {
    const metadata = this.extractMetadata(record);
    if (!metadata) {
      return this.emptyCallNumbers();
    }

    if (metadata.call_number) {
      return {
        first: {
          source: 'item',
          value: metadata.call_number
        },
        second: {
          source: 'item',
          value: metadata.second_call_number
        }
      };
    }

    const holdingPid = metadata.holding?.pid;
    if (!holdingPid) {
      return this.emptyCallNumbers();
    }

    const cacheKey = `${holdingPid}::${metadata.second_call_number ?? ''}`;
    if (!this.cache.has(cacheKey)) {
      const secondCallNumber = metadata.second_call_number;
      const sig = runInInjectionContext(this.injector, () =>
        toSignal(
          this.recordService.getRecord('holdings', holdingPid, { resolve: 1 }).pipe(
            map((data: unknown) => {
              const callNumber = this.extractHoldingCallNumber(data);
              return callNumber
                ? {
                    first: { source: 'holding' as const, value: callNumber },
                    second: { source: 'item' as const, value: secondCallNumber }
                  }
                : this.emptyCallNumbers();
            }),
            startWith(this.emptyCallNumbers())
          ),
          { initialValue: this.emptyCallNumbers() }
        )
      );
      this.cache.set(cacheKey, sig);
    }

    return this.cache.get(cacheKey)!();
  }

  private extractMetadata(record: unknown): RecordMetadata | null {
    if (!record || typeof record !== 'object') {
      return null;
    }
    const recordObject = record as Record<string, unknown>;
    if ('metadata' in recordObject && recordObject.metadata && typeof recordObject.metadata === 'object') {
      return recordObject.metadata as RecordMetadata;
    }
    return recordObject as RecordMetadata;
  }

  private extractHoldingCallNumber(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const recordObject = data as Record<string, unknown>;
    if (!recordObject.metadata || typeof recordObject.metadata !== 'object') {
      return undefined;
    }

    const metadata = recordObject.metadata as Record<string, unknown>;
    return typeof metadata.call_number === 'string' ? metadata.call_number : undefined;
  }

  private emptyCallNumbers(): ItemCallNumbers {
    return {
      first: {
        source: undefined,
        value: undefined
      },
      second: {
        source: undefined,
        value: undefined
      }
    };
  }
}
