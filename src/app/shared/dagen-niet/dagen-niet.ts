import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dag } from '../../model/misc';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dagen-niet',
    imports: [
        FormsModule
    ],
    templateUrl: './dagen-niet.html',
    styleUrl: './dagen-niet.css',
})
export class DagenNiet {
    @Input() dagenWel: Dag[] = [];
    @Input() dagenNiet: Dag[] = [];
    @Input() ingepland: string = '';
    @Output() dagNietToevoegen: EventEmitter<Dag> = new EventEmitter();
    @Output() dagNietVerwijderen: EventEmitter<Dag> = new EventEmitter();
    gekozen: Dag = new Dag();
    dummy: Dag = new Dag();

    dagSelected() {
        if (this.gekozen.datum == '' || this.gekozen.datum == this.ingepland) {
            return;
        }
        this.dagNietToevoegen.emit(this.gekozen);
        this.gekozen = new Dag();
    }

    removeDagNiet(dg: Dag) {
        this.dagNietVerwijderen.emit(dg);
        this.gekozen = new Dag();
    }
}
