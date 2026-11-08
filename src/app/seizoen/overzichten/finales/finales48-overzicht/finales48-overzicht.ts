import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { Btn } from '../../../../model/misc';
import { RondeKoppel } from '../../../../model/koppel';
import { SpeelRonde } from '../../../../model/ronde';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Button } from '../../../../shared/button/button';
import { OvzSpeeldagWide } from '../ovz-speeldag-wide/ovz-speeldag-wide';

@Component({
    selector: 'app-finales48-overzicht',
    imports: [
        OvzSpeeldagWide,
        Button
    ],
    templateUrl: './finales48-overzicht.html',
    styleUrl: './finales48-overzicht.css',
})
export class Finales48Overzicht extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    ovzType: string = 'pln';
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
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

        const id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);

        const type: string | null = this.route.snapshot.paramMap.get('type');
        if (!type) {
            this.alert.showError('Kan overzicht type in URL niet vinden.');
            return;
        }
        this.ovzType = type;
        
        this.dao.getRondes(this.header.seizoen)
        .then(rondes => {
            const rnd = rondes.find(rnd => rnd.rndId == rondeId);
            if (!rnd) {
                this.alert.showError(`Ronde met ID '${rondeId}' niet gevonden in rondes file.`);
                return;
            }
            this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzicht ' + rnd.rndNaam + ' ';
            this.header.subtitle += this.ovzType == 'pln' ? '- planning' : '- resultaat';
            this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                console.log(this.afvalRonde);
                this.afvalRonde.speelDagen.forEach(sd => {
                    sd.matches.forEach(match => {
                        match.koppels = [];
                        match.koppelIds.forEach(kpId => {
                            if (kpId == '') {
                                const k = new RondeKoppel();
                                k.kopId = kpId;
                                match.koppels.push(k);
                            }
                            else {
                                const idx = this.afvalRonde.koppels.findIndex(kpl => kpl.kopId == kpId);
                                if (idx < 0) {
                                    const k = new RondeKoppel();
                                    k.kopId = kpId;
                                    match.koppels.push(k);
                                }
                                else {
                                    match.koppels.push(this.afvalRonde.koppels[idx]);
                                }
                            }
                        });
                    });
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
