import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Seizoen } from '../../../../model/seizoen';
import { Ronde, RondeSpeelDag, SpeelRonde } from '../../../../model/ronde';
import { RondeKoppel } from '../../../../model/koppel';
import { RondeKoppelView } from '../../../koppels/ronde-koppel-view/ronde-koppel-view';
import { VoorkeurDagen } from '../../../../shared/voorkeur-dagen/voorkeur-dagen';
import { Btn, Dag } from '../../../../model/misc';
import { Button } from '../../../../shared/button/button';
import { DagenNiet } from '../../../../shared/dagen-niet/dagen-niet';
import { Speler } from '../../../../model/speler';
import { Dao } from '../../../../services/dao';
import { Helper } from '../../../../services/helper';
import { DecimalPipe, NgClass } from '@angular/common';
import { KoppelTotnutoe } from '../../../../shared/koppel-totnutoe/koppel-totnutoe';

@Component({
    selector: 'app-ronde-koppel-detail',
    imports: [
        RondeKoppelView,
        VoorkeurDagen,
        DagenNiet, 
        KoppelTotnutoe,
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './ronde-koppel-detail.html',
    styleUrl: './ronde-koppel-detail.css',
})
export class RondeKoppelDetail extends Base implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(Helper);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    speelRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    speelDag: RondeSpeelDag | undefined = undefined;
    koppel: RondeKoppel = new RondeKoppel();
    spelers: Speler[] = [];
    allSpelers: Speler[] = [];
    idxKopSpl: number = -1
    vkDagen: number[] = [];
    vkDagenValid: boolean = false;
    vkDagIngepland: number = -2;
    datIngepland: string = '';
    dagenKanWel: Dag[] = [];
    dagenKanNiet: Dag[] = [];
    today: string = '';
    gewijzigd: boolean = false;

    btnSave: Btn = new Btn('save', 'Opslaan', 'enter');

    opslaanClicked() {

    }

    koppelSpelerClicked(idx: number) {
        console.log(this.koppel.spelers[idx].splNaam);
        this.idxKopSpl = (idx == this.idxKopSpl) ? -1 : idx;
    }

    spelerClicked(idx: number) {

    }

    voorkeurDagClicked(days: number[]) {
        this.vkDagen = days;
        this.vkDagenValid = this.vkDagen[0] > -1 && this.vkDagen[1] > -1;
        this.gewijzigd = this.vkDagenGewijzigd();
    }

    toevoegenDagNiet(dag: Dag) {
        this.dagenKanNiet.push(dag);
        this.dagenKanNiet.sort(this.compareDagen);
        this.dagenKanWel = this.dagenKanWel.filter(dg => dg.datum != dag.datum);
    }

    verwijderenDagNiet(dag: Dag) {
        this.dagenKanNiet = this.dagenKanNiet.filter(dg => dg.datum != dag.datum);
        this.dagenKanWel.push(dag);
        this.dagenKanWel = this.dagenKanWel.sort(this.compareDagen);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Koppels`;
        
        let id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);
        
        id = this.route.snapshot.paramMap.get('koppelId');
        if (!id) {
            this.alert.showError('Kan koppel ID in URL niet vinden.');
            return;
        }
        const koppelId = id;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getSpelers()
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            this.allSpelers = results[2];
            let idx = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${rondeId}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Koppel ${koppelId}`;
            this.today = new Date().toISOString().substring(0, 10);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.speelRonde = data;
                idx = this.speelRonde.koppels.findIndex(kpl => kpl.kopId == koppelId);
                if (idx < 0) {
                    this.alert.showError(`Koppel met ID '${koppelId}' niet gevonden in ${this.speelRonde.rndNaam}.`);
                    return;
                }
                this.koppel = this.speelRonde.koppels[idx];
                this.spelers = this.getAvailableSpelers();
                this.vkDagen = this.koppel.voorkeurDagen.filter(dg => true);
                this.speelDag = this.getIngeplandeDagVoorKoppel(this.koppel.kopId);
                if (this.speelDag) {
                    this.vkDagIngepland = this.speelDag.dagNr;
                    this.datIngepland = this.speelDag.datum;
                }
                this.koppel.dagenNiet.forEach(dn => {
                    this.dagenKanNiet.push(this.dater.getDagFromDate(dn));
                });
                this.dagenKanWel = this.dater.getDagenInPeriode(this.speelRonde.periode, 
                        this.dagenKanNiet.map(dn => dn.datum), this.datIngepland, this.config.speelDagen.map(sd => sd.dagNr));
                console.log(this.koppel);
                console.log(this.speelDag);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private getIngeplandeDagVoorKoppel(id: string): RondeSpeelDag | undefined {
        const foundIdx = this.speelRonde.speelDagen.findIndex(splDag => {
            return splDag.matches.some(match => match.koppelIds.includes(id));
        });
        return foundIdx < 0 ? undefined : this.speelRonde.speelDagen[foundIdx];
    }

    private getAvailableSpelers(): Speler[] {
        return this.allSpelers.filter(spl => this.speelRonde.koppels.every(kpl => kpl.spelers.every(kplSpl => kplSpl.splId != spl.id)));
    }

    private vkDagenGewijzigd(): boolean {
        return this.vkDagen.some((dgNr, idx) => this.koppel.voorkeurDagen[idx] != dgNr);
    }

    private compareDagen(a: Dag, b: Dag) {
        return a.datum > b.datum ? 1 : -1;
    }
    
}
