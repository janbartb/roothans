import { Component, inject, OnInit } from '@angular/core';
import { Scorebord } from '../../../shared/scorebord/scorebord';
import { Base } from '../../../base/base';
import { Poule, PouleRonde, Ronde, RondeKoppel, Uitslag } from '../../../model/ronde';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../model/seizoen';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { ConfirmDialogType } from '../../../model/dialogs';

@Component({
    selector: 'app-poule-ronde-score',
    imports: [
        Scorebord
    ],
    templateUrl: './poule-ronde-score.html',
    styleUrl: './poule-ronde-score.css',
})
export class PouleRondeScore extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    poule: Poule = new Poule();
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;
    koppels: RondeKoppel[] = [];
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
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.poule = this.pouleRonde.poules[pouleIdx];
                const splKopIdx = this.poule.pouleKoppels.findIndex(kpl => kpl.id == splKopId);
                const tegKopIdx = this.poule.pouleKoppels.findIndex(kpl => kpl.id == tegKopId);
                this.koppels.push(this.poule.pouleKoppels[splKopIdx]);
                this.koppels.push(this.poule.pouleKoppels[tegKopIdx]);
                this.idxWed = wedIdx;
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
        const splKoppel = this.koppels.find(kpl => kpl.id == wedSpl.splKoppelId);
        if (!splKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedSpl.splKoppelId} van speler 1 niet gevonden`);
            return;
        }
        const tegKoppel = this.koppels.find(kpl => kpl.id == wedTeg.splKoppelId);
        if (!tegKoppel) {
            this.alert.showError(`Error uitslag wedstrijd toevoegen : koppel ${wedTeg.splKoppelId} van speler 2 niet gevonden`);
            return;
        }
        const kplSpl = splKoppel.spelers[this.idxWed];
        const kplTeg = tegKoppel.spelers[this.idxWed];
        // speler uitslag
        let splWed = kplSpl.wedstrijden.find(wedstrijd => wedstrijd.tegPouleKoppelId == tegKoppel.id);
        if (!splWed) {
            this.alert.showError('Wedstrijd van speler niet gevonden in poule ronde file.');
            return;
        }
        splWed.metWit = wedSpl.metWit;
        splWed.score = wedSpl.stand.score;
        splWed.wedDatum = vandaag;
        splWed.uitslag.brt = wedSpl.stand.aantBrt;
        splWed.uitslag.car = wedSpl.stand.aantCar;
        splWed.uitslag.moy = wedSpl.stand.gemiddelde;
        splWed.uitslag.pnt = wedSpl.stand.punten;
        splWed.uitslag.ser = wedSpl.stand.hoogSer;
        kplSpl.uitslag = new Uitslag();
        kplSpl.wedstrijden.forEach(wd => {
            kplSpl.uitslag.brt += wd.uitslag.brt;
            kplSpl.uitslag.car += wd.uitslag.car;
            kplSpl.uitslag.pnt += wd.uitslag.pnt;
            if (wd.uitslag.ser > kplSpl.uitslag.ser) {
                kplSpl.uitslag.ser = wd.uitslag.ser;
            }
        });
        kplSpl.uitslag.moy = (kplSpl.uitslag.brt == 0) ? 0 : kplSpl.uitslag.car / kplSpl.uitslag.brt;

        splKoppel.uitslag = new Uitslag();
        splKoppel.spelers.forEach(ks => {
            splKoppel.uitslag.brt += ks.uitslag.brt;
            splKoppel.uitslag.car += ks.uitslag.car;
            splKoppel.uitslag.pnt += ks.uitslag.pnt;
            if (ks.uitslag.ser > splKoppel.uitslag.ser) {
                splKoppel.uitslag.ser = ks.uitslag.ser;
            }
        });
        splKoppel.uitslag.moy = (splKoppel.uitslag.brt == 0) ? 0 : splKoppel.uitslag.car / splKoppel.uitslag.brt;
        // tegenstander uitslag
        let tegWed = kplTeg.wedstrijden.find(wedstrijd => wedstrijd.tegPouleKoppelId == splKoppel.id);
        if (!tegWed) {
            this.alert.showError('Wedstrijd van tegenstander niet gevonden in poule ronde file.');
            return;
        }
        tegWed.metWit = wedTeg.metWit;
        tegWed.score = wedTeg.stand.score;
        tegWed.wedDatum = vandaag;
        tegWed.uitslag.brt = wedTeg.stand.aantBrt;
        tegWed.uitslag.car = wedTeg.stand.aantCar;
        tegWed.uitslag.moy = wedTeg.stand.gemiddelde;
        tegWed.uitslag.pnt = wedTeg.stand.punten;
        tegWed.uitslag.ser = wedTeg.stand.hoogSer;
        kplTeg.uitslag = new Uitslag();
        kplTeg.wedstrijden.forEach(wd => {
            kplTeg.uitslag.brt += wd.uitslag.brt;
            kplTeg.uitslag.car += wd.uitslag.car;
            kplTeg.uitslag.pnt += wd.uitslag.pnt;
            if (wd.uitslag.ser > kplTeg.uitslag.ser) {
                kplTeg.uitslag.ser = wd.uitslag.ser;
            }
        });
        kplTeg.uitslag.moy = (kplTeg.uitslag.brt == 0) ? 0 : kplTeg.uitslag.car / kplTeg.uitslag.brt;
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.spelers.forEach(ks => {
            tegKoppel.uitslag.brt += ks.uitslag.brt;
            tegKoppel.uitslag.car += ks.uitslag.car;
            tegKoppel.uitslag.pnt += ks.uitslag.pnt;
            if (ks.uitslag.ser > tegKoppel.uitslag.ser) {
                tegKoppel.uitslag.ser = ks.uitslag.ser;
            }
        });
        tegKoppel.uitslag.moy = (tegKoppel.uitslag.brt == 0) ? 0 : tegKoppel.uitslag.car / tegKoppel.uitslag.brt;
        // opslaan
        this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
        .then(resp => {
            this.alert.showSuccess('Uitslag succesvol opgeslagen.');
            this.wedstrijd.wedOpgeslagen = true;
            this.dao.saveWedstrijd(wed)
            .then(resp => {
                if (andGoBack) {
                    super.escapePressed();
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

    private createNieuweWedstrijd(): Wedstrijd {
        let wed = new Wedstrijd();
        wed.rondeId = this.ronde.rndId;
        wed.pouleId = this.poule.pouleId;
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
            spl.splId = kopSpl.speler.splId;
            spl.splNaam = kopSpl.speler.splNaam;
            spl.splBordNaam = kopSpl.speler.splBNaam;
            spl.splSpreekNaam = kopSpl.speler.splSnaam;
            spl.splTsMoy = kopSpl.speler.splMoy;
            spl.splTsBrt = wed.regels.vastAantBrt;
            spl.metWit = idx == 0;
            spl.splKoppelId = kpl.id;
            wed.spelers.push(spl);
        });
        return wed;
    }

    private gelezenWedstrijdIsGeselecteerdeWedstrijd(): boolean {
        return !this.wedstrijd.wedGespeeld &&
                this.wedstrijd.rondeId == this.ronde.rndId &&
                this.wedstrijd.pouleId == this.poule.pouleId &&
                this.wedstrijd.spelers.every(spl => {
                    return spl.splId == this.koppels[0].spelers[this.idxWed].speler.splId || spl.splId == this.koppels[1].spelers[this.idxWed].speler.splId;
                });
    }

    private comparePouleKoppels(a: RondeKoppel, b: RondeKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

}
