import { Component, effect, EventEmitter, input, Input, OnInit, Output, signal } from '@angular/core';
import { Ronde } from '../../../model/ronde';
import { Button } from '../../../shared/button/button';
import { Btn } from '../../../model/misc';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-ronde-view',
    imports: [
        Button,
        NgClass
    ],
    templateUrl: './ronde-view.html',
    styleUrl: './ronde-view.css',
})
export class RondeView implements OnInit {
    btnPressed = input('');
    @Input() ronde: Ronde = new Ronde(0, '', '', 0, '');
    @Input() prevRonde: Ronde = new Ronde(0, '', '', 0, '');
    @Input() type: string = 'row';
    @Output() plannenClicked: EventEmitter<number> = new EventEmitter();
    @Output() spelenClicked: EventEmitter<number> = new EventEmitter();

    btnPlan: Btn = new Btn('plan', 'Plannen', 'P', 1);
    btnSpel: Btn = new Btn('spel', 'Spelen', 'S', 1);

    constructor() {
        effect(() => {
            const btnId = this.btnPressed();
            if (btnId == 'plan') {
                this.buttonPressed(this.btnPlan);
            }
            else if (btnId == 'spel') {
                this.buttonPressed(this.btnSpel);
            }
        });
    }

    btnPlanClicked() {
        this.plannenClicked.emit(this.ronde.rndId);
    }

    btnSpelClicked() {
        this.spelenClicked.emit(this.ronde.rndId);
    }

    ngOnInit(): void {
        if (!this.ronde.status.gepland) {
            this.btnPlan.default = true;
        }
        else {
            this.btnSpel.default = true;
        }
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'plan') {
                    this.btnPlanClicked();
                }
                else if (btn.id == 'spel') {
                    this.btnSpelClicked();
                }
            }, 250);
        }, 250);
    }


}
