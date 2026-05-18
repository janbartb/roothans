import { Component, HostListener, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Seizoen } from '../../model/seizoen';
import { Koppel } from '../../model/koppel';
import { Ronde } from '../../model/ronde';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';

@Component({
    selector: 'app-seizoen-menu',
    imports: [
        Button
    ],
    templateUrl: './seizoen-menu.html',
    styleUrl: './seizoen-menu.css',
})
export class SeizoenMenu extends Base implements OnInit {
    config: Seizoen = new Seizoen()
    koppels: Koppel[] = [];
    rondes: Ronde[] = [];
    aantSpelers: number = 0;

    btnSettings: Btn = new Btn('set', 'Instellingen', 'I', 1);
    btnKoppels: Btn = new Btn('kop', 'Koppels', 'K', 1);
    btnRondes: Btn = new Btn('ron', 'Rondes', 'R', 1);
    btnSpelers: Btn = new Btn('spl', 'Spelers', 'S', 1);

    enterPressed() {
        if (this.btnKoppels.default) {
            this.buttonPressed(this.btnKoppels);
        }
        else if (this.btnRondes.default) {
            this.buttonPressed(this.btnRondes);
        }
        else if (this.btnSpelers.default) {
            this.buttonPressed(this.btnSpelers);
        }
    }

    settingsClicked() {
        this.gotoPage('settings', 'seizoen');
    }

    spelersClicked() {
        this.gotoPage('spelers', 'seizoen');
    }

    koppelsClicked() {
        this.gotoPage('koppels', 'seizoen');
    }

    rondesClicked() {
        this.gotoPage('rondes', 'seizoen');
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyI') {
            this.buttonPressed(this.btnSettings);
            return false;
        }
        if (event.code === 'KeyK') {
            this.buttonPressed(this.btnKoppels);
            return false;
        }
        if (event.code === 'KeyR') {
            this.buttonPressed(this.btnRondes);
            return false;
        }
        if (event.code === 'KeyS') {
            this.buttonPressed(this.btnSpelers);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getSpelers()
        ])
        .then(results => {
            this.config = results[0];
            this.koppels = results[1];
            this.rondes = results[2];
            this.aantSpelers = results[3].length;
            if (this.config.huidigeRonde > 0 || this.koppels.length == this.config.maxKoppels) {
                this.btnRondes.default = true;
                return;
            }
            if (this.aantSpelers < (2 * this.config.maxKoppels)) {
                this.btnSpelers.default = true;
            }
            else {
                this.btnKoppels.default = true;
            }
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
                if (btn.id == 'kop') {
                    this.koppelsClicked();
                }
                else if (btn.id == 'ron') {
                    this.rondesClicked();
                }
                else if (btn.id == 'spl') {
                    this.spelersClicked();
                }
                else if (btn.id == 'set') {
                    this.settingsClicked();
                }
            }, 250);
        }, 250);
    }

}
