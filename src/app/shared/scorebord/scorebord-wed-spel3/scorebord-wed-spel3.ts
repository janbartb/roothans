import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScorebordSpelerWide } from '../scorebord-speler-wide/scorebord-speler-wide';

@Component({
    selector: 'app-scorebord-wed-spel3',
    imports: [
        ScorebordSpelerWide
    ],
    templateUrl: './scorebord-wed-spel3.html',
    styleUrl: './scorebord-wed-spel3.css',
})
export class ScorebordWedSpel3 {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
