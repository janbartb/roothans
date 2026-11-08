import { Component, HostListener, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Ronde } from '../../model/ronde';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';
import { NgClass } from '@angular/common';

class RondeButtons {
    btns: Btn[] = [];

    constructor() {
        this.btns.push(new Btn('pln', 'Planning', 'P', 1));
        this.btns.push(new Btn('res', 'Resultaat', 'R', 1));
    }
}

@Component({
    selector: 'app-overzichten',
    imports: [
        Button,
        NgClass
    ],
    templateUrl: './overzichten.html',
    styleUrl: './overzichten.css',
})
export class Overzichten extends Base implements OnInit {
    rondes: Ronde[] = [];
    buttons: RondeButtons[] = [];
    finale: Ronde = new Ronde(0, '', '', 0, '');
    idxRonde: number = -1;

    moyButton: Btn = new Btn('moy', 'Nieuwe moyennes', 'm', 8);

    planningClicked(idxR: number) {
        if (idxR == 0) {
            this.gotoPage('overz/poule/pln', this.router.url);
        }
        else if (idxR == 1) {
            this.gotoPage('overz/afval/fin16/pln', this.router.url);
        }
        else if (idxR == 2 || idxR == 3) {
            this.gotoPage(`overz/afval/${idxR + 1}/pln`, this.router.url);
        }
        else if (idxR == 4) {
            this.gotoPage(`overz/afval/fins/pln`, this.router.url);
        }
    }

    resultaatClicked(idxR: number) {
        if (idxR == 0) {
            this.gotoPage('overz/poule/res', this.router.url);
        }
        else if (idxR == 1) {
            this.gotoPage('overz/afval/fin16/res', this.router.url);
        }
        else if (idxR == 2 || idxR == 3) {
            this.gotoPage(`overz/afval/${idxR + 1}/res`, this.router.url);
        }
        else if (idxR == 4) {
            this.gotoPage(`overz/afval/fins/res`, this.router.url);
        }
    }

    moyennesClicked() {
        this.gotoPage('overz/moyennes', this.router.url);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.moveUp();
            }
            if (event.key === 'ArrowDown') {
                this.moveDown();
            }
            return false;
        }
        if (event.code === 'KeyP') {
            if (this.idxRonde < 0 || this.idxRonde >= this.rondes.length) {
                return true;
            }
            if (!this.rondes[this.idxRonde].status.gepland) {
                return true;
            }
            this.buttonPressed(this.buttons[this.idxRonde].btns[0]);
            return false;    
        }
        if (event.code === 'KeyR') {
            if (this.idxRonde < 0 || this.idxRonde >= this.rondes.length) {
                return true;
            }
            if (this.idxRonde == (this.rondes.length - 1)) {
                if (!this.finale.status.gereed) {
                    return true;
                }
            }
            else {
                if (!this.rondes[this.idxRonde].status.gereed) {
                    return true;
                }
            }
            this.buttonPressed(this.buttons[this.idxRonde].btns[1]);
            return false;    
        }
        if (event.code === 'KeyM') {
            if (!this.finale.status.gereed) {
                return true;
            }
            this.buttonPressed(this.moyButton);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzichten (pdf)';
        
        Promise.all([
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.rondes = results[0];
            const fin = this.rondes.pop();
            if (fin) {
                this.finale = fin;
            }
            this.rondes[this.rondes.length - 1].rndNaam = 'Halve finales en finale';
            this.rondes.forEach(rnd => this.buttons.push(new RondeButtons()));
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
                if (btn.id == 'pln') {
                    this.planningClicked(this.idxRonde);
                }
                else if (btn.id == 'res') {
                    this.resultaatClicked(this.idxRonde);
                }
                else {
                    this.moyennesClicked();
                }
            }, 250);
        }, 250);
    }

    moveUp() {
        if (this.idxRonde == -1) {
            this.idxRonde = this.rondes.length;
        }
        this.idxRonde--;
    }

    moveDown() {
        if (this.idxRonde == this.rondes.length) {
            this.idxRonde = -1;
        }
        this.idxRonde++;
    }

}
