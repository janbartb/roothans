import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../model/seizoen';
import { Poule, PouleKoppel, PouleRonde, Ronde } from '../../../model/ronde';
import { Btn } from '../../../model/misc';
import { DateHelper } from '../../../services/date-helper';
import { RondePouleView } from '../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../shared/button/button';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-poule-ronde-spelen',
    imports: [
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poule-ronde-spelen.html',
    styleUrl: './poule-ronde-spelen.css',
})
export class PouleRondeSpelen extends Base implements OnInit {
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

    btnWeds: Btn = new Btn('next', 'Naar wedstrijden');

    naarPouleClicked() {
        this.gotoPage(`rondes/poule/${this.ronde.rndId}/spel/${this.idxPoule}`, `rondes/poule/${this.ronde.rndId}/spel`);
    }

    pouleClicked(idx: number) {
        this.btnWeds.text = `Naar wedstrijden`;
        this.idxPoule = (idx == this.idxPoule) ? -1 : idx;
        if (this.idxPoule >= 0) {
            this.btnWeds.text += ` Poule ${this.pouleRonde.poules[this.idxPoule].pouleId}`;
        }
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
                this.naarPouleClicked();
                return false;
            }
            return true;
        }
        if (event.key === 'Escape') {
            this.gotoPrevPage();
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
                this.pouleRonde.poules.forEach(pl => {
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

    private selectNextPoule() {
        let idx = this.idxPoule;
        idx++;
        if (idx >= this.pouleRonde.poules.length) {
            idx = 0;
        }
        this.pouleClicked(idx);
    }

    private selectPrevPoule() {
        let idx = this.idxPoule;
        idx--;
        if (idx < 0) {
            idx = this.pouleRonde.poules.length - 1;
        }
        this.pouleClicked(idx);
    }

    private comparePouleKoppels(a: PouleKoppel, b: PouleKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

}
