import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PouleKoppel, PouleKoppelWedstrijd } from '../../model/ronde';
import { DecimalPipe, NgClass } from '@angular/common';
import { KoppelSpeler } from '../../model/speler';

class Wedstrijd {
    spelers: PouleKoppelWedstrijd[] = [];
}

@Component({
    selector: 'app-match-view',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './match-view.html',
    styleUrl: './match-view.css',
})
export class MatchView implements OnInit {
    @Input() koppels: PouleKoppel[] = [];
    @Input() idxSel: number = -1;
    @Input() idxWedBezig: number = -1;
    @Output() wedClicked: EventEmitter<number> = new EventEmitter();
    @Output() error: EventEmitter<string> = new EventEmitter();
    wedstrijden: Wedstrijd[] = [];
    totaal: Wedstrijd = new Wedstrijd();

    wedstrijdClicked(idx: number) {
        this.wedClicked.emit(idx);
    }

    ngOnInit(): void {
        let errMsg = '';
        [0, 1].forEach(idxWed => {
            let wedstrijd = new Wedstrijd();
            this.koppels.forEach((kpl, idxKpl) => {
                const tegKoppel = this.koppels[Math.abs(idxKpl - 1)];
                const splWed = kpl.spelers[idxWed].wedstrijden.find(wed => wed.tegPouleKoppelId == tegKoppel.id);
                if (splWed) {
                    wedstrijd.spelers.push(splWed);
                }
                else {
                    errMsg = `MatchView : Wedstrijd van ${kpl.spelers[idxWed].speler.splNaam} tegen koppel ${tegKoppel.id} niet gevonden`;
                }
            });
            this.wedstrijden.push(wedstrijd);
        });
        if (errMsg != '') {
            this.error.emit(errMsg);
            return;
        }
        let wedstrijd = new Wedstrijd();
        wedstrijd.spelers.push(new PouleKoppelWedstrijd(new KoppelSpeler()));
        wedstrijd.spelers.push(new PouleKoppelWedstrijd(new KoppelSpeler()));
        this.wedstrijden.forEach(wed => {
            wed.spelers.forEach((spl, idxSpl) => {
                wedstrijd.spelers[idxSpl].uitslag.car += spl.uitslag.car;
                wedstrijd.spelers[idxSpl].uitslag.brt += spl.uitslag.brt;
                wedstrijd.spelers[idxSpl].uitslag.pnt += spl.uitslag.pnt;
                if (spl.uitslag.ser > wedstrijd.spelers[idxSpl].uitslag.ser) {
                    wedstrijd.spelers[idxSpl].uitslag.ser = spl.uitslag.ser;
                }
            });
        });
        wedstrijd.spelers.forEach(spl => {
            spl.uitslag.moy = (spl.uitslag.brt == 0) ? 0 : spl.uitslag.car / spl.uitslag.brt;
        });
        this.totaal = wedstrijd;
    }
}
