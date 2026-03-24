import { Component, input } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { Nl2brPipe } from '@rero/ng-core';

@Component({
    selector: 'admin-notes',
    templateUrl: './notes.component.html',
    imports: [TranslateDirective, Nl2brPipe]
})
export class NotesComponent {

  notes = input<[{type, content}]>();
}
