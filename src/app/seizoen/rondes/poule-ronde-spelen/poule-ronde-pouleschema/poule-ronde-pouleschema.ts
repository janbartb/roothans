import { DecimalPipe, NgClass } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Seizoen } from '../../../../model/seizoen';
import { Poule, Ronde } from '../../../../model/ronde';

@Component({
    selector: 'app-poule-ronde-pouleschema',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './poule-ronde-pouleschema.html',
    styleUrl: './poule-ronde-pouleschema.css',
})
export class PouleRondePouleschema extends Base implements OnInit {
    // route = inject(ActivatedRoute);
    // dater = inject(DateHelper);
    // config: Seizoen = new Seizoen();
    // rondes: Ronde[] = [];
    // ronde: Ronde = new Ronde(0, '', '', 0, '');
    // pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    // poule: Poule = new Poule();
    // idxPoule: number = -1;
    // today: string = '';
    // idxRow: number = 0;
    // idxCol: number = 0;
    // allesGespeeld: boolean = false;
    // eerstVolgendeMatchNr: number = 0;
    // selectedMatchNr: number = 0;

    // enterPressed() {
    //     if (this.idxRow == 0 && this.idxCol == 0) {
    //         return;
    //     }
    //     this.matchClicked(this.idxRow, this.idxCol);
    // }

    // wedstrijdNrPressed(nr: number) {
    //     let idxSpl = 0;
    //     let idxTeg = 0;
    //     this.poule.pouleKoppels.forEach((splKop, idxS) => {
    //         splKop.spelers[0].wedstrijden.forEach(wed => {
    //             if (wed.volgNr == nr) {
    //                 idxSpl = idxS;
    //                 idxTeg = this.poule.pouleKoppels.findIndex(kpl => kpl.id == wed.tegPouleKoppelId);
    //             }
    //         });
    //     })
    //     this.matchClicked(idxTeg, idxSpl);
    // }

    // matchClicked(idxR: number, idxC: number) {
    //     if (idxR == idxC) {
    //         return;
    //     }
    //     const kopSplId = this.poule.pouleKoppels[idxR].id;
    //     const kopTegId = this.poule.pouleKoppels[idxC].id 
    //     this.gotoPage(`${this.router.url}/match/${kopSplId}/${kopTegId}`, this.router.url);
    // }

    // getWedstrijdNrMatch(idxSpl: number, idxTeg: number): number {
    //     const splKoppel = this.poule.pouleKoppels[idxSpl];
    //     const tegKoppelId = this.poule.pouleKoppels[idxTeg].id;
    //     const wed1 = splKoppel.spelers[0].wedstrijden.find(wed => wed.tegPouleKoppelId == tegKoppelId);
    //     return wed1 ? wed1.volgNr : 0;
    // }

    // getWedstrijdNrNietGespeeldeMatch(idxSpl: number, idxTeg: number): number {
    //     const splKoppel = this.poule.pouleKoppels[idxSpl];
    //     const tegKoppelId = this.poule.pouleKoppels[idxTeg].id;
    //     const wed1 = splKoppel.spelers[0].wedstrijden.find(wed => wed.tegPouleKoppelId == tegKoppelId);
    //     if (!wed1) {
    //         return 0;
    //     }
    //     const wed2 = splKoppel.spelers[1].wedstrijden.find(wed => wed.tegPouleKoppelId == tegKoppelId);
    //     if (!wed2) {
    //         return 0;
    //     }
    //     if (wed1.uitslag.brt > 0 || wed2.uitslag.brt > 0) {
    //         return 0;
    //     }
    //     return wed1.volgNr;
    // }

    // @HostListener('document:keyup', ['$event'])
    // handleKeyboardEvent(event: KeyboardEvent): boolean {
    //     console.log(event.code + ' : ' + event.key);
    //     if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    //         if (event.key === 'ArrowUp') {
    //             this.moveUp();
    //         }
    //         if (event.key === 'ArrowDown') {
    //             this.moveDown();
    //         }
    //         if (event.key === 'ArrowLeft') {
    //             this.moveLeft();
    //         }
    //         if (event.key === 'ArrowRight') {
    //             this.moveRight();
    //         }
    //         this.selectedMatchNr = this.getSelectedMatchNr();
    //         return false;
    //     }
    //     if (event.key >= '1' && event.key <= '6') {
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
    //     if (event.key === 'Home') {
    //         this.gotoHome();
    //         return false;
    //     }
    //     return true;
    // }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Wedstrijden`;

        // const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        // if (!rondeId) {
        //     this.alert.showError('Kan ronde ID in URL niet vinden.');
        //     return;
        // }
        // const id = Number(rondeId);

