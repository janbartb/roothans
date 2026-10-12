import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { Base } from '../../../../../base/base';
import { RondeKoppel } from '../../../../../model/koppel';
import { DecimalPipe, NgClass } from '@angular/common';
import { Btn } from '../../../../../model/misc';
import { Button } from '../../../../../shared/button/button';
import { Tester } from '../../../../../services/tester';

@Component({
    selector: 'app-dagen-overview',
    imports: [
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './dagen-overview.html',
    styleUrl: './dagen-overview.css',
})
export class DagenOverview extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    tester = inject(Tester);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    today: string = '';
    spDagPerc: number = 25;
    idxDag: number = -1;
    idxMatch: number = -1;

    btnSel: Btn = new Btn('select', 'Ga naar match ...', 'enter');
    btnVul: Btn = new Btn('vul', 'Alle weds invullen');

    matchClicked(idxD: number, idxM: number) {
        this.idxDag = idxD;
        this.idxMatch = idxM;
        this.naarMatchClicked();
    }

    naarMatchClicked() {
        const dag = this.afvalRonde.speelDagen[this.idxDag];
        const match = dag.matches[this.idxMatch];
        const url = `rondes/afval/${this.ronde.rndId}/match/${dag.dagId}/${match.koppelIds[0]}/${match.koppelIds[1]}`;
        this.gotoPage(url, this.router.url);
    }

    alleWedstrijdenVullenClicked() {
        this.tester.vulAlleAfvalRondeWedstrijden(this.afvalRonde, this.config);
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        rondeToSave.poules.forEach(pl => {
            pl.koppelIds = pl.koppels.map(k => k.kopId);
            pl.koppels = [];
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            if (this.ronde.status.gereed != this.afvalRonde.status.gereed || this.ronde.status.gestart != this.afvalRonde.status.gestart) {
                this.ronde.status.gereed = this.afvalRonde.status.gereed;
                this.ronde.status.gestart = this.afvalRonde.status.gestart;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    this.alert.showSuccess('Uitslag succesvol opgeslagen.');
                    this.reloadPage();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showSuccess('Uitslag succesvol opgeslagen.');
                this.reloadPage();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    reloadPage() {
        window.location.reload();
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
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (event.key === 'ArrowLeft') {
                this.moveLeft();
            }
            if (event.key === 'ArrowRight') {
                this.moveRight();
            }
            return false;
        }
        if (event.key === 'Enter') {
            if (this.idxDag >= 0 && this.idxMatch >= 0) {
                this.buttonPressed(this.btnSel);
                return false;
            }
            else {
                return true;
            }
        }
        if (event.key === 'Escape') {
            if (this.idxDag >= 0 || this.idxMatch >= 0) {
                this.idxDag = -1;
                this.idxMatch = -1;
                this.selectMatch();
            }
            else {
                this.escapePressed();
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Spelen`;
        
        const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!rondeId) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const id = Number(rondeId);

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
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
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Overzicht`;
            this.today = new Date().toISOString().substring(0, 10);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                if (this.afvalRonde.speelDagen.length) {
                    this.spDagPerc = 100 / this.afvalRonde.speelDagen.length;
                }
                this.afvalRonde.speelDagen.sort(this.compareSpeelDagen);
                this.afvalRonde.speelDagen.forEach(sd => {
                    sd.matches.forEach(match => {
                        match.koppels = [];
                        match.koppelIds.forEach(id => {
                            if (id == '') {
                                match.koppels.push(new RondeKoppel());
                            }
                            else {
                                const kop = this.afvalRonde.koppels.find(kpl => kpl.kopId == id);
                                if (kop) {
                                    kop.ingepland = true;
                                    match.koppels.push(kop);
                                }        
                            }
                        });
                    });
                });
                this.selectTeSpelenMatch();
                console.log(this.afvalRonde);
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
                if (btn.id == 'select') {
                    this.naarMatchClicked();
                }
            }, 250);
        }, 250);
    }

    private selectTeSpelenMatch() {
        this.idxDag = this.afvalRonde.speelDagen.findIndex(sdag => {
            this.idxMatch = sdag.matches.findIndex(mat => {
                return mat.koppels[0].uitslag.brt < this.ronde.rndBeurten * 2;
            });
            return this.idxMatch >= 0;
        });
        if (this.idxDag < 0) {
            this.idxDag = this.idxMatch = 0;
        }
        this.selectMatch();
    }

    private selectMatch() {
        this.btnSel.text = 'Ga naar match ...';
        if (this.idxDag >= 0 && this.idxMatch >= 0) {
            const dag = this.afvalRonde.speelDagen[this.idxDag];
            this.btnSel.text = 'Ga naar match ' + (this.idxMatch + 1) + ' van ' + dag.dagNaam + ' ' + this.dater.dateReverse(dag.datum);
        }
    }

    private compareSpeelDagen(a: RondeSpeelDag, b: RondeSpeelDag): number {
        return (a.datum < b.datum) ? -1 : 1;
    }
    
    private moveUp() {
        if (this.idxDag < 0 || !this.afvalRonde.speelDagen[this.idxDag].matches.length) {
            return;
        }
        if (this.idxMatch <= 0) {
            this.idxMatch = this.afvalRonde.speelDagen[this.idxDag].matches.length - 1;
        }
        else {
            this.idxMatch--;
        }
        this.selectMatch();
    }
    
    private moveDown() {
        if (this.idxDag < 0 || !this.afvalRonde.speelDagen[this.idxDag].matches.length) {
            return;
        }
        if (this.idxMatch >= this.afvalRonde.speelDagen[this.idxDag].matches.length - 1) {
            this.idxMatch = 0;
        }
        else {
            this.idxMatch++;
        }
        this.selectMatch();
    }

    private moveLeft() {
        if (!this.afvalRonde.speelDagen.length) {
            return;
        }
        if (this.idxDag <= 0) {
            this.idxDag = this.afvalRonde.speelDagen.length - 1;
        }
        else {
            this.idxDag--;
        }
        this.selectMatch();
    }
    
    private moveRight() {
        if (!this.afvalRonde.speelDagen.length) {
            return;
        }
        if (this.idxDag >= this.afvalRonde.speelDagen.length - 1) {
            this.idxDag = 0;
        }
        else {
            this.idxDag++;
        }
        this.selectMatch();
    }

}
