import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpeelRonde } from '../../../../model/ronde';
import { Btn } from '../../../../model/misc';
import { Base } from '../../../../base/base';
import { RondeKoppel } from '../../../../model/koppel';
import { Button } from '../../../../shared/button/button';
import { DateHelper } from '../../../../services/date-helper';
import { OvzSpeeldag } from '../ovz-speeldag/ovz-speeldag';

@Component({
    selector: 'app-finales16-overzicht',
    imports: [
        OvzSpeeldag,
        Button
    ],
    templateUrl: './finales16-overzicht.html',
    styleUrl: './finales16-overzicht.css',
})
export class Finales16Overzicht extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    ovzType: string = 'pln';
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    btnPrint: Btn = new Btn('print', 'Print overzicht', 'enter');
    dagPerc: number = 25;

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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzicht 16e finales ';
        
        const type: string | null = this.route.snapshot.paramMap.get('type');
        if (!type) {
            this.alert.showError('Kan overzicht type in URL niet vinden.');
            return;
        }
        this.ovzType = type;
        this.header.subtitle += type == 'pln' ? '- planning' : '- resultaat';
        
        this.dao.getRondes(this.header.seizoen)
        .then(rondes => {
            const rnd = rondes.find(rnd => rnd.fileNaam == 'finales-16');
            if (!rnd) {
                this.alert.showError(`Ronde met filenaam 'finales-16' niet gevonden in rondes file.`);
                return;
            }
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
                this.dagPerc = (this.afvalRonde.speelDagen.length) ? 100 / this.afvalRonde.speelDagen.length : 100; 
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
