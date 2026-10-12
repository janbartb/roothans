import { Component, Input, OnInit } from '@angular/core';
import { RondeKoppel } from '../../model/koppel';
import { DecimalPipe } from '@angular/common';

class Resultaat {
    naam: string = '';
    weds: number = 0;
    winst: number = 0;
    gelijk: number = 0;
    verlies: number = 0;
    pnt: number = 0;
    car: number = 0;
    brt: number = 0;
    moy: number = 0;
    ser: number = 0;
    perc: number = 0;
}

@Component({
    selector: 'app-koppel-totnutoe',
    imports: [
        DecimalPipe
    ],
    templateUrl: './koppel-totnutoe.html',
    styleUrl: './koppel-totnutoe.css',
})
export class KoppelTotnutoe implements OnInit {
    @Input() koppel: RondeKoppel = new RondeKoppel();

    results: Resultaat[] = [];

    ngOnInit(): void {
        this.results.push(this.getSpelerResultaten(0));
        this.results.push(this.getSpelerResultaten(1));
        this.results.push(this.getKoppelResultaten());
    }

    private getSpelerResultaten(idx: number): Resultaat {
        let result: Resultaat = new Resultaat();
        result.naam = this.koppel.spelers[idx].splNaam;
        const splRes = this.koppel.splUitslagen[idx];
        result.weds = splRes.totNuToe.weds;
        result.winst = splRes.totNuToe.winst;
        result.gelijk = splRes.totNuToe.gelijk;
        result.verlies = splRes.totNuToe.verlies;
        result.pnt = splRes.totNuToe.pnt;
        result.car = splRes.totNuToe.car;
        result.brt = splRes.totNuToe.brt;
        result.moy = splRes.totNuToe.moy;
        result.ser = splRes.totNuToe.ser;
        if (splRes.uitslag.brt > 0) {
            result.weds++;
            result.winst += splRes.uitslag.winst;
            result.gelijk += splRes.uitslag.gelijk;
            result.verlies += splRes.uitslag.verlies;
            result.pnt += splRes.uitslag.pnt;
            result.car += splRes.uitslag.car;
            result.brt += splRes.uitslag.brt;
            result.moy = result.car / result.brt;
            if (splRes.uitslag.ser > result.ser) {
                result.ser = splRes.uitslag.ser;    
            }
        }
        return result;
    }

    private getKoppelResultaten(): Resultaat {
        let result: Resultaat = new Resultaat();
        result.naam = 'Koppel';
        result.weds = this.results[0].weds + this.results[1].weds;
        result.winst = this.results[0].winst + this.results[1].winst;
        result.gelijk = this.results[0].gelijk + this.results[1].gelijk;
        result.verlies = this.results[0].verlies + this.results[1].verlies;
        result.pnt = this.results[0].pnt + this.results[1].pnt;
        result.car = this.results[0].car + this.results[1].car;
        result.brt = this.results[0].brt + this.results[1].brt;
        result.moy = (result.brt == 0) ? 0 : result.car / result.brt;
        result.ser = (this.results[0].ser > this.results[1].ser) ? this.results[0].ser : this.results[1].ser;
        return result;
    }
}
