import { Component, HostListener, inject, OnInit } from '@angular/core';
import { OvzPoule } from '../ovz-poule/ovz-poule';
import { Button } from '../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { Base } from '../../../../base/base';
import { RondeKoppel } from '../../../../model/koppel';
import { Btn } from '../../../../model/misc';
import { ActivatedRoute } from '@angular/router';
import { SpeelRonde } from '../../../../model/ronde';

@Component({
    selector: 'app-voorronde-overzicht',
    imports: [
        OvzPoule,
        Button,
        NgClass
    ],
    templateUrl: './voorronde-overzicht.html',
    styleUrl: './voorronde-overzicht.css',
})
export class VoorrondeOverzicht extends Base implements OnInit {
    route = inject(ActivatedRoute);
    ovzType: string = 'pln';
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzicht Poule ronde ';
        
        const type: string | null = this.route.snapshot.paramMap.get('type');
        if (!type) {
            this.alert.showError('Kan overzicht type in URL niet vinden.');
            return;
        }
        this.ovzType = type;
        this.header.subtitle += type == 'pln' ? '- planning' : '- resultaat';
        
        this.dao.getRondes(this.header.seizoen)
        .then(rondes => {
            const rnd = rondes[0];
            if (!rnd) {
                this.alert.showError('Poule ronde niet gevonden in rondes file.');
                return;
            }
            this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                console.log(this.pouleRonde);
                this.pouleRonde.poules.forEach(pl => {
                    pl.koppels = [];
                    pl.koppelIds.forEach(kpId => {
                        if (kpId == '') {
                            const k = new RondeKoppel();
                            k.kopId = kpId;
                            pl.koppels.push(k);
                        }
                        else {
                            const idx = this.pouleRonde.koppels.findIndex(kpl => kpl.kopId == kpId);
                            if (idx < 0) {
                                const k = new RondeKoppel();
                                k.kopId = kpId;
                                pl.koppels.push(k);
                            }
                            else {
                                pl.koppels.push(this.pouleRonde.koppels[idx]);
                            }
                        }
                    });
                    if (this.ovzType == 'res') {
                        pl.koppels.sort(this.comparePouleKoppels);
                    }
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

    private comparePouleKoppels(a: RondeKoppel, b: RondeKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            if ((b.uitslag.moy / b.kopMoyenne) == (a.uitslag.moy / a.kopMoyenne)) {
                return b.kopMoyenne - a.kopMoyenne;
            }
            else {
                return (b.uitslag.moy / b.kopMoyenne) - (a.uitslag.moy / a.kopMoyenne);
            }
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

}
