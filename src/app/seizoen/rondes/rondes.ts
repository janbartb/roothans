import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Ronde } from '../../model/ronde';
import { Base } from '../../base/base';
import { Koppel } from '../../model/koppel';
import { Seizoen } from '../../model/seizoen';
import { RondeView } from './ronde-view/ronde-view';
import { DateHelper } from '../../services/date-helper';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';

@Component({
    selector: 'app-rondes',
    imports: [
        Button,
        RondeView
    ],
    templateUrl: './rondes.html',
    styleUrl: './rondes.css',
})
export class Rondes extends Base implements OnInit {
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    prevRonde: Ronde = new Ronde(0, '', '', 0, '');
    idxRonde: number = -1;
    dummy: Ronde = new Ronde(0, '', '', 0, '');
    koppels: Koppel[] = [];

    btnPlan: Btn = new Btn('plan', 'Plannen', 'P', 1);
    btnSpel: Btn = new Btn('spel', 'Spelen', 'S', 1);
    btnEdit: Btn = new Btn('edit', 'Wijzigen', 'W', 1);

    enterPressed() {
        if (this.btnEdit.default) {
            this.buttonPressed(this.btnEdit);
        }
        else if (this.btnPlan.default) {
            this.buttonPressed(this.btnPlan);
        }
        else if (this.btnSpel.default) {
            this.buttonPressed(this.btnSpel);
        }
    }

    rondeClicked(idx: number) {
        if (idx == this.idxRonde) {
            return;
        }
        this.selecteerRonde(idx);
    }

    plannenClicked() {
        const type = this.ronde.rndType;
        const id = this.ronde.rndId;
        this.gotoPage(`rondes/${type}/${id}/planner`, 'rondes');
    }

    spelenClicked() {
        const type = this.ronde.rndType;
        const id = this.ronde.rndId;
        this.gotoPage(`rondes/${type}/${id}/spel`, 'rondes');
    }

    wijzigenClicked() {
        const type = this.ronde.rndType;
        const id = this.ronde.rndId;
        
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
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyP' && this.prevRonde.status.gereed && !this.ronde.status.gestart) {
            this.buttonPressed(this.btnPlan);
            return false;
        }
        if (event.code === 'KeyS' && this.prevRonde.status.gepland) {
            this.buttonPressed(this.btnSpel);
            return false;
        }
        if (event.code === 'KeyW' && !this.ronde.status.gepland) {
            this.buttonPressed(this.btnEdit);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Rondes';

        this.dummy.status.gepland = true;
        this.dummy.status.gestart = true;
        this.dummy.status.gereed = true;

        Promise.all([
            this.dao.getRondes(this.header.seizoen),
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.rondes = results[0];
            this.koppels = results[1];
            this.config = results[2];
            if (!this.rondes.length) {
                const allRondes = this.createRondes();
                this.dao.createRondes(this.header.seizoen, allRondes)
                    .then(resp => {
                        this.alert.showSuccess(resp.message);
                        this.rondes = allRondes;
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
            }
            const idxR = this.getInitieleRonde();
            this.selecteerRonde(idxR);
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
                if (btn.id == 'plan') {
                    this.plannenClicked();
                }
                else if (btn.id == 'spel') {
                    this.spelenClicked();
                }
                else if (btn.id == 'edit') {
                    this.wijzigenClicked();
                }
            }, 250);
        }, 250);
    }

    private selecteerRonde(idx: number) {
        this.ronde = this.rondes[idx];
        this.prevRonde = (idx == 0) ? this.dummy : this.rondes[idx - 1];
        this.idxRonde = idx;
        this.setDefaultButton();
    }

    private setDefaultButton() {
        this.btnPlan.default = false;
        this.btnSpel.default = false;
        this.btnEdit.default = false;
        if (this.ronde.status.gepland) {
            this.btnSpel.default = true;
        }
        else if (this.prevRonde.status.gereed) {
            this.btnPlan.default = true;
        }
        else {
            this.btnEdit.default = true;
        }
    }

    private getInitieleRonde(): number {
        let result = -1;
        this.rondes.some((rnd, idx) => {
            if (!(rnd.status.gereed)) {
                result = idx;
                return true;
            }
            else {
                return false;
            }
        });
        if (result == -1) {
            result = 0;
        }
        return result;
    }

    private createRondes(): Ronde[] {
        let rnds: Ronde[] = [];
        let rondeId = 1;
        rnds.push(new Ronde(rondeId, 'Voorronde', 'poule', 15, 'voorronde'));
        let aantMatches = this.config.maxKoppels / 2;
        while (aantMatches > 4) {
            rondeId++;
            rnds.push(new Ronde(rondeId, `${aantMatches}e finales`, 'afval', 20, `finales-${aantMatches}`, rondeId == 2));
            aantMatches = aantMatches / 2;
        }
        rondeId++;
        rnds.push(new Ronde(rondeId, `Kwart finales`, 'afval', 20, 'kwart-finales'));
        rondeId++;
        rnds.push(new Ronde(rondeId, `Halve finales`, 'afval', 20, 'halve-finales', true));
        rondeId++;
        rnds.push(new Ronde(rondeId, `Finale`, 'afval', 20, 'finale'));
        if (rnds.length == 6) {
            let periodes = this.dater.getRondePeriodes(Number(this.header.seizoen));
            rnds[0].periode = periodes[0];
            rnds[1].periode = periodes[1];
            rnds[2].periode = periodes[2];
            rnds[3].periode = periodes[3];
            rnds[4].periode = periodes[3];
            rnds[5].periode = periodes[3];
        }
        return rnds;
    }
    
    private moveUp() {
        if (this.idxRonde <= 0) {
            this.selecteerRonde(this.rondes.length - 1);
        }
        else {
            this.selecteerRonde(this.idxRonde - 1);
        }
    }
    
    private moveDown() {
        if (this.idxRonde >= (this.rondes.length - 1)) {
            this.selecteerRonde(0);
        }
        else {
            this.selecteerRonde(this.idxRonde + 1);
        }
    }
}
