import { Component, Input } from '@angular/core';
import { RondeMatch } from '../../../../model/ronde';
import { RondeKoppel } from '../../../../model/koppel';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-ovz-match',
    imports: [
        NgClass
    ],
    templateUrl: './ovz-match.html',
    styleUrl: './ovz-match.css',
})
export class OvzMatch {
    @Input() type: string = 'pln';
    @Input() match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    @Input() matchNr: number = 0;
}
