import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { Btn, Uitslag } from '../../../../../model/misc';
import { NgClass } from '@angular/common';
import { SpeeldagView } from '../../speeldag-view/speeldag-view';
import { Button } from '../../../../../shared/button/button';
import { ConfirmKoppelsDialogType } from '../../../../../model/dialogs';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';

class RondeKoppelsPerDag {
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
    koppelsPerDagen: RondeKoppelsPerDag[] = [];

    constructor(nr: number) {
        this.rang = nr;
    }
}

@Component({
    selector: 'app-matches-aanmaken-r2',
    imports: [
        SpeeldagView,
        ConfirmDialog,
        Button,
        NgClass
    ],
    templateUrl: './matches-aanmaken-r2.html',
    styleUrl: './matches-aanmaken-r2.css',
})
export class MatchesAanmakenR2 extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    prevRonde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    tePlannenKoppels: RondeKoppel[] = [];
    koppelsPerRang: KoppelsPerRang[] = [];
    koppelsOpScherm: KoppelsPerRang[] = [];
    rangenOpScherm: number[] = [];
    tabKeuze: number = 0;
    idxVkDag: number[] = [-1, -1];
    selKoppelIds: string[] = ['', ''];
    idxSpeelDag: number = -1;
    idxMatch: number = -1;
    today: string = '';
    touched: boolean = false;
    alleMatchesToegekend: boolean = false;
    alleDataToegekend: boolean = false;
    confirmKoppels: ConfirmKoppelsDialogType = new ConfirmKoppelsDialogType();

    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveNext: Btn = new Btn('savenext', 'Opslaan en naar speeldata');
    btnNext: Btn = new Btn('next', 'Naar speeldata', 'enter');
    btnKpls: Btn = new Btn('kpls', 'Koppels', 'K', 1);

    tabKeuzeClicked(nr: number) {
        if (nr != this.tabKeuze) {
            this.selectTabKeuze(nr);
        }
    }

    speelDagToevoegenClicked(dagNr: number) {
        if (this.afvalRonde.speelDagen.length == this.afvalRonde.maxDagen) {
            this.alert.showWarning('Het maximale aantal speeldagen is bereikt.');
            return;
        }
        let dagToAdd = new RondeSpeelDag(this.afvalRonde.maxMatchesPerDag);
        dagToAdd.dagNr = dagNr;
        dagToAdd.dagNaam = this.dater.getDagNaam(dagNr);
        dagToAdd.mogelijkeData = this.dater.getWeekDaysInPeriod(dagNr, this.ronde.periode);
        this.afvalRonde.speelDagen.unshift(dagToAdd);
        this.idxSpeelDag = 0;
        this.idxMatch = 0;
        this.selectTabKeuze(1);
        this.setUpdateStatus();
    }

    speelDagClicked(idx: number) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
            this.setEersteVrijeMatchVanSpeeldag();
        }
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

    matchClicked(idxDag: number, idxM: number) {
        const matchIngepland = this.afvalRonde.speelDagen[idxDag].matches[idxM].koppels[0].ingepland;
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
        this.setTabKeuzeObvMatch();
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

    opslaanClicked(andNext?: boolean) {
        this.afvalRonde.koppels = this.tePlannenKoppels;
        this.afvalRonde.speelDagen.sort(this.compareSpeelDagen);
        this.afvalRonde.status.gepland = this.alleMatchesToegekend && this.alleDataToegekend;
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        rondeToSave.speelDagen.forEach(sd => {
            sd.matches.forEach(ma => {
                ma.koppelIds = ma.koppels.map(kpl => kpl.kopId);
                ma.koppels = [];
            });
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.idxSpeelDag = -1;
            this.touched = false;
            if (andNext) {
                this.nextClicked();
            }
})
        .catch(err => {
            this.alert.showError(err);
        });
    }

    nextClicked() {
        const urlTo = this.router.url.replace('planner', 'data');
        this.gotoPage(urlTo, this.router.url);
    }

    naarKoppelsClicked() {
        if (!this.afvalRonde.koppels.length) {
            return;
        }
        if (this.touched) {
            this.confirmKoppels.open = true;
        }
        else {
            this.confirmKoppelsReplied(true);
        }
    }

    confirmKoppelsReplied(confirmed: boolean) {
        this.confirmKoppels.open = false;
        if (confirmed) {
            this.gotoPage(`rondes/${this.ronde.rndId}/koppels`, this.router.url);
        }
    }

    datumGewijzigd(idx: number, datum: string) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
        }
        this.afvalRonde.speelDagen[idx].datum = datum;
    }

    speelDagVerwijderen(idx: number) {
        this.afvalRonde.speelDagen[idx].matches.forEach((m, idxM) => {
            if (m.koppels[0].ingepland) {
                this.removeMatchFromSpeelDag(idx, idxM);
            }
        });
        this.afvalRonde.speelDagen.splice(idx, 1);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Plannen`;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            this.prevRonde = this.rondes[0];
            this.ronde = this.rondes[1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Matches aanmaken`;
            this.today = new Date().toISOString().substring(0, 10);
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, this.prevRonde.fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            ])
            .then(rndFiles => {
                this.pouleRonde = rndFiles[0];
                this.afvalRonde = rndFiles[1];
                if (!this.pouleRonde.status.gereed) {
                    this.alert.showWarning('Kan planning niet uitvoeren. Vorige ronde is nog niet afgewerkt.');
                    return;
                }
                this.pouleRonde.poules.forEach(poule => {
                    poule.koppels = [];
                    let maxKoppels = poule.koppelIds.length;
                    while (maxKoppels--) poule.koppels.push(new RondeKoppel()); 
                    poule.koppelIds.forEach((kplId, idx) => {
                        if (kplId != '') {
                            const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                            if (foundKoppel) {
                                foundKoppel.pouleId = poule.id;
                                poule.koppels[idx] = foundKoppel;
                            }
                        }
                    });
                    poule.koppels.sort(this.comparePouleKoppels);
                    poule.koppels.forEach((kpl, idx) => {
                        kpl.pouleRang = idx + 1;
                    });
                });
                this.tePlannenKoppels = this.getTePlannenKoppelsFromPouleRonde();
                this.afvalRonde.maxDagen = (this.tePlannenKoppels.length / 2) / this.afvalRonde.maxMatchesPerDag;
                if (this.afvalRonde.maxDagen < 1) {
                    this.afvalRonde.maxDagen = 1;
                }
                this.fillKoppelsPerRangPerDag();
                this.selectTabKeuze(0);
                this.afvalRonde.speelDagen.forEach(sd => {
                    sd.matches.forEach(match => {
                        match.koppelIds.forEach(id => {
                            if (id == '') {
                                match.koppels.push(new RondeKoppel());
                            }
                            else {
                                const kop = this.tePlannenKoppels.find(kpl => kpl.kopId == id);
                                if (kop) {
                                    kop.ingepland = true;
                                    match.koppels.push(kop);
                                }        
                            }
                        });
                    });
                });
                this.setUpdateStatus();
                this.touched = this.afvalRonde.koppels.length ? false : true;
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private clearAllHovered() {
        this.koppelsPerRang.forEach(kpr => {
            this.clearHovered(kpr);
        }); 
    }

    private selectKoppel(id: string, idxR: number, idxD: number) {
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
        if (this.speelDagIsVol(this.idxSpeelDag)) {
            this.alert.showWarning('Kan match niet toevoegen. De geselecteerde speeldag zit al vol.');
            this.cancelKoppelSelections();
            return;
        }
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
        let matchToAdd = new RondeMatch(splKoppel, tegKoppel);
        this.afvalRonde.speelDagen[this.idxSpeelDag].matches[this.idxMatch] = matchToAdd;
        //this.removeMatchKoppelsFromKoppelsPerDagen(matchToAdd);
        this.selKoppelIds = ['', ''];
        this.setVolgendeVrijeMatch();
        this.clearAllHovered();
        this.setUpdateStatus();
    }

    private removeMatchFromSpeelDag(idxDag: number, idxMatch: number) {
        const match = this.afvalRonde.speelDagen[idxDag].matches[idxMatch];
        match.koppels.forEach((matchKpl, idx) => {
            matchKpl.ingepland = false;
        });
        this.afvalRonde.speelDagen[idxDag].matches[idxMatch] = new RondeMatch(new RondeKoppel(), new RondeKoppel());
        this.setUpdateStatus();
    }

    private cancelKoppelSelections() {
        this.idxVkDag = [-1, -1];
        this.selKoppelIds = ['', ''];
    }

    private setEersteVrijeMatchVanSpeeldag() {
        const idx = this.afvalRonde.speelDagen[this.idxSpeelDag].matches.findIndex(ma => !ma.koppels[0].ingepland);
        if (idx >= 0) {
            this.idxMatch = idx;
            this.setTabKeuzeObvMatch();
        }
    }

    private setVolgendeVrijeMatch() {
        let idxSpd = this.idxSpeelDag;
        let idxM = this.idxMatch;
        let ready = false;
        while (!ready) {
            idxM++;
            if (idxM >= this.afvalRonde.maxMatchesPerDag) {
                idxM = 0;
                idxSpd++;
                if (idxSpd >= this.afvalRonde.speelDagen.length) {
                    idxSpd = 0;
                }
            }
            if (idxSpd == this.idxSpeelDag && idxM == this.idxMatch) {
                ready = true;
                this.idxSpeelDag = -1;
                this.idxMatch = -1;
            }
            else {
                if (!this.afvalRonde.speelDagen[idxSpd].matches[idxM].koppels[0].ingepland) {
                    this.idxSpeelDag = idxSpd;
                    this.idxMatch = idxM;
                    this.setTabKeuzeObvMatch();
                    ready = true;
                }
            }
        }
    }

    private speelDagIsVol(idx: number): boolean {
        if (idx < 0 || idx >= this.afvalRonde.speelDagen.length) {
            return true;
        }
        return this.afvalRonde.speelDagen[idx].matches.every(ma => ma.koppels[0].ingepland);
    }

    private setTabKeuzeObvMatch() {
        if (this.idxMatch < 0) {
            return;
        }
        if ((this.idxMatch == 0 || this.idxMatch == 3) && this.tabKeuze == 0) {
            this.selectTabKeuze(1);
            return;
        }
        if ((this.idxMatch == 1 || this.idxMatch == 2) && this.tabKeuze == 1) {
            this.selectTabKeuze(0);
            return;
        }
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
                let kpd = new RondeKoppelsPerDag();
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
        this.pouleRonde.poules.forEach(poule => {
            poule.koppels.forEach(kpl => {
                let koppel = new RondeKoppel();
                Object.assign(koppel, kpl);
                koppel.matches = [];
                koppel.kopMoyenne = kpl.uitslag.moy;
                koppel.spelers[0].splMoy = kpl.splUitslagen[0].uitslag.moy;
                koppel.spelers[1].splMoy = kpl.splUitslagen[1].uitslag.moy;
                koppel.splUitslagen[0].totNuToe = kpl.splUitslagen[0].uitslag;
                koppel.splUitslagen[1].totNuToe = kpl.splUitslagen[1].uitslag;
                koppel.splUitslagen[0].uitslag = new Uitslag();
                koppel.splUitslagen[1].uitslag = new Uitslag();
                result.push(koppel);
            });
        });
        return result;
    }

    private selectTabKeuze(nr: number) {
        this.koppelsOpScherm = [];
        this.tabKeuze = nr;
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
    }

    private setUpdateStatus() {
        this.alleMatchesToegekend = this.tePlannenKoppels.every(kpl => kpl.ingepland);
        this.alleDataToegekend = this.afvalRonde.speelDagen.every(sd => sd.datum != '');
        this.touched = true;
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
            if (a.uitslag.weds == b.uitslag.weds) {
                if ((b.uitslag.moy / b.kopMoyenne) == (a.uitslag.moy / a.kopMoyenne)) {
                    return b.kopMoyenne - a.kopMoyenne;
                }
                else {
                    return (b.uitslag.moy / b.kopMoyenne) - (a.uitslag.moy / a.kopMoyenne);
                }
            }
            else {
                return a.uitslag.weds - b.uitslag.weds;
            }
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

}
