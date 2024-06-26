/*
 * RERO ILS UI
 * Copyright (C) 2019-2024 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { RecordService, processJsonSchema } from '@rero/ng-core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'admin-add-entity-local-form',
  templateUrl: './add-entity-local-form.component.html'
})
export class AddEntityLocalFormComponent implements OnInit, OnDestroy {

  /** Available types on select typeahead */
  @Input() entityTypeFilters: any;

  /** Text searched by user */
  @Input() searchTerm: string;

  /** Event for close dialog */
  @Output() closeDialog: EventEmitter<boolean> = new EventEmitter();

  /** Event for record create */
  @Output() recordCreate: EventEmitter<any> = new EventEmitter();

  /** TODO: Find a better solution for next iteration */
  translatedTypes = {
    'concepts-genreForm': 'bf:Topic'
  };

  /** Available types for the select menu on form */
  availableTypes: string[] = [];

  /** JSONSchema */
  schema = null;

  /** form initial values */
  model: any = {};

  /** angular form group for ngx-formly */
  form: FormGroup;

  /** Formly fields configuration populate by the JSONSchema */
  fields: FormlyFieldConfig[];

  /** Fields authorized to receive data */
  populateFields = ['name', 'title'];

  /** all component subscription */
  private subscriptions = new Subscription();

  /**
   * Constructor
   * @param recordService - RecordService
   * @param formlyJsonschema - FormlyJsonschema
   * @param translateService - TranslateService
   * @param toastrService - ToastrService
   */
  constructor(
    private recordService: RecordService,
    private formlyJsonschema: FormlyJsonschema,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {}

  /** OnInit hook */
  ngOnInit(): void {
    this.form = new FormGroup({});
    let selectedType = undefined;
    if (this.entityTypeFilters.length === 1) {
      // If there is only one possible choice, we take the first value.
      selectedType = this.entityTypeFilters[0].value;
    } else {
      // If the select menu has not been touched, all values of the selected key are set to false.
      // We take the first value.
      const selected = this.entityTypeFilters.filter((element: any) => element.selected);
      selectedType = (selected.length === 0) ? this.entityTypeFilters[0].value : selected[0].value;
    }
    this.subscriptions.add(this.recordService.getSchemaForm('local_entities').subscribe((schema) => {
      schema = processJsonSchema(schema.schema);
      // Transfer the selected oneOf to the root schema
      schema = schema.oneOf.find((element: any) => element.properties.type.const === this.translatedType(selectedType));
      // Deleting the oneOf key from the schema
      delete schema.oneOf;
      this.fields = [this.formlyJsonschema.toFieldConfig(schema, {
        map: (field: FormlyFieldConfig) => {
          // Put the value typed by the user in the corresponding field
          if (this.populateFields.includes(String(field.key))) {
            field.defaultValue = this.searchTerm;
          }
          // If the type is concept-genreForm, we set the genreForm field flag
          if (field.key === 'genreForm' && selectedType === 'concepts-genreForm') {
            field.defaultValue = true;
          }
          return field;
        }
      })];
      this.schema = schema;
    }));
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** Submit form */
  submit(): void {
    if (this.form.valid) {
      this.subscriptions.add(this.recordService.create('local_entities', this.model).subscribe(
        (response: any) => {
          this.recordCreate.emit(response);
          this.closeModal();
        },
        () => this.toastrService.error(
          this.translateService.instant('Data submission generated an error.'),
          this.translateService.instant('Add local entity')
        )
      ));
    }
  }

  /** Close the dialog */
  closeModal(): void {
    this.closeDialog.emit(true);
  }

  /**
   * returns the type match if it exists
   * @param type - string
   * @returns translated type
   */
  private translatedType(type: string): string {
    if (Object.keys(this.translatedTypes).includes(type)) {
      return this.translatedTypes[type];
    }
    return type;
  }
}
