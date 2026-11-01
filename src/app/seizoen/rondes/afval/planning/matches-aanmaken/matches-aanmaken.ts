import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Helper } from '../../../../../services/helper';
import { KoppelSpelerUitslagen, RondeKoppel } from '../../../../../model/koppel';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { Btn, Uitslag } from '../../../../../model/misc';
import { KoppelSpeler } from '../../../../../model/speler';
import { Button } from '../../../../../shared/button/button';
import { SpeeldagView } from '../../speeldag-view/speeldag-view';
import { DecimalPipe, NgClass } from '@angular/common';
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

@Component({
    selector: 'app-matches-aanmaken',
    imports: [
        SpeeldagView,
        Button,
        ConfirmDialog,
        NgClass,
        DecimalPipe
    ],
    templateUrl: './matches-aanmaken.html',
    styleUrl: './matches-aanmaken.css',
})
export class MatchesAanmaken extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    helper = inject(Helper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    prevRonde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    prevAfvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    tePlannenKoppels: RondeKoppel[] = [];
    koppelsPerDagen: RondeKoppelsPerDag[] = [];
    idxSpeelDag: number = -1;
    idxMatch: number = -1;
    idxVkDag: number = -1;
    selKoppelIds: string[] = ['', ''];
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
        this.setUpdateStatus();
    }

    speelDagClicked(idx: number) {
        if (idx != this.idxSpeelDag) {
            this.idxSpeelDag = idx;
            this.setEersteVrijeMatchVanSpeeldag();
        }
    }

    koppelClicked(koppelId: string) {
        const kpl = this.tePlannenKoppels.find(k => k.kopId == koppelId);
        if (kpl && kpl.ingepland) {
            return;
        }
        if (this.selKoppelIds.includes(koppelId)) {
            this.deselectKoppel();
        }
        else {
            this.selectKoppel(koppelId);
        }
    }

    koppelHovered(event: MouseEvent, koppel: RondeKoppel) {
        event.stopPropagation();
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxHovFirst = kpd.koppelsFirst.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxHovSecond = kpd.koppelsSecond.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxHovRest = kpd.koppelsRest.findIndex(kop => kop.kopId == koppel.kopId);
        });
    }
    
    clearHovered() {
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxHovFirst = kpd.idxHovSecond = kpd.idxHovRest = -1;
        });
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
            this.touched = false;
            if (this.afvalRonde.status.gepland != this.ronde.status.gepland) {
                this.ronde.status.gepland = this.afvalRonde.status.gepland;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    this.alert.showSuccess(resp.message);
                    this.idxSpeelDag = -1;
                    if (andNext) {
                        this.nextClicked();
                    }
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showSuccess(resp.message);
                this.idxSpeelDag = -1;
                if (andNext) {
                    this.nextClicked();
                }    
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

        const id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        console.log('Aanmaken matches ronde : ' + id);
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
                this.alert.showError(`Ronde met ID '${rondeId}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.prevRonde = this.rondes[idx - 1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Matches aanmaken`;
            this.today = new Date().toISOString().substring(0, 10);
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, this.prevRonde.fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            ])
            .then(rndFiles => {
                this.prevAfvalRonde = rndFiles[0];
                this.afvalRonde = rndFiles[1];
                console.log(this.afvalRonde);
                if (!this.prevAfvalRonde.status.gereed) {
                    this.alert.showWarning('Kan planning niet uitvoeren. Vorige ronde is nog niet afgewerkt.');
                    return;
                }
                if (this.afvalRonde.koppels.length == 0) {
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromPrevAfvalRonde();
                }
                else {
                    this.tePlannenKoppels = JSON.parse(JSON.stringify(this.afvalRonde.koppels));
                }
                this.prevAfvalRonde = new SpeelRonde(0, '', '', 0, '');
                this.afvalRonde.maxDagen = (this.tePlannenKoppels.length / 2) / this.afvalRonde.maxMatchesPerDag;
                if (this.afvalRonde.maxDagen < 1) {
                    this.afvalRonde.maxDagen = 1;
                }
                this.fillKoppelsPerDagen();
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
                                else {
                                    const errKop = new RondeKoppel();
                                    errKop.kopId = id;
                                    errKop.pouleId = '?';
                                    match.koppels.push(errKop);
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

    private fillKoppelsPerDagen() {
        this.config.speelDagen.forEach((sdag) => {
            let kpd = new RondeKoppelsPerDag();
            kpd.dagNr = sdag.dagNr;
            kpd.dagNaam = sdag.dagNaam;
            this.tePlannenKoppels.forEach(koppel => {
                if (koppel.voorkeurDagen.includes(kpd.dagNr)) {
                    if (koppel.voorkeurDagen[0] == kpd.dagNr) {
                        kpd.koppelsFirst.push(koppel);
                    }
                    else if (koppel.voorkeurDagen[1] == kpd.dagNr) {
                        kpd.koppelsSecond.push(koppel);
                    }
                    else {
                        kpd.koppelsRest.push(koppel);
                    }
                }
            });
            this.koppelsPerDagen.push(kpd);
        });
    }

    private getTePlannenKoppelsFromPrevAfvalRonde(): RondeKoppel[] {
        let result: RondeKoppel[] = JSON.parse(JSON.stringify(this.prevAfvalRonde.koppels));
        result = result.filter(kop => !kop.afgevallen);
        result.forEach(kop => {
            kop.ingepland = false;
            this.addUitslagToOtherUitslag(kop.uitslag, kop.totNuToe);
            kop.uitslag = new Uitslag();
            kop.splUitslagen.forEach(splUit => {
                this.addUitslagToOtherUitslag(splUit.uitslag, splUit.totNuToe);
                splUit.uitslag = new Uitslag();
            });
            if (this.ronde.moyBepalen) {
                kop.kopMoyenne = kop.totNuToe.moy;
                kop.spelers.forEach((spl, idx) => {
                    spl.splMoy = kop.splUitslagen[idx].totNuToe.moy;
                    spl.splHand = this.helper.getHandicap(spl.splMoy);
                });
                if (kop.spelers[0].splMoy > kop.spelers[1].splMoy) {
                    const tempSpl: KoppelSpeler = JSON.parse(JSON.stringify(kop.spelers[0]));
                    kop.spelers[0] = kop.spelers[1];
                    kop.spelers[1] = tempSpl;
                    const tempUit: KoppelSpelerUitslagen = JSON.parse(JSON.stringify(kop.splUitslagen[0]));
                    kop.splUitslagen[0] = kop.splUitslagen[1];
                    kop.splUitslagen[1] = tempUit;
                }
            }
        });
        return result;
    }

    private selectKoppel(id: string) {
        if (this.selKoppelIds[0] == '') {
            this.selKoppelIds[0] = id;
            return;
        }
        if (this.selKoppelIds[1] == '') {
            this.selKoppelIds[1] = id;
            this.addMatchToSpeelDag();
        }
    }

    private deselectKoppel() {
        this.selKoppelIds[0] = '';
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
        this.selKoppelIds = ['', ''];
        this.setVolgendeVrijeMatch();
        this.clearHovered();
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
        this.selKoppelIds = ['', ''];
    }

    private setEersteVrijeMatchVanSpeeldag() {
        const idx = this.afvalRonde.speelDagen[this.idxSpeelDag].matches.findIndex(ma => !ma.koppels[0].ingepland);
        if (idx >= 0) {
            this.idxMatch = idx;
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

}
