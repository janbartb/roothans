import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../services/date-helper';
import { Seizoen } from '../../../model/seizoen';
import { Poule, SpeelRonde, Ronde } from '../../../model/ronde';
import { Btn } from '../../../model/misc';
import { Button } from '../../../shared/button/button';
import { MatchView } from '../../../shared/match-view/match-view';
import { WedSpelerStand, Wedstrijd } from '../../../model/wedstrijd';
import { ConfirmDialogType } from '../../../model/dialogs';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { RondeKoppel } from '../../../model/koppel';

@Component({
    selector: 'app-poule-ronde-match',
    imports: [
        MatchView,
        ConfirmDialog,
        Button
    ],
    templateUrl: './poule-ronde-match.html',
    styleUrl: './poule-ronde-match.css',
})
export class PouleRondeMatch extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poule: Poule = new Poule(0);
    koppels: RondeKoppel[] = [];
    wedstrijd: Wedstrijd = new Wedstrijd();
    confirmOpnieuw: ConfirmDialogType = new ConfirmDialogType('Opnieuw starten');
    matchVolgNr: number = 0;
    idxKop: number = -1;
    idxWed: number = -1;
    idxWedBezig: number = -1;
    today: string = '';
    wedGespeeld: boolean = false;
    dataReady: boolean = false;

    btnNaar: Btn = new Btn('naar', 'Bekijken', 'enter');
    btnStart: Btn = new Btn('start', 'Starten', 'enter');
    btnVervolg: Btn = new Btn('vervolg', 'Vervolg', 'enter');
    btnOpnieuw: Btn = new Btn('opnieuw', 'Start opnieuw', 'S', 1);
    btnAdd: Btn = new Btn('toev', 'Uitslag invoeren', 'U', 1);

    // enterPressed() {
    //     if (this.wedGespeeld) {
    //         this.buttonPressed(this.btnNaar);
    //     }
    //     else if (this.idxWed == this.idxWedBezig) {
    //         this.buttonPressed(this.btnVervolg);
    //     }
    //     else {
    //         this.buttonPressed(this.btnStart);
    //     }
    // }

    // wedstrijdNrPressed(nr: number) {
    //     this.wedstrijdClicked(nr - 1);
    // }

    // naarWedstrijdClicked() {
    //     if (this.wedGespeeld) {
    //         this.gotoPage(this.router.url + '/' + this.idxWed, this.router.url);
    //     }
    //     else {
    //         this.gotoPage(this.router.url + '/' + this.idxWed + '/score', this.router.url);
    //     }
    // }

    // startOpnieuwClicked() {
    //     this.confirmOpnieuw.texts[0] = `Wedstrijd ${this.idxWed + 1} opnieuw starten?`
    //     this.confirmOpnieuw.open = true;
    // }

    // startOpnieuwReplied(confirmed: boolean) {
    //     if (confirmed) {
    //         this.wedstrijd.volgordeOk = false;
    //         this.wedstrijd.spelers.forEach(spl => {
    //             spl.actief = false;
    //             spl.stand = new WedSpelerStand();
    //         });
    //         this.dao.saveWedstrijd(this.wedstrijd)
    //         .then(resp => {
    //             this.naarWedstrijdClicked();
    //         })
    //         .catch(err => {
    //             this.alert.showError(err);
    //         });
    //     }
    //     this.confirmOpnieuw.open = false;
    // }

    // uitslagToevoegenClicked() {
    //     this.gotoPage(this.router.url + '/' + this.idxWed, this.router.url);
    // }

    // wedstrijdClicked(idx: number) {
    //     this.selectWedstrijd(idx);
    // }

    // showMatchViewError(err: string) {
    //     this.alert.showError(err);
    // }

    // @HostListener('document:keyup', ['$event'])
    // handleKeyboardEvent(event: KeyboardEvent): boolean {
    //     console.log(event.code + ' : ' + event.key);
    //     if (this.confirmOpnieuw.open) {
    //         return false;
    //     }
    //     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    //         if (event.key === 'ArrowUp') {
    //             this.moveUp();
    //         }
    //         if (event.key === 'ArrowDown') {
    //             this.moveDown();
    //         }
    //         return false;
    //     }
    //     if (event.key >= '1' && event.key <= '2') {
    //         this.wedstrijdNrPressed(Number(event.key));
    //     }
    //     if (event.key === 'Enter') {
    //         this.enterPressed();
    //         return false;
    //     }
    //     if (event.key === 'Escape') {
    //         this.escapePressed();
    //         return false;
    //     }
    //     if (event.code === 'KeyS') {
    //         if (!this.wedGespeeld && this.idxWed == this.idxWedBezig) {
    //             this.buttonPressed(this.btnOpnieuw);
    //         }
    //         return false;
    //     }
    //     if (event.code === 'KeyU') {
    //         if (!this.wedGespeeld) {
    //             this.buttonPressed(this.btnAdd);
    //         }
    //         return false;
    //     }
    //     if (event.key === 'Home') {
    //         this.gotoHome();
    //         return false;
    //     }
    //     return true;
    // }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Wedstrijden`;

        // let id: string | null = this.route.snapshot.paramMap.get('rondeId');
        // if (!id) {
        //     this.alert.showError('Kan ronde ID in URL niet vinden.');
        //     return;
        // }
        // const rondeId = Number(id);

        // let idx: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        // if (!idx) {
        //     this.alert.showError('Kan poule index in URL niet vinden.');
        //     return;
        // }
        // const pouleIdx = Number(idx);

        // id = this.route.snapshot.paramMap.get('splKopId');
        // if (!id) {
        //     this.alert.showError('Kan ID koppel 1 in URL niet vinden.');
        //     return;
        // }
        // const splKopId = id;

        // id = this.route.snapshot.paramMap.get('tegKopId');
        // if (!id) {
        //     this.alert.showError('Kan ID koppel 2 in URL niet vinden.');
        //     return;
        // }
        // const tegKopId = id;

        // Promise.all([
        //     this.dao.getSeizoenFile(this.header.seizoen),
        //     this.dao.getRondes(this.header.seizoen),
        //     this.dao.getWedstrijd()
        // ])
        // .then(results => {
        //     this.config = results[0];
        //     this.rondes = results[1];
        //     const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
        //     if (idxRonde < 0) {
        //         this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
        //         return;
        //     }
        //     this.ronde = this.rondes[idxRonde];
        //     this.today = new Date().toISOString().substring(0, 10);
        //     this.header.datum = this.dater.dateReverse(this.today);
        //     this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
        //     .then(data => {
        //         this.pouleRonde = data;
        //         this.poule = this.pouleRonde.poules[pouleIdx];
        //         const splKopIdx = this.poule.koppels.findIndex(kpl => kpl.kopId == splKopId);
        //         const tegKopIdx = this.poule.koppels.findIndex(kpl => kpl.kopId == tegKopId);
        //         this.koppels.push(this.poule.koppels[splKopIdx]);
        //         this.koppels.push(this.poule.koppels[tegKopIdx]);
        //         this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} match Poule ${this.poule.id} : koppel ${this.koppels[0].kopId} - koppel ${this.koppels[1].kopId}`;
        //         this.preselectWedstrijd();
        //         if (results[2].gevonden) {
        //             this.wedstrijd = results[2].wedstrijd;
        //             this.checkIfWedAlGestart();
        //         }
        //         this.confirmOpnieuw.texts.push('Wedstrijd opnieuw starten?');
        //         this.confirmOpnieuw.texts.push('Huidige tussenstand gaat verloren.');
        //         this.dataReady = true;
        //     })
        //     .catch(err => {
        //         this.alert.showError(err);
        //     });
        // })
        // .catch(err => {
        //     this.alert.showError(err);
        // });
    }

    // private buttonPressed(btn: Btn) {
    //     btn.clicked = true;
    //     setTimeout(() => {
    //         btn.clicked = false;
    //         setTimeout(() => {
    //             if (btn.key.key == 'enter') {
    //                 this.naarWedstrijdClicked();
    //             }
    //             else if (btn.key.key == 'S') {
    //                 this.startOpnieuwClicked();
    //             }
    //             else if (btn.key.key == 'U') {
    //                 this.uitslagToevoegenClicked();
    //             }
    //         }, 250);
    //     }, 250);
    // }

    // private checkIfWedAlGestart() {
    //     if (this.wedstrijd.wedGespeeld || this.wedstrijd.pouleId == '' || this.wedstrijd.spelers[0].stand.aantBrt == 0) {
    //         return;
    //     }
    //     const wedSplIds = [this.wedstrijd.spelers[0].splId, this.wedstrijd.spelers[1].splId];
    //     let match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
    //     if (match) {
    //         // eerste wedstrijd
    //         if (match.wedstrijden[0].uitslag.brt > 0) {
    //             if (wedSplIds.includes(match.wedstrijden[0].splId) && wedSplIds.includes(match.wedstrijden[0].tegId)) {
    //                 this.idxWedBezig = 0;
    //                 return;
    //             }
    //         }
    //         // tweede wedstrijd
    //         if (match.wedstrijden[1].uitslag.brt > 0) {
    //             if (wedSplIds.includes(match.wedstrijden[1].splId) && wedSplIds.includes(match.wedstrijden[1].tegId)) {
    //                 this.idxWedBezig = 0;
    //                 return;
    //             }
    //         }
    //     }
    // }

    // private preselectWedstrijd() {
    //     let match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
    //     if (match) {
    //         this.matchVolgNr = match.volgNr;
    //         if (match.wedstrijden[0].uitslag.brt == 0) {
    //             this.selectWedstrijd(0);
    //             return;
    //         }
    //         if (match.wedstrijden[1].uitslag.brt == 0) {
    //             this.selectWedstrijd(1);
    //             return;
    //         }
    //     }
    //     //this.selectWedstrijd(0);
    // }

    // private moveUp() {
    //     if (this.idxWed <= 0) {
    //         this.selectWedstrijd(1);
    //     }
    //     else {
    //         this.selectWedstrijd(this.idxWed - 1);
    //     }
    // }

    // private moveDown() {
    //     if (this.idxWed >= 1) {
    //         this.selectWedstrijd(0);
    //     }
    //     else {
    //         this.selectWedstrijd(this.idxWed + 1);
    //     }
    // }

    // private selectWedstrijd(idx: number) {
    //     this.idxWed = idx;
    //     let match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
    //     if (match) {
    //         if (match.wedstrijden[idx].uitslag.brt > 0) {
    //             this.wedGespeeld = true;
    //             //this.btnNaar.text = 'Naar wedstrijd ' + (idx + 1);
    //         }
    //         else {
    //             this.wedGespeeld = false;
    //             //this.btnStart.text = 'Start wedstrijd ' + (idx + 1);
    //             //this.btnAdd.text = `Uitslag wedstrijd ${idx + 1} invoeren`;
    //         }
    //     }
    // }

    // private wedstrijdVerwijderen() {
    //     const splKoppel = this.koppels[0];
    //     const tegKoppel = this.koppels[1];
    //     const spl = splKoppel.spelers[this.idxWed];
    //     const teg = tegKoppel.spelers[this.idxWed];

    //     // speler uitslag
    //     let splWed = spl.wedstrijden.find(wedstrijd => wedstrijd.tegPouleKoppelId == tegKoppel.id);
    //     if (!splWed) {
    //         this.alert.showError('Wedstrijd van speler niet gevonden in koppelspeler.');
    //         return;
    //     }
    //     splWed.score = [];
    //     splWed.uitslag = new Uitslag();
    //     spl.uitslag = new Uitslag();
    //     spl.wedstrijden.forEach(wd => {
    //         spl.uitslag.brt += wd.uitslag.brt;
    //         spl.uitslag.car += wd.uitslag.car;
    //         spl.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > spl.uitslag.ser) {
    //             spl.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     spl.uitslag.moy = (spl.uitslag.brt == 0) ? 0 : spl.uitslag.car / spl.uitslag.brt;
    //     splKoppel.uitslag = new Uitslag();
    //     splKoppel.spelers.forEach(ks => {
    //         splKoppel.uitslag.brt += ks.uitslag.brt;
    //         splKoppel.uitslag.car += ks.uitslag.car;
    //         splKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > splKoppel.uitslag.ser) {
    //             splKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     splKoppel.uitslag.moy = (splKoppel.uitslag.brt == 0) ? 0 : splKoppel.uitslag.car / splKoppel.uitslag.brt;
    //     // tegenstander uitslag
    //     let tegWed = teg.wedstrijden.find(wedstrijd => wedstrijd.tegPouleKoppelId == splKoppel.id);
    //     if (!tegWed) {
    //         this.alert.showError('Wedstrijd van tegenstander niet gevonden koppelspeler.');
    //         return;
    //     }
    //     tegWed.score = [];
    //     tegWed.uitslag = new Uitslag();
    //     teg.uitslag = new Uitslag();
    //     teg.wedstrijden.forEach(wd => {
    //         teg.uitslag.brt += wd.uitslag.brt;
    //         teg.uitslag.car += wd.uitslag.car;
    //         teg.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > teg.uitslag.ser) {
    //             teg.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     teg.uitslag.moy = (teg.uitslag.brt == 0) ? 0 : teg.uitslag.car / teg.uitslag.brt;
    //     tegKoppel.uitslag = new Uitslag();
    //     tegKoppel.spelers.forEach(ks => {
    //         tegKoppel.uitslag.brt += ks.uitslag.brt;
    //         tegKoppel.uitslag.car += ks.uitslag.car;
    //         tegKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > tegKoppel.uitslag.ser) {
    //             tegKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     tegKoppel.uitslag.moy = (tegKoppel.uitslag.brt == 0) ? 0 : tegKoppel.uitslag.car / tegKoppel.uitslag.brt;
    //     // opslaan
    //     this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
    //     .then(resp => {
    //         this.alert.showSuccess('Wedstrijd succesvol Bekijkd.');
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
    // }

}
