import { inject, Injectable } from '@angular/core';
import { Speler } from '../model/speler';
import { DecimalPipe } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class Helper {
    decPipe = inject(DecimalPipe);

    formatNumber(num: number, format: string): string {
        if (!format || format == '') {
            return '';
        }
        const result = this.decPipe.transform(num, format, 'nl-NL');
        return !result ? '' : result;
    }

    getSpelerNaam(spl: Speler): string {
        let result = spl.vnaam;
        if (spl.tvoeg != '') {
            result += ' ' + spl.tvoeg;
        }
        result += ' ' + spl.anaam;
        if (spl.extra != '') {
            result += ' ' + spl.extra;
        }
        return result;
    }

    createSpelerId(speler: Speler, existing: string[]): string {
        let id = '';
        let parts = speler.vnaam.split(' ');
        parts.forEach(part => {
            id += part.charAt(0).toUpperCase();
        });
        parts = speler.tvoeg.split(' ');
        parts.forEach(part => {
            if (part == 'vd') {
                id += part;
            }
            else {
                id += part.charAt(0).toLowerCase();
            }
        });
        parts = speler.anaam.split(' ');
        parts.forEach(part => {
            id += part.charAt(0).toUpperCase();
        });
        let exists = existing.includes(id);
        let id2 = '';
        let volgNr = 1;
        while (exists) {
            volgNr++;
            id2 = id + volgNr;
            exists = existing.includes(id2);
        }
        return id2.length ? id2 : id;
    }
}
