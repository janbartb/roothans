import { Component, Input } from '@angular/core';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { ScorebordSpeler } from '../scorebord-speler/scorebord-speler';

@Component({
    selector: 'app-scorebord-wed-spel2',
    imports: [
        ScorebordSpeler
    ],
    templateUrl: './scorebord-wed-spel2.html',
    styleUrl: './scorebord-wed-spel2.css',
})
export class ScorebordWedSpel2 {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() tegenstander: WedSpeler = new WedSpeler();
    @Input() oldPunten: number[] = [0, 0];

}
