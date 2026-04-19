import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScorebordSpelerWide } from '../scorebord-speler-wide/scorebord-speler-wide';

@Component({
    selector: 'app-scorebord-wed-spel1',
    imports: [
        ScorebordSpelerWide
    ],
    templateUrl: './scorebord-wed-spel1.html',
    styleUrl: './scorebord-wed-spel1.css',
})
export class ScorebordWedSpel1 {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
