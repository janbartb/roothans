import { Component, inject, OnInit } from '@angular/core';
import { Scorebord } from '../../../../../shared/scorebord/scorebord';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { WedSpeler, Wedstrijd } from '../../../../../model/wedstrijd';
import { KoppelSpeler } from '../../../../../model/speler';
import { Uitslag } from '../../../../../model/misc';
import { Base } from '../../../../../base/base';

@Component({
    selector: 'app-afval-scorebord',
    imports: [
        Scorebord
    ],
    templateUrl: './afval-scorebord.html',
    styleUrl: './afval-scorebord.css',
})
export class AfvalScorebord extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;
    koppels: RondeKoppel[] = [];
    splSpl: KoppelSpeler = new KoppelSpeler();
    tegSpl: KoppelSpeler = new KoppelSpeler();
    splWed: Uitslag = new Uitslag();
    tegWed: Uitslag = new Uitslag();
    idxDag: number = -1;
    idxMatch: number = -1;
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

        id = this.route.snapshot.paramMap.get('dagId');
        if (!id) {
            this.alert.showError('Kan dag ID in URL niet vinden.');
            return;
        }
        const dagId = id;

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
        
        const idx = this.route.snapshot.paramMap.get('wedIdx');
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
            this.idxWed = wedIdx;
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                console.log(this.afvalRonde);
                this.idxDag = this.afvalRonde.speelDagen.findIndex(sdag => sdag.dagId == dagId);
                if (this.idxDag < 0) {
                    this.alert.showError(`Speeldag met ID '${dagId}' niet gevonden.`);
                    return;
    
                }
                const dag = this.afvalRonde.speelDagen[this.idxDag];
                this.idxMatch = dag.matches.findIndex(mat => mat.koppelIds.includes(splKopId) && mat.koppelIds.includes(tegKopId));
                if (this.idxMatch < 0) {
                    this.alert.showError(`AfvalMatch met koppel IDs '${splKopId} - ${tegKopId}' niet gevonden.`);
                    return;
                }
                this.match = dag.matches[this.idxMatch];
                this.match.koppelIds.forEach((kplId, idx) => {
                    if (kplId != '') {
                        const foundKoppel = this.afvalRonde.koppels.find(kpl => kpl.kopId == kplId);
                        if (foundKoppel) {
                            this.match.koppels[idx] = foundKoppel;
                        }
                    }
                });
                this.koppels = this.match.koppels;
                this.splSpl = this.koppels[0].spelers[this.idxWed];
                this.tegSpl = this.koppels[1].spelers[this.idxWed];
                this.splWed = this.koppels[0].splUitslagen[this.idxWed].uitslag;
                this.tegWed = this.koppels[1].splUitslagen[this.idxWed].uitslag;
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
        const splKoppel = this.koppels.find(kpl => kpl.kopId == wedSpl.splKoppelId);
        if (!splKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedSpl.splKoppelId} van speler 1 niet gevonden`);
            return;
        }
        const tegKoppel = this.koppels.find(kpl => kpl.kopId == wedTeg.splKoppelId);
        if (!tegKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedTeg.splKoppelId} van speler 2 niet gevonden`);
            return;
        }
        // speler wedstrijd uitslag
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.splWed = splKoppel.splUitslagen[this.idxWed].uitslag;
        this.splWed.metWit = wedSpl.metWit;
        this.splWed.brt = wedSpl.stand.aantBrt;
        this.splWed.car = wedSpl.stand.aantCar;
        this.splWed.moy = wedSpl.stand.gemiddelde;
        this.setSpelerPunten(this.splWed, wedSpl.stand.aantCar, wedTeg.stand.aantCar, wedSpl.stand.gemiddelde, this.splSpl.splMoy);
        this.splWed.ser = wedSpl.stand.hoogSer;
        this.splWed.sco = wedSpl.stand.score;
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.splUitslagen.forEach(splUit => {
            this.addUitslagToOtherUitslag(splUit.uitslag, splKoppel.uitslag);
        });

        // tegenstander wedstrijd uitslag
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.tegWed = tegKoppel.splUitslagen[this.idxWed].uitslag;
        this.tegWed.metWit = wedTeg.metWit;
        this.tegWed.brt = wedTeg.stand.aantBrt;
        this.tegWed.car = wedTeg.stand.aantCar;
        this.tegWed.moy = wedTeg.stand.gemiddelde;
        this.setSpelerPunten(this.tegWed, wedTeg.stand.aantCar, wedSpl.stand.aantCar, wedTeg.stand.gemiddelde, this.tegSpl.splMoy);
        this.tegWed.ser = wedTeg.stand.hoogSer;
        this.tegWed.sco = wedTeg.stand.score;
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.splUitslagen.forEach(splUit => {
            this.addUitslagToOtherUitslag(splUit.uitslag, tegKoppel.uitslag);
        });
        this.afvalRonde.status.gestart = true;
        this.afvalRonde.status.gereed = this.afvalRonde.koppels.every(kp => kp.uitslag.brt == (2 * this.ronde.rndBeurten));
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        const matchToSave: RondeMatch = rondeToSave.speelDagen[this.idxDag].matches[this.idxMatch];
        matchToSave.koppelIds = matchToSave.koppels.map(k => k.kopId);
        matchToSave.koppels = [];
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.wedstrijd.wedOpgeslagen = true;
            this.dao.saveWedstrijd(wed)
            .then(resp => {
                if (this.ronde.status.gereed != this.afvalRonde.status.gereed || this.ronde.status.gestart != this.afvalRonde.status.gestart) {
                    this.ronde.status.gereed = this.afvalRonde.status.gereed;
                    this.ronde.status.gestart = this.afvalRonde.status.gestart;
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
            spl.splKoppelId = kpl.kopId;
            wed.spelers.push(spl);
        });
        return wed;
    }

    private gelezenWedstrijdIsGeselecteerdeWedstrijd(): boolean {
        return !this.wedstrijd.wedGespeeld &&
                this.wedstrijd.rondeId == this.ronde.rndId &&
                this.wedstrijd.spelers.every(spl => {
                    return spl.splId == this.koppels[0].spelers[this.idxWed].splId || spl.splId == this.koppels[1].spelers[this.idxWed].splId;
                });
    }

}