        // const index: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        // if (!rondeId) {
        //     this.alert.showError('Kan poule index in URL niet vinden.');
        //     return;
        // }
        // const idx = Number(index);

        // Promise.all([
        //     this.dao.getSeizoenFile(this.header.seizoen),
        //     this.dao.getRondes(this.header.seizoen)
        // ])
        // .then(results => {
        //     this.config = results[0];
        //     this.rondes = results[1];
        //     const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == id);
        //     if (idxRonde < 0) {
        //         this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
        //         return;
        //     }
        //     this.ronde = this.rondes[idxRonde];
        //     this.today = new Date().toISOString().substring(0, 10);
        //     this.header.datum = this.dater.dateReverse(this.today);
        //     this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
        //     .then(data => {
        //         this.pouleRonde = data;
        //         this.idxPoule = idx;
        //         this.poule = this.pouleRonde.poules[this.idxPoule];
        //         this.poule.pouleKoppels.sort(this.comparePouleKoppels);
        //         this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijden Poule ${this.poule.pouleId}`;
        //         this.allesGespeeld = this.alleWedstrijdenGespeeld();
        //         if (!this.allesGespeeld) {
        //             this.eerstVolgendeMatchNr = this.setEersteTeSpelenMatch();
        //             this.selectedMatchNr = this.eerstVolgendeMatchNr;
        //         }
        //     })
        //     .catch(err => {
        //         this.alert.showError(err);
        //     });
        // })
        // .catch(err => {
        //     this.alert.showError(err);
        // });
    }

    // private alleWedstrijdenGespeeld(): boolean {
    //     return this.poule.pouleKoppels.every(pk => {
    //         return pk.spelers.every(spl => {
    //             return spl.wedstrijden.every(wed => wed.uitslag.brt > 0);
    //         });
    //     });
    // }

    // private setEersteTeSpelenMatch(): number {
    //     this.idxRow = this.idxCol = 0;
    //     let firstVolgNr = 100;
    //     this.poule.pouleKoppels.forEach((splKop, idxSK) => {
    //         this.poule.pouleKoppels.forEach((tegKop, idxTK) => {
    //             splKop.spelers.forEach(spl => {
    //                 spl.wedstrijden.forEach(wed => {
    //                     if (wed.tegPouleKoppelId == tegKop.id && wed.uitslag.brt == 0 && wed.volgNr < firstVolgNr) {
    //                         firstVolgNr = wed.volgNr;
    //                         this.idxRow = idxSK;
    //                         this.idxCol = idxTK;
    //                     }
    //                 });
    //             });
    //         });
    //     });
    //     return firstVolgNr;
    // }

    // private comparePouleKoppels(a: PouleKoppel, b: PouleKoppel): number {
    //     if (a.uitslag.pnt == b.uitslag.pnt) {
    //         if ((b.uitslag.moy / b.koppel.kopMoyenne) == (a.uitslag.moy / a.koppel.kopMoyenne)) {
    //             return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
    //         }
    //         else {
    //             return (b.uitslag.moy / b.koppel.kopMoyenne) - (a.uitslag.moy / a.koppel.kopMoyenne);
    //         }
    //     }
    //     else {
    //         return b.uitslag.pnt - a.uitslag.pnt;
    //     }
    // }

    // private getSelectedMatchNr(): number {
    //     const splKoppel = this.poule.pouleKoppels[this.idxRow];
    //     const tegKoppelId = this.poule.pouleKoppels[this.idxCol].id;
    //     const wed = splKoppel.spelers[0].wedstrijden.find(wd => wd.tegPouleKoppelId == tegKoppelId);
    //     if (wed) {
    //         return wed.volgNr;
    //     }
    //     else {
    //         return this.eerstVolgendeMatchNr;
    //     }
    // }

    // private moveUp() {
    //     this.idxRow--;
    //     if (this.idxRow < 0) {
    //         this.idxRow = 3;
    //     }
    //     if (this.idxRow == this.idxCol) {
    //         this.moveUp();
    //     }
    // }
    
    // private moveDown() {
    //     this.idxRow++;
    //     if (this.idxRow > 3) {
    //         this.idxRow = 0;
    //     }
    //     if (this.idxRow == this.idxCol) {
    //         this.moveDown();
    //     }
    // }
    
    // private moveLeft() {
    //     this.idxCol--;
    //     if (this.idxCol < 0) {
    //         this.idxCol = 3;
    //     }
    //     if (this.idxRow == this.idxCol) {
    //         this.moveLeft();
    //     }
    // }
    
    // private moveRight() {
    //     this.idxCol++;
    //     if (this.idxCol > 3) {
    //         this.idxCol = 0;
    //     }
    //     if (this.idxRow == this.idxCol) {
    //         this.moveRight();
    //     }
    // }

}
