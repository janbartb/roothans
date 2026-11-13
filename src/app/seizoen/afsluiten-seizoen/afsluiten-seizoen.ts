import { Component, HostListener, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Seizoen } from '../../model/seizoen';
import { KoppelSpeler, Speler } from '../../model/speler';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';
import { Ronde, SpeelRonde } from '../../model/ronde';

@Component({
    selector: 'app-afsluiten-seizoen',
    imports: [
        Button
    ],
    templateUrl: './afsluiten-seizoen.html',
    styleUrl: './afsluiten-seizoen.css',
})
export class AfsluitenSeizoen extends Base implements OnInit {
    seizoen: Seizoen = new Seizoen();
    spelers: Speler[] = [];
    spelersNietGevonden: KoppelSpeler[] = [];
    rondes: Ronde[] = [];
    forceer: boolean = false;
    dataReady: boolean = true;
    busy: boolean = false;

    btnSluit: Btn = new Btn('sluit', 'Seizoen afsluiten', 'enter');
    btnTerug: Btn = new Btn('terug', 'Terug naar hoofdmenu', 'enter');

    afsluitenClicked() {
        this.busy = true;
        this.spelersNietGevonden = [];
        this.forceer = this.btnSluit.text.startsWith('Toch');
        setTimeout(() => {
            this.seizoenAfsluiten();
        }, 1000);
    }

    terugClicked() {
        this.goBackToPage('main');
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.seizoen.afgesloten) {
                this.buttonPressed(this.btnTerug);
            }
            else {
                this.buttonPressed(this.btnSluit);
            }
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} afsluiten`;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getSpelers()
        ])
        .then(results => {
            this.seizoen = results[0];
            this.rondes = results[1];
            this.spelers = results[2];
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
                if (btn.id == 'sluit') {
                    this.afsluitenClicked();
                }
                else {
                    this.terugClicked();
                }
            }, 250);
        }, 250);
    }

    private seizoenAfsluiten() {
        this.spelersNietGevonden = [];
        const spelersToSave: Speler[] = JSON.parse(JSON.stringify(this.spelers));
        const promises: Promise<SpeelRonde>[] = [];
        this.rondes.forEach(rnd => promises.push(this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam)));
        Promise.all(promises)
        .then(splRondes => {
            splRondes.forEach(splRnd => this.processRonde(splRnd, spelersToSave));
            if (this.spelersNietGevonden.length) {
                if (this.forceer) {
                    this.spelersNietGevonden = [];
                }
                else {
                    this.btnSluit.text = 'Toch afsluiten';
                    return;    
                }
            }
            this.dao.saveAllSpelers(spelersToSave)
            .then(resp => {
                const seizoenToSave: Seizoen = JSON.parse(JSON.stringify(this.seizoen));
                seizoenToSave.afgesloten = true;
                this.dao.saveSeizoenfile(this.header.seizoen, seizoenToSave)
                .then(resp => {
                    setTimeout(() => {
                        this.seizoen.afgesloten = this.header.afgesloten = true;
                        sessionStorage.setItem('afgesloten', 'ja');
                        this.busy = false;
                    }, 1000);
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private processRonde(ronde: SpeelRonde, spelers: Speler[]) {
        const koppels = (ronde.rndNaam == 'Finale') ? ronde.koppels : ronde.koppels.filter(kpl => kpl.afgevallen);
        koppels.forEach(kpl => {
            kpl.splUitslagen.forEach((splUit, idx) => {
                this.addUitslagToOtherUitslag(splUit.uitslag, splUit.totNuToe);
                const foundSpeler = spelers.find(sp => sp.id == kpl.spelers[idx].splId);
                if (foundSpeler) {
                    if (!foundSpeler.moyHist) {
                        foundSpeler.moyHist = [];
                    }
                    foundSpeler.moyHist.unshift(foundSpeler.moyenne);
                    foundSpeler.moyenne = splUit.totNuToe.moy;
                }
                else {
                    this.spelersNietGevonden.push(kpl.spelers[idx]);
                }
            });
        });
    }

}
