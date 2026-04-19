import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScorebordTeam } from '../scorebord-team/scorebord-team';
import { ScorebordWedSpel2 } from '../scorebord-wed-spel2/scorebord-wed-spel2';

@Component({
    selector: 'app-scorebord-wed-spel2x2',
    imports: [
        ScorebordTeam,
        ScorebordWedSpel2
    ],
    templateUrl: './scorebord-wed-spel2x2.html',
    styleUrl: './scorebord-wed-spel2x2.css',
})
export class ScorebordWedSpel2x2 {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
