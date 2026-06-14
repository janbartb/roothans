import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { Scorebord } from '../../../../../shared/scorebord/scorebord';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { WedSpeler, Wedstrijd } from '../../../../../model/wedstrijd';
import { KoppelMatch, KoppelWedstrijd, RondeKoppel } from '../../../../../model/koppel';
import { KoppelSpeler } from '../../../../../model/speler';
import { Uitslag } from '../../../../../model/misc';

@Component({
    selector: 'app-poule-scorebord',
    imports: [
        Scorebord
    ],
    templateUrl: './poule-scorebord.html',
    styleUrl: './poule-scorebord.css',
})
export class PouleScorebord extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poule: Poule = new Poule(0);
    idxPoule: number = -1;
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;
    koppels: RondeKoppel[] = [];
    splSpl: KoppelSpeler = new KoppelSpeler();
    tegSpl: KoppelSpeler = new KoppelSpeler();
    splMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    tegMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    splWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 0);
    tegWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 1);
    idxWed: number = -1;

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'OpslaanAndEscape') {
            this.uitslagWedstrijdToevoegen(this.wedstrijd, true);
        }
        else if (key == 'Lijst') {
            // const toUrl = this.router.url.replace('score', 'lijst');
            // this.gotoPage(this.router.url, toUrl);
        }
        else if (key == 'Opslaan') {
            this.uitslagWedstrijdToevoegen(this.wedstrijd);
        }
    }

    saveWedstrijd(wed: Wedstrijd) {
        this.dao.saveWedstrijd(wed)
        .then()
        .catch(err => {
            this.alert.showError(err);
        });
    } 

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'scorebord';

        let id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);

        let idx: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        if (!idx) {
            this.alert.showError('Kan poule index in URL niet vinden.');
            return;
        }
        const pouleIdx = Number(idx);

        id = this.route.snapshot.paramMap.get('splKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 1 in URL niet vinden.');
            return;
        }
        const splKopId = id;

        id = this.route.snapshot.paramMap.get('tegKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 2 in URL niet vinden.');
            return;
        }
        const tegKopId = id;
        
        idx = this.route.snapshot.paramMap.get('wedIdx');
        if (!idx) {
            this.alert.showError('Kan wedstrijd index in URL niet vinden.');
            return;
        }
        const wedIdx = Number(idx);
        
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getWedstrijd()
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            if (results[2].gevonden) {
                this.wedstrijd = results[2].wedstrijd;
            }
            const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idxRonde < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idxRonde];
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.idxPoule = pouleIdx;
                this.poule = this.pouleRonde.poules[this.idxPoule];
                this.poule.koppels = [];
                let aantKoppels = this.poule.koppelIds.length;
                while (aantKoppels--) this.poule.koppels.push(new RondeKoppel()); 
                this.poule.koppelIds.forEach((kplId, idx) => {
                    if (kplId != '') {
                        const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                        if (foundKoppel) {
                            this.poule.koppels[idx] = foundKoppel;
                        }
                    }
                });
                const splKopIdx = this.poule.koppels.findIndex(kpl => kpl.pouleKplId == splKopId);
                const tegKopIdx = this.poule.koppels.findIndex(kpl => kpl.pouleKplId == tegKopId);
                this.koppels.push(this.poule.koppels[splKopIdx]);
                this.koppels.push(this.poule.koppels[tegKopIdx]);
                this.idxWed = wedIdx;
                this.splSpl = this.koppels[0].spelers[this.idxWed];
                this.tegSpl = this.koppels[1].spelers[this.idxWed];
                // spl match
                let foundMatch = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
                if (!foundMatch) {
                    this.alert.showError(`Speler match niet gevonden.`);
                    return;
                }
                this.splMatch = foundMatch;
                this.splWed = this.splMatch.wedstrijden[this.idxWed];
                // teg match
                foundMatch = this.koppels[1].matches.find(m => m.tegKoppelId == this.koppels[0].kopId);
                if (!foundMatch) {
                    this.alert.showError(`Tegenstander match niet gevonden.`);
                    return;
                }
                this.tegMatch = foundMatch;
                this.tegWed = this.tegMatch.wedstrijden[this.idxWed];
                if (!this.gelezenWedstrijdIsGeselecteerdeWedstrijd()) {
                    this.wedstrijd = this.createNieuweWedstrijd();
                    this.dao.saveWedstrijd(this.wedstrijd)
                    .then(resp => {
                        this.wedReady = true;
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
                else {
                    this.wedReady = true;
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private uitslagWedstrijdToevoegen(wed: Wedstrijd, andGoBack?: boolean) {
        const vandaag = new Date().toISOString().substring(0, 10);
        const wedSpl = wed.spelers[0];
        const wedTeg = wed.spelers[1];
        const splKoppel = this.koppels.find(kpl => kpl.pouleKplId == wedSpl.splKoppelId);
        if (!splKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedSpl.splKoppelId} van speler 1 niet gevonden`);
            return;
        }
        const tegKoppel = this.koppels.find(kpl => kpl.pouleKplId == wedTeg.splKoppelId);
        if (!tegKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedTeg.splKoppelId} van speler 2 niet gevonden`);
            return;
        }
        // speler wedstrijd uitslag
        this.splWed.uitslag = new Uitslag();
        this.splWed.metWit = wedSpl.metWit;
        this.splWed.uitslag.brt = wedSpl.stand.aantBrt;
        this.splWed.uitslag.car = wedSpl.stand.aantCar;
        this.splWed.uitslag.moy = wedSpl.stand.gemiddelde;
        this.setSpelerPunten(this.splWed.uitslag, wedSpl.stand.aantCar, wedTeg.stand.aantCar, wedSpl.stand.gemiddelde, this.splSpl.splMoy);
        this.splWed.uitslag.ser = wedSpl.stand.hoogSer;
        this.splWed.uitslag.sco = wedSpl.stand.score;
        // speler uitslagen
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, splKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // speler match uitslag
        this.splMatch.datum = vandaag;
        this.splMatch.uitslag = new Uitslag();
        this.splMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.splMatch.uitslag);
        });
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, splKoppel.uitslag);
        });

        // tegenstander wedstrijd uitslag
        this.tegWed.uitslag = new Uitslag();
        this.tegWed.metWit = wedTeg.metWit;
        this.tegWed.uitslag.brt = wedTeg.stand.aantBrt;
        this.tegWed.uitslag.car = wedTeg.stand.aantCar;
        this.tegWed.uitslag.moy = wedTeg.stand.gemiddelde;
        this.setSpelerPunten(this.tegWed.uitslag, wedTeg.stand.aantCar, wedSpl.stand.aantCar, wedTeg.stand.gemiddelde, this.tegSpl.splMoy);
        this.tegWed.uitslag.ser = wedTeg.stand.hoogSer;
        this.tegWed.uitslag.sco = wedTeg.stand.score;
        // tegenstander uitslagen
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, tegKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // tegenstander match uitslag
        this.tegMatch.datum = vandaag;
        this.tegMatch.uitslag = new Uitslag();
        this.tegMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.tegMatch.uitslag);
        });
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, tegKoppel.uitslag);
        });
        this.poule.status.gestart = true;
        this.poule.status.gereed = this.poule.koppels.every(kp => {
            return kp.matches.every(mat => {
                return mat.wedstrijden.every(wed => wed.uitslag.brt > 0);
            });
        });
        this.pouleRonde.status.gestart = true;
        this.pouleRonde.status.gereed = this.pouleRonde.poules.every(pl => pl.status.gereed);
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        const pouleToSave: Poule = rondeToSave.poules[this.idxPoule];
        pouleToSave.koppelIds = pouleToSave.koppels.map(k => k.kopId);
        pouleToSave.koppels = [];
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.wedstrijd.wedOpgeslagen = true;
            this.dao.saveWedstrijd(wed)
            .then(resp => {
                if (this.ronde.status.gereed != this.pouleRonde.status.gereed || this.ronde.status.gestart != this.pouleRonde.status.gestart) {
                    this.ronde.status.gereed = this.pouleRonde.status.gereed;
                    this.ronde.status.gestart = this.pouleRonde.status.gestart;
                    this.dao.saveRondes(this.header.seizoen, this.rondes)
                    .then(resp2 => {
                        this.alert.showSuccess('Uitslag succesvol opgeslagen.');
                        if (andGoBack) {
                            super.escapePressed();
                        }
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
                else {
                    this.alert.showSuccess('Uitslag succesvol opgeslagen.');
                    if (andGoBack) {
                        super.escapePressed();
                    }
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setSpelerPunten(uitslag: Uitslag, carSpl: number, carTeg: number, gsMoy: number, tsMoy: number) {
        let punten = 0;
        uitslag.weds = 1;
        if (carSpl > carTeg) {
            punten = this.config.pntWinst;
            uitslag.winst = 1;
        }
        else if (carSpl == carTeg) {
            punten = this.config.pntGelijk;
            uitslag.gelijk = 1;
        }
        else {
            uitslag.verlies = 1;
        }
        if (gsMoy > tsMoy) {
            punten += this.config.pntMoyenne;
        }
        uitslag.pnt = punten;
    }

    private addUitslagToOtherUitslag(source: Uitslag, target: Uitslag) {
        target.car += source.car;
        target.brt += source.brt;
        target.moy = (target.brt == 0) ? 0 : target.car / target.brt;
        if (source.ser > target.ser) {
            target.ser = source.ser;
        }
        target.pnt += source.pnt;
        target.weds += source.weds;
        target.winst += source.winst;
        target.gelijk += source.gelijk;
        target.verlies += source.verlies;
    }

    private createNieuweWedstrijd(): Wedstrijd {
        let wed = new Wedstrijd();
        wed.rondeId = this.ronde.rndId;
        wed.pouleId = this.poule.id;
        wed.idxWedstrijd = this.idxWed;
        wed.aantSpelers = 2;
        wed.regels.idxOptie = 1;
        wed.regels.vastAantBrt = this.ronde.rndBeurten;
        wed.telling.idxOptie = 1;
        wed.telling.winstPunten = this.config.pntWinst;
        wed.telling.gelijkPunten = this.config.pntGelijk;
        wed.telling.bovenMoyPunten = this.config.pntMoyenne;
        wed.wedDatum = new Date().toISOString().substring(0, 10);
        this.koppels.forEach((kpl, idx) => {
            let spl = new WedSpeler();
            const kopSpl = kpl.spelers[this.idxWed];
            spl.splId = kopSpl.splId;
            spl.splNaam = kopSpl.splNaam;
            spl.splBordNaam = kopSpl.splBNaam;
            spl.splSpreekNaam = kopSpl.splSnaam;
            spl.splTsMoy = kopSpl.splMoy;
            spl.splTsBrt = wed.regels.vastAantBrt;
            spl.metWit = idx == 0;
            spl.splKoppelId = kpl.pouleKplId;
            wed.spelers.push(spl);
        });
        return wed;
    }

    private gelezenWedstrijdIsGeselecteerdeWedstrijd(): boolean {
        return !this.wedstrijd.wedGespeeld &&
                this.wedstrijd.rondeId == this.ronde.rndId &&
                this.wedstrijd.pouleId == this.poule.id &&
                this.wedstrijd.spelers.every(spl => {
                    return spl.splId == this.koppels[0].spelers[this.idxWed].splId || spl.splId == this.koppels[1].spelers[this.idxWed].splId;
                });
    }

    // private comparePouleKoppels(a: PouleKoppel, b: PouleKoppel): number {
    //     if (a.uitslag.pnt == b.uitslag.pnt) {
    //         return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
    //     }
    //     else {
    //         return b.uitslag.pnt - a.uitslag.pnt;
    //     }
    // }

}
