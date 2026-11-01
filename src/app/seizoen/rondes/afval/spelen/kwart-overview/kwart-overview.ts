import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Ronde, RondeMatch, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { Base } from '../../../../../base/base';
import { Button } from '../../../../../shared/button/button';
import { DecimalPipe, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Tester } from '../../../../../services/tester';
import { Seizoen } from '../../../../../model/seizoen';
import { Btn } from '../../../../../model/misc';
import { RondeKoppel } from '../../../../../model/koppel';

class MatchCombo {
    id: string = '';
    matches: RondeMatch[] = [];
}

@Component({
    selector: 'app-kwart-overview',
    imports: [
        Button,
        NgClass
    ],
    templateUrl: './kwart-overview.html',
    styleUrl: './kwart-overview.css',
})
export class KwartOverview extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    tester = inject(Tester);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    speelDag: RondeSpeelDag = new RondeSpeelDag(0);
    combos: MatchCombo[] = [];
    today: string = '';
    idxCombo: number = -1;
    idxMatch: number = -1;
    comboIds: string[] = ['A', 'B'];

    btnSel: Btn = new Btn('select', 'Ga naar match ...', 'enter');
    btnVul: Btn = new Btn('vul', 'Alle weds invullen');

    matchClicked(idxC: number, idxM: number) {
        this.idxCombo = idxC;
        this.idxMatch = idxM;
        this.naarMatchClicked();
    }

    naarMatchClicked() {
        const dag = this.speelDag;
        const combo = this.combos[this.idxCombo];
        const match = combo.matches[this.idxMatch];
        const url = `rondes/afval/${this.ronde.rndId}/match/${dag.dagId}/${match.koppelIds[0]}/${match.koppelIds[1]}`;
        this.gotoPage(url, this.router.url);
    }

    alleWedstrijdenVullenClicked() {
        this.tester.vulAlleAfvalRondeWedstrijden(this.afvalRonde, this.config);
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        rondeToSave.speelDagen.forEach(sd => {
            sd.matches.forEach(m => {
                m.koppelIds = m.koppels.map(k => k.kopId);
                m.koppels = [];
            });
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
        if (event.key === 'Enter') {
            if (this.idxMatch >= 0) {
                this.buttonPressed(this.btnSel);
                return false;
            }
            else {
                return true;
            }
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Spelen`;
        
        const id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
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
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Overzicht`;
            this.today = new Date().toISOString().substring(0, 10);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
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
                this.speelDag = this.afvalRonde.speelDagen[0];
                [0, 1].forEach(idxCom => {
                    let combo = new MatchCombo();
                    combo.id = (idxCom == 0) ? 'A' : 'B';
                    [0, 1].forEach(idxMat => {
                        combo.matches.push(this.afvalRonde.speelDagen[0].matches[(2 * idxCom) + idxMat]);
                    });
                    this.combos.push(combo);
                });
                console.log(this.combos);
                this.selectTeSpelenMatch();
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
        this.idxCombo = this.combos.findIndex(combo => {
            this.idxMatch = combo.matches.findIndex(mat => {
                return mat.koppels[0].uitslag.brt < this.ronde.rndBeurten * 2;
            });
            return this.idxMatch >= 0;
        });
        if (this.idxCombo < 0) {
            this.idxCombo = this.idxMatch = 0;
        }
        this.selectMatch();
    }

    private selectMatch() {
        this.btnSel.text = 'Ga naar match ...';
        if (this.idxCombo >= 0 && this.idxMatch >= 0) {
            const nr = (2 * this.idxCombo) + this.idxMatch + 1;
            this.btnSel.text = 'Ga naar match ' + nr;
        }
    }

    private moveUp() {
        let c = this.idxCombo;
        let m = this.idxMatch;
        m--;
        if (m < 0) {
            c--;
            if (c < 0) {
                c = this.combos.length - 1;
            }
            m = this.combos[c].matches.length - 1;
        }
        this.idxCombo = c;
        this.idxMatch = m;
        this.selectMatch();
    }
    
    private moveDown() {
        let c = this.idxCombo;
        let m = this.idxMatch;
        m++;
        if (m >= this.combos[c].matches.length) {
            c++;
            if (c >= this.combos.length) {
                c = 0;
            }
            m = 0;
        }
        this.idxCombo = c;
        this.idxMatch = m;
        this.selectMatch();
    }

}
