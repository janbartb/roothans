import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScorebordSpelerWide } from '../scorebord-speler-wide/scorebord-speler-wide';

@Component({
    selector: 'app-scorebord-wed-spel4',
    imports: [
        ScorebordSpelerWide
    ],
    templateUrl: './scorebord-wed-spel4.html',
    styleUrl: './scorebord-wed-spel4.css',
})
export class ScorebordWedSpel4 {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
