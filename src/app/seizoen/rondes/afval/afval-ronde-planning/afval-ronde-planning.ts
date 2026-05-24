import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde, RondeSpeelDag, RondeMatch } from '../../../../model/ronde';
import { KoppelSpeler } from '../../../../model/speler';
import { NgClass } from '@angular/common';
import { Btn } from '../../../../model/misc';
import { Button } from '../../../../shared/button/button';
import { SpeeldagView } from '../speeldag-view/speeldag-view';
import { DateHelper } from '../../../../services/date-helper';
import { RondeKoppel } from '../../../../model/koppel';

class AfvalKoppelsPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    koppelsFirst: RondeKoppel[] = [];
    koppelsSecond: RondeKoppel[] = [];
    koppelsRest: RondeKoppel[] = [];
    idxFirst: number = -1;
    idxSecond: number = -1;
    idxRest: number = -1;
    idxHovFirst: number = -1;
    idxHovSecond: number = -1;
    idxHovRest: number = -1;
}

class KoppelsPerRang {
    rang: number = 0;
    koppelsPerDagen: AfvalKoppelsPerDag[] = [];

    constructor(nr: number) {
        this.rang = nr;
    }
}

@Component({
    selector: 'app-afval-ronde-planning',
    imports: [
        SpeeldagView,
        Button,
        NgClass
    ],
    templateUrl: './afval-ronde-planning.html',
    styleUrl: './afval-ronde-planning.css',
})
export class AfvalRondePlanning extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    prevRondeIsPoule: boolean = false;
    prevRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    tePlannenKoppels: RondeKoppel[] = [];
    koppelsPerRang: KoppelsPerRang[] = [];
    koppelsOpScherm: KoppelsPerRang[] = [];
    rangenOpScherm: number[] = [];
    prevRondeBeurtenFinished: number = 0;
    aantPoulesFinished: number = 0;
    selectieKeuze: number = 0;
    idxRang: number = -1;
    idxVkDag: number[] = [-1, -1];
    selKoppelIds: string[] = ['', ''];
    idxSpeelDag: number = -1;
    today: string = '';
    startDatum: string = '';

    btnSave: Btn = new Btn('save', 'Opslaan', 'enter');

    selectieKeuzeClicked(nr: number) {
        if (nr != this.selectieKeuze) {
            this.selectKoppelKeuze(nr);
        }
    }

    speelDagToevoegenClicked(dagNr: number) {
        if (this.ronde.speelDagen.length == this.ronde.maxDagen) {
            this.alert.showWarning('Het maximale aantal speeldagen is bereikt.');
            return;
        }
        let dagToAdd = new RondeSpeelDag(this.ronde.maxMatchesPerDag);
        dagToAdd.dagNr = dagNr;
        dagToAdd.dagNaam = this.dater.getDagNaam(dagNr);
        dagToAdd.mogelijkeData = this.dater.getGivenNrOfWeekDaysStartingFrom(dagNr, 4, this.startDatum, true);
        this.ronde.speelDagen.unshift(dagToAdd);
        this.idxSpeelDag = 0;
        if (this.prevRondeIsPoule) {
            this.selectKoppelKeuze(1);
        }
    }

    speelDagClicked(idx: number) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
        }
    }

    matchClicked(idxDag: number, idxMatch: number) {
        this.idxSpeelDag = idxDag;
        this.removeMatchFromSpeelDag(idxDag, idxMatch);
    }

    koppelClicked(koppelId: string, idxR: number, idxD: number) {
        const kpl = this.tePlannenKoppels.find(k => k.kopId == koppelId);
        if (kpl && kpl.ingepland) {
            return;
        }
        if (this.selKoppelIds[idxR] == koppelId && this.idxVkDag[idxR] == idxD) {
            this.deselectKoppel(idxR);
        }
        else {
            this.selectKoppel(koppelId, idxR, idxD);
        }
    }

    koppelHovered(event: MouseEvent, koppel: RondeKoppel, kpr: KoppelsPerRang) {
        event.stopPropagation();
        kpr.koppelsPerDagen.forEach(kpd => {
            kpd.idxHovFirst = kpd.koppelsFirst.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxHovSecond = kpd.koppelsSecond.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxHovRest = kpd.koppelsRest.findIndex(kop => kop.kopId == koppel.kopId);
        });
    }

    clearHovered(rangKoppels: KoppelsPerRang) {
        rangKoppels.koppelsPerDagen.forEach(kpd => {
            kpd.idxHovFirst = kpd.idxHovSecond = kpd.idxHovRest = -1;
        });
    }

    opslaanClicked() {
        this.ronde.koppels = this.tePlannenKoppels;
        this.ronde.speelDagen.sort(this.compareSpeelDagen);
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, this.ronde)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.idxSpeelDag = -1;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    datumGewijzigd(idx: number, datum: string) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
        }
        this.ronde.speelDagen[idx].datum = datum;
    }

    speelDagVerwijderen(idx: number) {
        this.ronde.speelDagen.splice(idx, 1);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning`;

        const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!rondeId) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const id = Number(rondeId);
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            // this.dao.getKoppels(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            // this.koppels = results[2];
            // this.koppels.sort(this.compareKoppels);
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            const rnd = this.rondes[idx];
            const rndPrev = this.rondes[idx - 1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning ${rnd.rndNaam}`;
            this.today = new Date().toISOString().substring(0, 10);
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, rndPrev.fileNaam)
            ])
            .then(rndFiles => {
                this.ronde = rndFiles[0];
                this.prevRonde = rndFiles[1];
                if (idx == 1) {
                    this.prevRondeIsPoule = true;
                    this.prevRondeBeurtenFinished = 6 * rndPrev.rndBeurten;
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromPouleRonde();
                    this.startDatum = this.getStartDatumFromPouleRonde();
                }
                else {
                    this.prevRondeBeurtenFinished = 2 * rndPrev.rndBeurten;
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromAfvalRonde();
                    this.startDatum = this.getStartDatumFromAfvalRonde();
                }
                this.ronde.maxDagen = (this.tePlannenKoppels.length / 2) / this.ronde.maxMatchesPerDag;
                if (this.ronde.maxDagen < 1) {
                    this.ronde.maxDagen = 1;
                }
                console.log(this.tePlannenKoppels);
                if (this.prevRondeIsPoule) {
                    this.fillKoppelsPerRangPerDag();
                    this.selectKoppelKeuze(0);
                }
                else {

                }
                this.ronde.speelDagen.forEach(sd => {
                    sd.matches.forEach(dm => {
                        // let kop = this.tePlannenKoppels.find(kpl => kpl.kopId == dm.splKoppelId);
                        // if (kop) {
                        //     dm.splKoppelId = kop.kopId;
                        // }
                        // kop = this.tePlannenKoppels.find(kpl => kpl.kopId == dm.tegKoppelId);
                        // if (kop) {
                        //     dm.tegKoppelId = kop.kopId;
                        // }
                        // dm.splKoppel.ingepland = true;
                        // dm.tegKoppel.ingepland = true;
                    });
                });
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private selectKoppel(id: string, idxR: number, idxD: number) {
        console.log('selecting koppel: ' + id);
        this.idxVkDag[idxR] = idxD;
        this.selKoppelIds[idxR] = id;
        if (this.selKoppelIds.every(ski => ski != '')) {
            this.addMatchToSpeelDag();
        }
    }

    private deselectKoppel(idxR: number) {
        this.idxVkDag[idxR] = -1;
        this.selKoppelIds[idxR] = '';
    }

    private addMatchToSpeelDag() {
        if (this.idxSpeelDag < 0) {
            this.alert.showWarning('Kan match niet toevoegen. Er is geen speeldag geselecteerd.');
            this.cancelKoppelSelections();
            return;
        }
        if (this.ronde.speelDagen[this.idxSpeelDag].matches.length >= this.ronde.maxMatchesPerDag) {
            this.alert.showWarning('Kan match niet toevoegen. De geselecteerde speeldag zit al vol.');
            this.cancelKoppelSelections();
            return;
        }
        console.log(this.ronde.koppels);
        const splKoppel = this.tePlannenKoppels.find(kpl => kpl.kopId == this.selKoppelIds[0]);
        if (!splKoppel) {
            this.alert.showWarning(`Kan match niet toevoegen. Eerste geselecteerde koppel ${this.selKoppelIds[0]} niet gevonden.`);
            return;
        }
        const tegKoppel = this.tePlannenKoppels.find(kpl => kpl.kopId == this.selKoppelIds[1]);
        if (!tegKoppel) {
            this.alert.showWarning(`Kan match niet toevoegen. Tweede geselecteerde koppel ${this.selKoppelIds[1]} niet gevonden.`);
            return;
        }
        splKoppel.ingepland = true;
        tegKoppel.ingepland = true;
        let matchToAdd = new RondeMatch(new RondeKoppel(), new RondeKoppel());
        // matchToAdd.splKoppel = splKoppel;
        // matchToAdd.tegKoppel = tegKoppel;
        // matchToAdd.splKoppelId = splKoppel.kopId;
        // matchToAdd.tegKoppelId = tegKoppel.kopId;
        this.ronde.speelDagen[this.idxSpeelDag].matches.push(matchToAdd);
        //this.removeMatchKoppelsFromKoppelsPerDagen(matchToAdd);
        this.selKoppelIds = ['', ''];
    }

    private removeMatchFromSpeelDag(idxDag: number, idxMatch: number) {
        const match = this.ronde.speelDagen[idxDag].matches[idxMatch];
//        match.splKoppel.ingepland = false;
//        match.tegKoppel.ingepland = false;
        this.ronde.speelDagen[idxDag].matches.splice(idxMatch, 1);
    }

    private removeMatchKoppelsFromKoppelsPerDagen(match: RondeMatch) {
        this.koppelsOpScherm.forEach((kos, idxKos) => {
            // let kopId = (idxKos == 0) ? match.splKoppelId : match.tegKoppelId;
            // kos.koppelsPerDagen.forEach(kpd => {
            //     kpd.idxFirst = -1;
            //     kpd.idxSecond = -1;
            //     kpd.idxRest = -1;
            //     kpd.koppelsFirst = kpd.koppelsFirst.filter(kp => kp.kopId != kopId);
            //     kpd.koppelsSecond = kpd.koppelsSecond.filter(kp => kp.kopId != kopId);
            //     kpd.koppelsRest = kpd.koppelsRest.filter(kp => kp.kopId != kopId);
            // });
        });
        this.selKoppelIds = ['', ''];
    }

    private cancelKoppelSelections() {
        this.idxVkDag = [-1, -1];
        this.selKoppelIds = ['', ''];
    }

    private selectKoppelKeuze(nr: number) {
        this.koppelsOpScherm = [];
        this.selectieKeuze = nr;
        if (nr == 0) {
            this.koppelsOpScherm.push(this.koppelsPerRang[0]);
            this.koppelsOpScherm.push(this.koppelsPerRang[3]);
            this.rangenOpScherm = [1, 4];
        }
        else {
            this.koppelsOpScherm.push(this.koppelsPerRang[1]);
            this.koppelsOpScherm.push(this.koppelsPerRang[2]);
            this.rangenOpScherm = [2, 3];
        }
        console.log(this.koppelsOpScherm);
    }

    private fillKoppelsPerRangPerDag() {
        if (!this.tePlannenKoppels.length) {
            return;
        }
        this.koppelsPerRang = [];
        const rangen = [1, 2, 3, 4];
        rangen.forEach(rang => {
            const idxRang = rang - 1;
            const kpr = new KoppelsPerRang(rang);
            this.koppelsPerRang.push(kpr);
            this.config.speelDagen.forEach((sdag) => {
                let kpd = new AfvalKoppelsPerDag();
                kpd.dagNr = sdag.dagNr;
                kpd.dagNaam = sdag.dagNaam;
                this.tePlannenKoppels.forEach(kpl => {
                    if (kpl.pouleRang == rang && kpl.voorkeurDagen.includes(kpd.dagNr)) {
                        if (kpl.voorkeurDagen[0] == kpd.dagNr) {
                            kpd.koppelsFirst.push(kpl);
                        }
                        else if (kpl.voorkeurDagen[1] == kpd.dagNr) {
                            kpd.koppelsSecond.push(kpl);
                        }
                        else {
                            kpd.koppelsRest.push(kpl);
                        }
                    }
                });
                kpr.koppelsPerDagen.push(kpd);
            });
        });
    }

    private getTePlannenKoppelsFromPouleRonde(): RondeKoppel[] {
        let result: RondeKoppel[] = [];
        this.prevRonde.poules.forEach(poule => {
            if (poule.koppels.every(pk => pk.uitslag.brt == this.prevRondeBeurtenFinished)) {
                this.aantPoulesFinished++;
                result.push(...this.getAfvalKoppelsFromPoule(poule));
            }
        });
        return result;
    }

    private getTePlannenKoppelsFromAfvalRonde(): RondeKoppel[] {
        let result: RondeKoppel[] = [];

        return result;        
    }

    private getStartDatumFromPouleRonde(): string {
        let result = '';
        this.prevRonde.poules.forEach(poule => {
            if (poule.datum > result) {
                result = poule.datum;
            }
        });
        result = (result < this.today) ? this.today : result;
        return result;
    }

    private getStartDatumFromAfvalRonde(): string {
        let result = '';
        this.prevRonde.speelDagen.forEach(dag => {
            if (dag.datum > result) {
                result = dag.datum;
            }
        });
        result = (result < this.today) ? this.today : result;
        return result;
    }

    getAfvalKoppelsFromPoule(pl: Poule): RondeKoppel[] {
        let result: RondeKoppel[] = [];
        pl.koppels.sort(this.comparePouleKoppels);
        pl.koppels.forEach((kpl, idx) => {
            let kop = new RondeKoppel();
            Object.assign(kop, kpl);
            kop.kopMoyenne = kpl.uitslag.moy;
            kop.pouleId = pl.id;
            kop.pouleRang = idx + 1;
            kop.spelers.forEach(spl => {
                const pouleSpl = kpl.spelers.find(sp => sp.splId == spl.splId);
                if (pouleSpl) {
                    //spl.splMoy = pouleSpl.uitslag.moy;
                }
            });
            kop.spelers.sort(this.compareKoppelSpelers);
            result.push(kop);
        });
        return result;
    }

    private compareSpeelDagen(a: RondeSpeelDag, b: RondeSpeelDag): number {
        if (a.datum == b.datum) {
            return 0;
        }
        if (a.datum == '') {
            return 1;
        }
        if (b.datum == '') {
            return -1;
        }
        return (a.datum < b.datum) ? -1 : 1;
    }

    private comparePouleKoppels(a: RondeKoppel, b: RondeKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            if ((b.uitslag.moy / b.kopMoyenne) == (a.uitslag.moy / a.kopMoyenne)) {
                return b.kopMoyenne - a.kopMoyenne;
            }
            else {
                return (b.uitslag.moy / b.kopMoyenne) - (a.uitslag.moy / a.kopMoyenne);
            }
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

    private compareKoppelSpelers(a: KoppelSpeler, b: KoppelSpeler): number {
        return a.splMoy - b.splMoy;
    }

}
