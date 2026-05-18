import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RondePouleView } from '../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { Base } from '../../../../base/base';
import { Poule, PouleRonde, Ronde, PouleKoppel } from '../../../../model/ronde';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Seizoen } from '../../../../model/seizoen';
import { Btn } from '../../../../model/misc';

@Component({
    selector: 'app-poule-ronde-poules',
    imports: [
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poule-ronde-poules.html',
    styleUrl: './poule-ronde-poules.css',
})
export class PouleRondePoules extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    idxPoule: number = -1;
    today: string = '';
    touched: boolean = false;
    poulesOk: boolean = false;

    btnWeds: Btn = new Btn('next', 'Naar wedstrijdschema', 'enter');

    naarPouleClicked() {
        if (this.idxPoule >= 0) {
            this.gotoPage(`rondes/poule/${this.ronde.rndId}/spel/${this.idxPoule}`, `rondes/poule/${this.ronde.rndId}/spel`);
        }
    }

    pouleSelected(idx: number) {
        this.btnWeds.text = `Naar wedstrijdschema`;
        this.idxPoule = (idx == this.idxPoule) ? -1 : idx;
        if (this.idxPoule >= 0) {
            this.btnWeds.text += ` Poule ${this.pouleRonde.poules[this.idxPoule].pouleId}`;
        }
    }

    pouleClicked(idx: number) {
        this.idxPoule = idx;
        this.naarPouleClicked();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.selectPrevPoule();
            }
            if (event.key === 'ArrowDown') {
                this.selectNextPoule();
            }
            return false;
        }
        if (event.key === 'Enter') {
            if (this.idxPoule >= 0) {
                this.buttonPressed(this.btnWeds);
                return false;
            }
            return true;
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning`;

        const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!rondeId) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const id = Number(rondeId);
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.today = new Date().toISOString().substring(0, 10);
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} overzicht`;
            this.header.datum = this.dater.dateReverse(this.today);
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.pouleRonde.poules.sort(this.comparePoules);
                if (this.pouleRonde.poules[0].pouleId == '') {
                    this.pouleRonde.poules.forEach((pl, idx) => {
                        pl.pouleVolgNr = 0;
                        pl.pouleId = String.fromCharCode(65 + idx);
                    });
                    this.pouleRondeOpslaan();
                }
                this.pouleRonde.poules.forEach((pl) => {
                    pl.pouleKoppels.sort(this.comparePouleKoppels);
                });
                //this.today = '2026-01-05';
                this.idxPoule = this.pouleRonde.poules.findIndex(pl => pl.pouleDatum == this.today);
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
                    this.naarPouleClicked();
                }
            }, 250);
        }, 250);
    }

    private selectNextPoule() {
        let idx = this.idxPoule;
        idx++;
        if (idx >= this.pouleRonde.poules.length) {
            idx = 0;
        }
        this.pouleSelected(idx);
    }

    private selectPrevPoule() {
        let idx = this.idxPoule;
        idx--;
        if (idx < 0) {
            idx = this.pouleRonde.poules.length - 1;
        }
        this.pouleSelected(idx);
    }

    private pouleRondeOpslaan() {
        this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
        .then()
        .catch(err => {
            this.alert.showError(err);
        });
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

    private comparePoules(a: Poule, b: Poule): number {
        return a.pouleDatum < b.pouleDatum ? -1 : 1;
    }

}
