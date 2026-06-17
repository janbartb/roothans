import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Seizoen } from '../../../../model/seizoen';
import { Ronde, SpeelRonde } from '../../../../model/ronde';
import { NgClass } from '@angular/common';
import { RondeKoppel } from '../../../../model/koppel';
import { KoppelRow } from '../../../koppels/koppel-row/koppel-row';
import { RondeKoppelView } from '../../../koppels/ronde-koppel-view/ronde-koppel-view';

@Component({
    selector: 'app-ronde-koppels',
    imports: [
        RondeKoppelView,
        NgClass
    ],
    templateUrl: './ronde-koppels.html',
    styleUrl: './ronde-koppels.css',
})
export class RondeKoppels extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    speelRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    sortCol: string = 'moy';
    sortDir: number = -1;
    today: string = '';

    koppelClicked(kpl: RondeKoppel) {
        this.gotoPage(this.router.url + `/${kpl.kopId}`, this.router.url)
    }

    sortClicked(colNaam: string) {
        if (colNaam == this.sortCol) {
            this.sortDir = -1 * this.sortDir;
        }
        else {
            this.sortCol = colNaam;
            this.sortDir = colNaam == 'moy' ? -1 : 1;
        }
        this.sortKoppels(colNaam);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Koppels`;
        
        const id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idx = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Koppels`;
            this.today = new Date().toISOString().substring(0, 10);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.speelRonde = data;
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private sortKoppels(colNaam: string) {
        if (colNaam == 'spl1') {
            this.speelRonde.koppels.sort(this.compareNames1);
        }
        else if (colNaam == 'spl2') {
            this.speelRonde.koppels.sort(this.compareNames2);
        }
        else {
            this.speelRonde.koppels.sort(this.compareMoyennes);
        }
    }

    private compareNames1 = (a: RondeKoppel, b: RondeKoppel): number => {
        return this.sortDir * (a.spelers[0].splNaam < b.spelers[0].splNaam ? -1 : 1);
    }
    
    private compareNames2 = (a: RondeKoppel, b: RondeKoppel): number => {
        return this.sortDir * (a.spelers[1].splNaam < b.spelers[1].splNaam ? -1 : 1);
    }
    
    private compareMoyennes = (a: RondeKoppel, b: RondeKoppel): number => {
        return this.sortDir * (a.kopMoyenne - b.kopMoyenne);
    }

}
