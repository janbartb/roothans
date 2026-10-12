import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';
import { Button } from '../../../../../shared/button/button';
import { WedSpelerStand, Wedstrijd } from '../../../../../model/wedstrijd';
import { ConfirmDialogType } from '../../../../../model/dialogs';
import { Btn } from '../../../../../model/misc';
import { AfvalMatchView } from '../../../../../shared/afval-match-view/afval-match-view';

@Component({
    selector: 'app-afval-match',
    imports: [
        AfvalMatchView,
        ConfirmDialog,
        Button
    ],
    templateUrl: './afval-match.html',
    styleUrl: './afval-match.css',
})
export class AfvalMatch extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    wedstrijd: Wedstrijd = new Wedstrijd();
    confirmOpnieuw: ConfirmDialogType = new ConfirmDialogType('Opnieuw starten');
    today: string = '';
    koppels: RondeKoppel[] = [];
    idxKop: number = -1;
    idxWed: number = -1;
    idxWedBezig: number = -1;
    wedGespeeld: boolean = false;
    dataReady: boolean = false;

    btnNaar: Btn = new Btn('naar', 'Bekijken', 'enter');
    btnStart: Btn = new Btn('start', 'Starten', 'enter');
    btnVervolg: Btn = new Btn('vervolg', 'Vervolg', 'enter');
    btnOpnieuw: Btn = new Btn('opnieuw', 'Start opnieuw', 'S', 1);
    btnAdd: Btn = new Btn('toev', 'Uitslag invoeren', 'U', 1);

    enterPressed() {
        if (this.wedGespeeld) {
            this.buttonPressed(this.btnNaar);
        }
        else if (this.idxWed == this.idxWedBezig) {
            this.buttonPressed(this.btnVervolg);
        }
        else {
            this.buttonPressed(this.btnStart);
        }
    }

    wedstrijdNrPressed(nr: number) {
        this.wedstrijdClicked(nr - 1);
    }

    naarWedstrijdClicked() {
        if (this.wedGespeeld) {
            this.gotoPage(this.router.url + '/' + this.idxWed, this.router.url);
        }
        else {
            this.gotoPage(this.router.url + '/' + this.idxWed + '/score', this.router.url);
        }
    }

    startOpnieuwClicked() {
        this.confirmOpnieuw.texts[0] = `Wedstrijd ${this.idxWed + 1} opnieuw starten?`
        this.confirmOpnieuw.open = true;
    }

    startOpnieuwReplied(confirmed: boolean) {
        if (confirmed) {
            this.wedstrijd.volgordeOk = false;
            this.wedstrijd.spelers.forEach(spl => {
                spl.actief = false;
                spl.stand = new WedSpelerStand();
            });
            this.dao.saveWedstrijd(this.wedstrijd)
            .then(resp => {
                this.naarWedstrijdClicked();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.confirmOpnieuw.open = false;
    }

    uitslagToevoegenClicked() {
        this.gotoPage(this.router.url + '/' + this.idxWed, this.router.url);
    }

    wedstrijdClicked(idx: number) {
        this.selectWedstrijd(idx);
        this.naarWedstrijdClicked();
    }

    keyboardClicked(idx: number) {
        this.selectWedstrijd(idx);
        if (!this.wedGespeeld) {
            this.uitslagToevoegenClicked();
        }
    }

    showMatchViewError(err: string) {
        this.alert.showError(err);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.confirmOpnieuw.open) {
            return false;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.moveUp();
            }
            if (event.key === 'ArrowDown') {
                this.moveDown();
            }
            return false;
        }
        if (event.key >= '1' && event.key <= '2') {
            this.wedstrijdNrPressed(Number(event.key));
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyS') {
            if (!this.wedGespeeld && this.idxWed == this.idxWedBezig) {
                this.buttonPressed(this.btnOpnieuw);
            }
            return false;
        }
        if (event.code === 'KeyU') {
            if (!this.wedGespeeld) {
                this.buttonPressed(this.btnAdd);
            }
            return false;
        }
        if (event.key === 'Home') {
            this.gotoHome();
            return false;
        }
        return true;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Wedstrijden`;

        let id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);

        id = this.route.snapshot.paramMap.get('dagId');
        if (!id) {
            this.alert.showError('Kan dag ID in URL niet vinden.');
            return;
        }
        const dagId = id;

        id = this.route.snapshot.paramMap.get('splKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 1 in URL niet vinden.');
            return;
        }
        const splKopId = id;

        id = this.route.snapshot.paramMap.get('tegKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 2 in URL niet vinden.');
            return;
        }
        const tegKopId = id;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getWedstrijd()
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idxRonde < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idxRonde];
            this.today = new Date().toISOString().substring(0, 10);
            this.header.datum = this.dater.dateReverse(this.today);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                console.log(this.afvalRonde);
                const idxDag = this.afvalRonde.speelDagen.findIndex(sdag => sdag.dagId == dagId);
                if (idxDag < 0) {
                    this.alert.showError(`Speeldag met ID '${dagId}' niet gevonden.`);
                    return;
    
                }
                const dag = this.afvalRonde.speelDagen[idxDag];
                const idxMatch = dag.matches.findIndex(mat => mat.koppelIds.includes(splKopId) && mat.koppelIds.includes(tegKopId));
                if (idxMatch < 0) {
                    this.alert.showError(`AfvalMatch met koppel IDs '${splKopId} - ${tegKopId}' niet gevonden.`);
                    return;
                }
                this.match = dag.matches[idxMatch];
                this.match.koppelIds.forEach((kplId, idx) => {
                    if (kplId != '') {
                        const foundKoppel = this.afvalRonde.koppels.find(kpl => kpl.kopId == kplId);
                        if (foundKoppel) {
                            this.match.koppels[idx] = foundKoppel;
                        }
                    }
                });
                this.koppels = this.match.koppels;
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Afval match : ` + 
                                        `koppels ${this.match.koppels[0].kopId} - ${this.match.koppels[1].kopId}`;
                this.preselectWedstrijd();
                if (results[2].gevonden) {
                    this.wedstrijd = results[2].wedstrijd;
                    this.checkIfWedAlGestart();
                }
                this.confirmOpnieuw.texts.push('Wedstrijd opnieuw starten?');
                this.confirmOpnieuw.texts.push('Huidige tussenstand gaat verloren.');
                this.dataReady = true;
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.key.key == 'enter') {
                    this.naarWedstrijdClicked();
                }
                else if (btn.key.key == 'S') {
                    this.startOpnieuwClicked();
                }
                else if (btn.key.key == 'U') {
                    this.uitslagToevoegenClicked();
                }
            }, 250);
        }, 250);
    }

    private checkIfWedAlGestart() {
        this.idxWedBezig = -1;
        if (this.wedstrijd.rondeId != this.ronde.rndId || this.wedstrijd.wedGespeeld || this.wedstrijd.spelers[0].stand.aantBrt == 0) {
            return;
        }
        const wedSplIds = [this.wedstrijd.spelers[0].splId, this.wedstrijd.spelers[1].splId];
        if (wedSplIds.includes(this.koppels[0].spelers[0].splId)) {
            this.idxWedBezig = 0;
            return;
        }
        if (wedSplIds.includes(this.koppels[0].spelers[1].splId)) {
            this.idxWedBezig = 1;
            return;
        }
    }

    private preselectWedstrijd() {
        if (this.koppels[0].splUitslagen[0].uitslag.brt == 0) {
            this.selectWedstrijd(0);
            return;
        }
        if (this.koppels[0].splUitslagen[1].uitslag.brt == 0) {
            this.selectWedstrijd(1);
            return;
        }
        this.selectWedstrijd(0);
    }

    private selectWedstrijd(idx: number) {
        this.idxWed = idx;
        this.wedGespeeld = this.koppels[0].splUitslagen[idx].uitslag.brt > 0;
    }

    private moveUp() {
        if (this.idxWed <= 0) {
            this.selectWedstrijd(1);
        }
        else {
            this.selectWedstrijd(this.idxWed - 1);
        }
    }

    private moveDown() {
        if (this.idxWed >= 1) {
            this.selectWedstrijd(0);
        }
        else {
            this.selectWedstrijd(this.idxWed + 1);
        }
    }

}
