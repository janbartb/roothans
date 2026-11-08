import { Component, HostListener, inject, OnInit } from '@angular/core';
import { OvzSpeeldagWide } from '../ovz-speeldag-wide/ovz-speeldag-wide';
import { Button } from '../../../../shared/button/button';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { SpeelRonde } from '../../../../model/ronde';
import { Btn } from '../../../../model/misc';
import { RondeKoppel } from '../../../../model/koppel';

@Component({
    selector: 'app-finales-overzicht',
    imports: [
        OvzSpeeldagWide,
        Button
    ],
    templateUrl: './finales-overzicht.html',
    styleUrl: './finales-overzicht.css',
})
export class FinalesOverzicht extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    ovzType: string = 'pln';
    halveRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    finaleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    btnPrint: Btn = new Btn('print', 'Print overzicht', 'enter');

    printOvz() {
        window.print();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.btnPrint);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzicht finales ';

        const type: string | null = this.route.snapshot.paramMap.get('type');
        if (!type) {
            this.alert.showError('Kan overzicht type in URL niet vinden.');
            return;
        }
        this.ovzType = type;
        this.header.subtitle += this.ovzType == 'pln' ? '- planning' : '- resultaat';
        
        this.dao.getRondes(this.header.seizoen)
        .then(rondes => {
            const idx = rondes.findIndex(rnd => rnd.rndNaam == 'Finale');
            if (idx < 0) {
                this.alert.showError(`Ronde met naam 'Finale' niet gevonden in rondes file.`);
                return;
            }
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, rondes[idx - 1].fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, rondes[idx].fileNaam)
            ])
            .then(results => {
                results.forEach(rnd => {
                    rnd.speelDagen.forEach(sd => {
                        sd.matches.forEach(match => {
                            match.koppels = [];
                            match.koppelIds.forEach(kpId => {
                                if (kpId == '') {
                                    const k = new RondeKoppel();
                                    k.kopId = kpId;
                                    match.koppels.push(k);
                                }
                                else {
                                    const idx = rnd.koppels.findIndex(kpl => kpl.kopId == kpId);
                                    if (idx < 0) {
                                        const k = new RondeKoppel();
                                        k.kopId = kpId;
                                        match.koppels.push(k);
                                    }
                                    else {
                                        match.koppels.push(rnd.koppels[idx]);
                                    }
                                }
                            });
                        });
                    });    
                });
                this.halveRonde = results[0];
                this.finaleRonde = results[1];
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
                if (btn.id == 'print') {
                    this.printOvz();
                }
            }, 250);
        }, 250);
    }

}
