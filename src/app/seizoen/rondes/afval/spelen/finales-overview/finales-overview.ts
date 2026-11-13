import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { DateHelper } from '../../../../../services/date-helper';
import { Tester } from '../../../../../services/tester';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { KoppelSpelerUitslagen, RondeKoppel } from '../../../../../model/koppel';
import { Btn, Uitslag } from '../../../../../model/misc';
import { KoppelSpeler } from '../../../../../model/speler';
import { Helper } from '../../../../../services/helper';
import { Button } from '../../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-finales-overview',
    imports: [
        Button,
        NgClass
    ],
    templateUrl: './finales-overview.html',
    styleUrl: './finales-overview.css',
})
export class FinalesOverview extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    helper = inject(Helper);
    tester = inject(Tester);
    config: Seizoen = new Seizoen();
    allRondes: Ronde[] = [];
    rondes: Ronde[] = [];
    afvalRondes: SpeelRonde[] = [];
    idxRonde: number = -1;
    idxMatch: number = -1;
    today: string = '';

    btnSel: Btn = new Btn('select', 'Ga naar match ...', 'G', 1);
    btnStand: Btn = new Btn('stand', 'Eindstand', 'E', 1);

    matchClicked(idxR: number, idxM: number) {
        if (idxR != this.idxRonde) {
            return;
        }
        this.idxMatch = idxM;
        this.naarMatchClicked();
    }

    naarMatchClicked() {
        const rnd = this.afvalRondes[this.idxRonde];
        const dag = rnd.speelDagen[0];
        const match = dag.matches[this.idxMatch];
        const url = `rondes/afval/${rnd.rndId}/match/${dag.dagId}/${match.koppelIds[0]}/${match.koppelIds[1]}`;
        this.gotoPage(url, this.router.url);
    }

    rondeClicked(idx: number) {
        if (idx == 1 && !this.rondes[0].status.gereed) {
            return;
        }
        this.idxRonde = idx;
        this.selectTeSpelenMatch();
    }

    naarEindstandClicked() {
        this.gotoPage('rondes/einde', this.router.url);
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
            this.toggleRonde();
            return false;
        }
        if (event.key === 'Enter') {
            if (this.rondes[1].status.gereed) {
                this.buttonPressed(this.btnStand);
                return false;
            }
            if (this.idxMatch >= 0) {
                this.buttonPressed(this.btnSel);
                return false;
            }
            else {
                return true;
            }
        }
        if (event.code === 'KeyG') {
            if (this.idxMatch >= 0) {
                this.buttonPressed(this.btnSel);
                return false;
            }
            return true;
        }
        if (event.code === 'KeyE') {
            if (this.rondes[1].status.gereed) {
                this.buttonPressed(this.btnStand);
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
            this.allRondes = results[1];
            let idx = this.allRondes.findIndex(rnd => rnd.rndNaam == 'Finale');
            if (idx < 0) {
                this.alert.showError(`Ronde met naam 'Finale' niet gevonden in 'rondes' file.`);
                return;
            }
            this.rondes.push(this.allRondes[idx - 1]); // halve finales
            this.rondes.push(this.allRondes[idx]); // finale

            idx = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${rondeId}' niet gevonden.`);
                return;
            }
            this.idxRonde = idx;

            this.header.subtitle = `Seizoen ${this.header.seizoen} - Finales - Overzicht`;
            this.today = new Date().toISOString().substring(0, 10);
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, this.rondes[0].fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, this.rondes[1].fileNaam)
            ])
            .then(results=> {
                this.afvalRondes.push(results[0]);
                this.afvalRondes.push(results[1]);
                this.prepareAfvalRonde(this.afvalRondes[0]);
                if (this.afvalRondes[1].koppels.length < 2) {
                    this.addKoppelsFromPrevRondeAndPrepare(this.afvalRondes[0], this.afvalRondes[1]);
                }
                else {
                    this.prepareAfvalRonde(this.afvalRondes[1]);
                }
                if (this.rondes[1].status.gereed) {
                    this.btnStand.default = true;
                }
                else {
                    this.btnSel.default = true;
                }
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
                else if (btn.id == 'stand') {
                    this.naarEindstandClicked();
                }
            }, 250);
        }, 250);
    }

    private toggleRonde() {
        let r = this.idxRonde;
        r = Math.abs(r - 1);
        this.rondeClicked(r);
    }

    private selectTeSpelenMatch() {
        if (this.idxRonde == 1) {
            this.idxMatch = 0;
        }
        else {
            this.idxMatch = this.afvalRondes[0].speelDagen[0].matches.findIndex(match => match.koppels[0].uitslag.brt < (this.rondes[0].rndBeurten * 2));
            if (this.idxMatch < 0) {
                this.idxMatch = 0;
            }
        }
        this.selectMatch();
    }

    private selectMatch() {
        this.btnSel.text = 'Ga naar match ...';
        if (this.idxRonde == 1) {
            this.btnSel.text = 'Ga naar finale match'
        }
        else {
            if (this.idxMatch >= 0) {
                const nr = this.idxMatch + 1;
                this.btnSel.text = 'Ga naar match ' + nr + ' van halve finales';
            }    
        }
    }

    private addKoppelsFromPrevRondeAndPrepare(prevRnd: SpeelRonde, rnd: SpeelRonde) {
        let changed = false;
        const prevMatches = prevRnd.speelDagen[0].matches;
        prevMatches.forEach(match => {
            if (match.koppels[0].uitslag.brt == (rnd.rndBeurten * 2)) {
                const idxKopToAdd = match.koppels.findIndex(kop => !kop.afgevallen);
                if (idxKopToAdd >= 0) {
                    let kopToAdd: RondeKoppel = match.koppels[idxKopToAdd];
                    const idxK = rnd.koppels.findIndex(kop => kop.kopId == kopToAdd.kopId);
                    if (idxK < 0) {
                        changed = true;
                        kopToAdd = JSON.parse(JSON.stringify(kopToAdd));
                        kopToAdd.ingepland = true;
                        this.addUitslagToOtherUitslag(kopToAdd.uitslag, kopToAdd.totNuToe);
                        kopToAdd.uitslag = new Uitslag();
                        kopToAdd.splUitslagen.forEach(splUit => {
                            this.addUitslagToOtherUitslag(splUit.uitslag, splUit.totNuToe);
                            splUit.uitslag = new Uitslag();
                        });
                        if (rnd.moyBepalen) {
                            kopToAdd.kopMoyenne = kopToAdd.totNuToe.moy;
                            kopToAdd.spelers.forEach((spl, idx) => {
                                spl.splMoy = kopToAdd.splUitslagen[idx].totNuToe.moy;
                                spl.splHand = this.helper.getHandicap(spl.splMoy);
                            });
                            if (kopToAdd.spelers[0].splMoy > kopToAdd.spelers[1].splMoy) {
                                const tempSpl: KoppelSpeler = JSON.parse(JSON.stringify(kopToAdd.spelers[0]));
                                kopToAdd.spelers[0] = kopToAdd.spelers[1];
                                kopToAdd.spelers[1] = tempSpl;
                                const tempUit: KoppelSpelerUitslagen = JSON.parse(JSON.stringify(kopToAdd.splUitslagen[0]));
                                kopToAdd.splUitslagen[0] = kopToAdd.splUitslagen[1];
                                kopToAdd.splUitslagen[1] = tempUit;
                            }
                        }
                        rnd.koppels.push(kopToAdd);
                    }
                }
            }
        });
        if (!rnd.speelDagen.length) {
            let dag = new RondeSpeelDag(1);
            dag.dagId = '1';
            dag.datum = prevRnd.speelDagen[0].datum;
            dag.dagNaam = prevRnd.speelDagen[0].dagNaam;
            dag.dagNr = prevRnd.speelDagen[0].dagNr;
            rnd.speelDagen.push(dag);
            changed = true;
        }
        rnd.koppels.forEach((kop, idx) => {
            rnd.speelDagen[0].matches[0].koppelIds[idx] = kop.kopId;
        });
        rnd.speelDagen[0].matches[0].koppels = [];

        if (changed) {
            this.dao.saveSpeelRondeFile(this.header.seizoen, rnd.fileNaam, rnd)
            .then(resp => {
                this.prepareAfvalRonde(rnd);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            this.prepareAfvalRonde(rnd);
        }
    }

    private prepareAfvalRonde(rnd: SpeelRonde) {
        rnd.speelDagen.forEach(sd => {
            sd.matches.forEach(match => {
                match.koppels = [];
                match.koppelIds.forEach(id => {
                    if (id == '') {
                        match.koppels.push(new RondeKoppel());
                    }
                    else {
                        const kop = rnd.koppels.find(kpl => kpl.kopId == id);
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
    }

    private moveUp() {
        if (this.idxRonde != 0) {
            return;
        }
        let m = this.idxMatch;
        m--;
        if (m < 0) {
            m = this.afvalRondes[0].speelDagen[0].matches.length - 1;
        }
        this.idxMatch = m;
        this.selectMatch();
    }
    
    private moveDown() {
        if (this.idxRonde != 0) {
            return;
        }
        let m = this.idxMatch;
        m++;
        if (m >= this.afvalRondes[0].speelDagen[0].matches.length) {
            m = 0;
        }
        this.idxMatch = m;
        this.selectMatch();
    }

}
