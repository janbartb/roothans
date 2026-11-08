import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RondeMatch } from '../../../../model/ronde';
import { RondeKoppel } from '../../../../model/koppel';

@Component({
    selector: 'app-ovz-match-wide',
    imports: [
        NgClass
    ],
    templateUrl: './ovz-match-wide.html',
    styleUrl: './ovz-match-wide.css',
})
export class OvzMatchWide {
    @Input() type: string = 'pln';
    @Input() match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    @Input() matchNr: number = 0;
}
