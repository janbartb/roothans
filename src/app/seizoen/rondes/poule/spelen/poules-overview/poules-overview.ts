import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { RondePouleView } from '../../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { Btn } from '../../../../../model/misc';
import { RondeKoppel } from '../../../../../model/koppel';
import { Tester } from '../../../../../services/tester';

@Component({
    selector: 'app-poules-overview',
    imports: [
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poules-overview.html',
    styleUrl: './poules-overview.css',
})
export class PoulesOverview extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    tester = inject(Tester);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    idxPoule: number = -1;
    today: string = '';

    btnWeds: Btn = new Btn('next', 'Naar poule', 'enter');
    btnVul: Btn = new Btn('vul', 'Alle weds invullen');

    naarPouleClicked() {
        if (this.idxPoule >= 0) {
            this.gotoPage(`rondes/poule/${this.ronde.rndId}/spel/${this.idxPoule}`, `rondes/poule/${this.ronde.rndId}/spel`);
        }
    }

    alleWedstrijdenVullenClicked() {
        this.tester.vulAllePouleRondeWedstrijden(this.pouleRonde, this.config);
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        rondeToSave.poules.forEach(pl => {
            pl.koppelIds = pl.koppels.map(k => k.kopId);
            pl.koppels = [];
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            if (this.ronde.status.gereed != this.pouleRonde.status.gereed || this.ronde.status.gestart != this.pouleRonde.status.gestart) {
                this.ronde.status.gereed = this.pouleRonde.status.gereed;
                this.ronde.status.gestart = this.pouleRonde.status.gestart;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    this.alert.showSuccess('Uitslag succesvol opgeslagen.');
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showSuccess('Uitslag succesvol opgeslagen.');
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    pouleSelected(idx: number) {
        this.btnWeds.text = `Naar poule `;
        this.idxPoule = (idx == this.idxPoule) ? -1 : idx;
        if (this.idxPoule >= 0) {
            this.btnWeds.text += `${this.pouleRonde.poules[this.idxPoule].id}`;
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
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (event.key === 'ArrowLeft') {
                this.selectPrevPoule();
            }
            if (event.key === 'ArrowRight') {
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
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.pouleRonde.poules.sort(this.comparePoules);
                if (this.pouleRonde.poules[0].id == '') {
                    this.pouleRonde.poules.forEach((pl, idx) => {
                        pl.volgNr = 0;
                        pl.id = String.fromCharCode(65 + idx);
                    });
                    this.pouleRondeOpslaan(JSON.parse(JSON.stringify(this.pouleRonde)));
                }
                this.pouleRonde.poules.forEach((pl) => {
                    pl.koppels = [];
                    let aantKoppels = pl.koppelIds.length;
                    while (aantKoppels--) pl.koppels.push(new RondeKoppel()); 
                    pl.koppelIds.forEach((kplId, idx) => {
                        if (kplId != '') {
                            const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                            if (foundKoppel) {
                                pl.koppels[idx] = foundKoppel;
                            }
                        }
                    });
                    if (this.pouleIsGestart(pl)) {
                        pl.koppels.sort(this.comparePouleKoppels);
                    }
                });
                //this.today = '2026-01-05';
                this.idxPoule = this.pouleRonde.poules.findIndex(pl => pl.datum == this.today);
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

    private pouleRondeOpslaan(pouleRnd: SpeelRonde) {
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, pouleRnd)
        .then()
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

    private pouleIsGestart(poule: Poule): boolean {
        return poule.koppels.some(k => k.uitslag.brt > 0);
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

    private comparePoules(a: Poule, b: Poule): number {
        return a.datum < b.datum ? -1 : 1;
    }

}
