import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { AfvalDag, AfvalKoppel, AfvalMatch, AfvalRonde, Poule, PouleRonde, Ronde, PouleKoppel } from '../../../../model/ronde';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Seizoen } from '../../../../model/seizoen';
import { Btn } from '../../../../model/misc';
import { KoppelSpeler } from '../../../../model/speler';
import { SpeeldagView } from '../speeldag-view/speeldag-view';
import { Button } from '../../../../shared/button/button';
import { NgClass } from '@angular/common';

class AfvalKoppelsPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    koppelsFirst: AfvalKoppel[] = [];
    koppelsSecond: AfvalKoppel[] = [];
    koppelsRest: AfvalKoppel[] = [];
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
    selector: 'app-afval-ronde-planner',
    imports: [
        SpeeldagView,
        Button,
        NgClass
    ],
    templateUrl: './afval-ronde-planner.html',
    styleUrl: './afval-ronde-planner.css',
})
export class AfvalRondePlanner extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: AfvalRonde = new AfvalRonde(0, '', 0, '');
    prevRondeIsPoule: boolean = false;
    prevAfvalRonde: AfvalRonde = new AfvalRonde(0, '', 0, '');
    prevPouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    tePlannenKoppels: AfvalKoppel[] = [];
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
    idxMatch: number = -1;
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
        let dagToAdd = new AfvalDag(this.ronde.maxMatchesPerDag);
        dagToAdd.dagNr = dagNr;
        dagToAdd.dagNaam = this.dater.getDagNaam(dagNr);
        dagToAdd.mogelijkeData = this.dater.getGivenNrOfWeekDaysStartingFrom(dagNr, 4, this.startDatum, true);
        this.ronde.speelDagen.unshift(dagToAdd);
        this.idxSpeelDag = 0;
        if (this.prevRondeIsPoule) {
            this.idxMatch = 0;
            this.selectKoppelKeuze(1);
        }
    }

    speelDagClicked(idx: number) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
            this.setEersteVrijeMatchVanSpeeldag();
        }
    }

    matchClicked(idxDag: number, idxM: number) {
        const matchIngepland = this.ronde.speelDagen[idxDag].dagMatches[idxM].splKoppel.ingepland;
        if (idxDag == this.idxSpeelDag) {
            if (idxM == this.idxMatch) {
                this.idxMatch = -1;
            }
            else {
                this.idxMatch = idxM;
                if (matchIngepland) {
                    this.removeMatchFromSpeelDag(this.idxSpeelDag, this.idxMatch);
                }
            }
        }
        else {
            this.idxSpeelDag = idxDag;
            this.idxMatch = idxM;
            if (matchIngepland) {
                this.removeMatchFromSpeelDag(this.idxSpeelDag, this.idxMatch);
            }
        }
        this.setSelectieKeuzeObvMatch();
    }

    koppelClicked(koppelId: string, idxR: number, idxD: number) {
        const kpl = this.tePlannenKoppels.find(k => k.id == koppelId);
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

    koppelHovered(event: MouseEvent, koppel: AfvalKoppel, kpr: KoppelsPerRang) {
        event.stopPropagation();
        kpr.koppelsPerDagen.forEach(kpd => {
            kpd.idxHovFirst = kpd.koppelsFirst.findIndex(kop => kop.id == koppel.id);
            kpd.idxHovSecond = kpd.koppelsSecond.findIndex(kop => kop.id == koppel.id);
            kpd.idxHovRest = kpd.koppelsRest.findIndex(kop => kop.id == koppel.id);
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
        this.dao.saveAfvalRondeFile(this.header.seizoen, this.ronde.fileNaam, this.ronde)
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
        this.ronde.speelDagen[idx].dagDatum = datum;
    }

    speelDagVerwijderen(idx: number) {
        this.ronde.speelDagen[idx].dagMatches.forEach((m, idxM) => {
            if (m.splKoppel.ingepland) {
                this.removeMatchFromSpeelDag(idx, idxM);
            }
        });
        this.ronde.speelDagen.splice(idx, 1);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Plannen`;

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
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Plannen ${rnd.rndNaam}`;
            this.today = new Date().toISOString().substring(0, 10);
            Promise.all([
                this.dao.getAfvalRondeFile(this.header.seizoen, rnd.fileNaam),
                (idx == 1 ? this.dao.getPouleRondeFile(this.header.seizoen, rndPrev.fileNaam) : this.dao.getAfvalRondeFile(this.header.seizoen, rndPrev.fileNaam))
            ])
            .then(rndFiles => {
                this.ronde = rndFiles[0];
                if (idx == 1) {
                    this.prevRondeIsPoule = true;
                    this.prevPouleRonde = <PouleRonde>rndFiles[1];
                    this.prevRondeBeurtenFinished = 6 * rndPrev.rndBeurten;
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromPouleRonde();
                    this.startDatum = this.getStartDatumFromPouleRonde();
                }
                else {
                    this.prevAfvalRonde = <AfvalRonde>rndFiles[1];
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
                    sd.dagMatches.forEach(dm => {
                        let kop = this.tePlannenKoppels.find(kpl => kpl.id == dm.splKoppelId);
                        if (kop) {
                            dm.splKoppel = kop;
                        }
                        kop = this.tePlannenKoppels.find(kpl => kpl.id == dm.tegKoppelId);
                        if (kop) {
                            dm.tegKoppel = kop;
                        }
                        dm.splKoppel.ingepland = true;
                        dm.tegKoppel.ingepland = true;
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
        if (this.idxSpeelDag < 0 || this.idxMatch < 0) {
            this.alert.showWarning('Kan match niet toevoegen. Er is geen lege match geselecteerd.');
            this.cancelKoppelSelections();
            return;
        }
        // if (this.speelDagIsVol(this.idxSpeelDag)) {
        //     this.alert.showWarning('Kan match niet toevoegen. De geselecteerde speeldag zit al vol.');
        //     this.cancelKoppelSelections();
        //     return;
        // }
        const splKoppel = this.tePlannenKoppels.find(kpl => kpl.id == this.selKoppelIds[0]);
        if (!splKoppel) {
            this.alert.showWarning(`Kan match niet toevoegen. Eerste geselecteerde koppel ${this.selKoppelIds[0]} niet gevonden.`);
            return;
        }
        const tegKoppel = this.tePlannenKoppels.find(kpl => kpl.id == this.selKoppelIds[1]);
        if (!tegKoppel) {
            this.alert.showWarning(`Kan match niet toevoegen. Tweede geselecteerde koppel ${this.selKoppelIds[1]} niet gevonden.`);
            return;
        }
        splKoppel.ingepland = true;
        tegKoppel.ingepland = true;
        let matchToAdd = new AfvalMatch();
        matchToAdd.splKoppel = splKoppel;
        matchToAdd.tegKoppel = tegKoppel;
        matchToAdd.splKoppelId = splKoppel.id;
        matchToAdd.tegKoppelId = tegKoppel.id;
        this.ronde.speelDagen[this.idxSpeelDag].dagMatches[this.idxMatch] = matchToAdd;
        //this.removeMatchKoppelsFromKoppelsPerDagen(matchToAdd);
        this.selKoppelIds = ['', ''];
        this.setVolgendeVrijeMatch();
    }

    private removeMatchFromSpeelDag(idxDag: number, idxMatch: number) {
        const match = this.ronde.speelDagen[idxDag].dagMatches[idxMatch];
        match.splKoppel.ingepland = false;
        match.tegKoppel.ingepland = false;
        // [match.splKoppel, match.tegKoppel].forEach((matchKpl, idx) => {
        //     this.koppelsPerRang[matchKpl.pouleRang - 1].koppelsPerDagen.forEach(kpd => {
        //         if (matchKpl.koppel.voorkeurDagen.includes(kpd.dagNr)) {
        //             if (matchKpl.koppel.voorkeurDagen[0] == kpd.dagNr) {
        //                 kpd.koppelsFirst.push(matchKpl);
        //                 kpd.koppelsFirst.sort(this.compareAfvalKoppels);
        //             }
        //             else if (matchKpl.koppel.voorkeurDagen[1] == kpd.dagNr) {
        //                 kpd.koppelsSecond.push(matchKpl);
        //                 kpd.koppelsSecond.sort(this.compareAfvalKoppels);
        //             }
        //             else {
        //                 kpd.koppelsRest.push(matchKpl);
        //                 kpd.koppelsRest.sort(this.compareAfvalKoppels);
        //             }
        //         }
        //     });
        // });
        this.ronde.speelDagen[idxDag].dagMatches[idxMatch] = new AfvalMatch();
    }

    private removeMatchKoppelsFromKoppelsPerDagen(match: AfvalMatch) {
        this.koppelsOpScherm.forEach((kos, idxKos) => {
            let kopId = (idxKos == 0) ? match.splKoppelId : match.tegKoppelId;
            kos.koppelsPerDagen.forEach(kpd => {
                kpd.idxFirst = -1;
                kpd.idxSecond = -1;
                kpd.idxRest = -1;
                kpd.koppelsFirst = kpd.koppelsFirst.filter(kp => kp.id != kopId);
                kpd.koppelsSecond = kpd.koppelsSecond.filter(kp => kp.id != kopId);
                kpd.koppelsRest = kpd.koppelsRest.filter(kp => kp.id != kopId);
            });
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
                    if (kpl.pouleRang == rang && kpl.koppel.voorkeurDagen.includes(kpd.dagNr)) {
                        if (kpl.koppel.voorkeurDagen[0] == kpd.dagNr) {
                            kpd.koppelsFirst.push(kpl);
                        }
                        else if (kpl.koppel.voorkeurDagen[1] == kpd.dagNr) {
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

    private getTePlannenKoppelsFromPouleRonde(): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];
        this.prevPouleRonde.poules.forEach(poule => {
            if (poule.pouleKoppels.every(pk => pk.uitslag.brt == this.prevRondeBeurtenFinished)) {
                this.aantPoulesFinished++;
                result.push(...this.getAfvalKoppelsFromPoule(poule));
            }
        });
        return result;
    }

    private getTePlannenKoppelsFromAfvalRonde(): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];

        return result;        
    }

    private getStartDatumFromPouleRonde(): string {
        let result = '';
        this.prevPouleRonde.poules.forEach(poule => {
            if (poule.pouleDatum > result) {
                result = poule.pouleDatum;
            }
        });
        result = (result < this.today) ? this.today : result;
        return result;
    }

    private getStartDatumFromAfvalRonde(): string {
        let result = '';
        this.prevAfvalRonde.speelDagen.forEach(dag => {
            if (dag.dagDatum > result) {
                result = dag.dagDatum;
            }
        });
        result = (result < this.today) ? this.today : result;
        return result;
    }

    private setEersteVrijeMatchVanSpeeldag() {
        const idx = this.ronde.speelDagen[this.idxSpeelDag].dagMatches.findIndex(dm => !dm.splKoppel.ingepland);
        if (idx >= 0) {
            this.idxMatch = idx;
            this.setSelectieKeuzeObvMatch();
        }
    }

    private setVolgendeVrijeMatch() {
        let idxSpd = this.idxSpeelDag;
        let idxM = this.idxMatch;
        let ready = false;
        while (!ready) {
            idxM++;
            if (idxM >= this.ronde.maxMatchesPerDag) {
                idxM = 0;
                idxSpd++;
                if (idxSpd >= this.ronde.speelDagen.length) {
                    idxSpd = 0;
                }
            }
            if (idxSpd == this.idxSpeelDag && idxM == this.idxMatch) {
                ready = true;
                this.idxSpeelDag = -1;
                this.idxMatch = -1;
            }
            else {
                if (!this.ronde.speelDagen[idxSpd].dagMatches[idxM].splKoppel.ingepland) {
                    this.idxSpeelDag = idxSpd;
                    this.idxMatch = idxM;
                    this.setSelectieKeuzeObvMatch();
                    ready = true;
                }
            }
        }
    }

    private getAfvalKoppelsFromPoule(pl: Poule): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];
        pl.pouleKoppels.sort(this.comparePouleKoppels);
        pl.pouleKoppels.forEach((kpl, idx) => {
            let kop = new AfvalKoppel();
            kop.id = kpl.koppel.kopId;
            kop.koppel = kpl.koppel;
            kop.koppel.kopMoyenne = kpl.uitslag.moy;
            kop.pouleId = pl.pouleId;
            kop.pouleRang = idx + 1;
            kop.koppel.spelers.forEach(spl => {
                const pouleSpl = kpl.spelers.find(sp => sp.speler.splId == spl.splId);
                if (pouleSpl) {
                    spl.splMoy = pouleSpl.uitslag.moy;
                }
            });
            kop.koppel.spelers.sort(this.compareKoppelSpelers);
            result.push(kop);
        });
        return result;
    }

    private setSelectieKeuzeObvMatch() {
        if (this.idxMatch < 0) {
            return;
        }
        if ((this.idxMatch == 0 || this.idxMatch == 3) && this.selectieKeuze == 0) {
            this.selectKoppelKeuze(1);
            return;
        }
        if ((this.idxMatch == 1 || this.idxMatch == 2) && this.selectieKeuze == 1) {
            this.selectKoppelKeuze(0);
            return;
        }
    }

    private speelDagIsVol(idx: number): boolean {
        if (idx < 0 || idx >= this.ronde.speelDagen.length) {
            return true;
        }
        return this.ronde.speelDagen[idx].dagMatches.every(dm => dm.splKoppel.ingepland);
    }

    private compareSpeelDagen(a: AfvalDag, b: AfvalDag): number {
        if (a.dagDatum == b.dagDatum) {
            return 0;
        }
        if (a.dagDatum == '') {
            return 1;
        }
        if (b.dagDatum == '') {
            return -1;
        }
        return (a.dagDatum < b.dagDatum) ? -1 : 1;
    }

    private comparePouleKoppels(a: PouleKoppel, b: PouleKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            if ((b.uitslag.moy / b.koppel.kopMoyenne) == (a.uitslag.moy / a.koppel.kopMoyenne)) {
                return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
            }
            else {
                return (b.uitslag.moy / b.koppel.kopMoyenne) - (a.uitslag.moy / a.koppel.kopMoyenne);
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
