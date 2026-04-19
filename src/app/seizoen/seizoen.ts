import { Component, OnInit } from '@angular/core';
import { Base } from '../base/base';
import { Koppel } from '../model/koppel';
import { Poule, Ronde } from '../model/ronde';
import { Btn } from '../model/misc';
import { Button } from "../shared/button/button";

@Component({
    selector: 'app-seizoen',
    imports: [
        Button
    ],
    templateUrl: './seizoen.html',
    styleUrl: './seizoen.css',
})
export class Seizoen extends Base implements OnInit {
    seizoenen: number[] = [];
    koppels: Koppel[] = [];
    rondes: Ronde[] = [];
    poules: Poule[] = [];
    aantSpelers: number = 0;

    btnKoppels: Btn = new Btn('kop', 'Koppels');
    btnPoules: Btn = new Btn('pou', 'Poules');
    btnRondes: Btn = new Btn('ron', 'Rondes');
    btnSpelers: Btn = new Btn('spl', 'Spelers');
    btnSettings: Btn = new Btn('set', 'Instellingen');

    settingsClicked() {
        this.gotoPage('settings', 'seizoen');
    }

    spelersClicked() {
        this.gotoPage('spelers', 'seizoen');
    }

    koppelsClicked() {
        this.gotoPage('koppels', 'seizoen');
    }

    rondesClicked() {
        this.gotoPage('rondes', 'seizoen');
    }

    poulesClicked() {
        this.gotoPage('poules', 'seizoen');
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Seizoen ' + this.header.seizoen;

        Promise.all([
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getPoules(this.header.seizoen),
            this.dao.getSpelers()
        ])
        .then(results => {
            this.koppels = results[0];
            this.rondes = results[1];
            this.poules = results[2];
            this.aantSpelers = results[3].length;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }
}
