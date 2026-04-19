import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../base/base';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicateNumbers, validJaar } from '../directives/validators';
import { Btn } from '../model/misc';
import { Button } from '../shared/button/button';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-main-menu',
    imports: [
        ReactiveFormsModule,
        Button,
        NgClass
    ],
    templateUrl: './main-menu.html',
    styleUrl: './main-menu.css',
})
export class MainMenu extends Base implements OnInit {
    fb = inject(FormBuilder);
    seizoenen: number[] = [];
    selSeizoen: number = 0;
    newSeizoen: number = 0;
    minSeizoen: number = 0;
    maxSeizoen: number = 9999;

    btnNieuw: Btn = new Btn('new', 'Start nieuw seizoen :');
    btnSelect: Btn = new Btn('sel', 'Ga naar seizoen :');
    btnSpelers: Btn = new Btn('spl', 'Onderhoud spelers');
    btnProbeer: Btn = new Btn('try', 'Probeer');

    nieuwForm!: FormGroup;
    selectForm!: FormGroup;

    buttonSelectClicked() {
        if (!(this.selectForm && this.selectForm.valid)) {
            return;
        }
        this.gotoSeizoen(this.selSeiz?.value);
    }

    buttonNieuwClicked() {
        if (!(this.nieuwForm && this.nieuwForm.valid)) {
            return;
        }
        //const seiz = {'seizoen': this.newSeiz?.value}
        this.dao.createSeizoen(this.newSeiz?.value)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.gotoSeizoen(this.newSeiz?.value);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    buttonSpelersClicked() {
        this.gotoPage('spelers', 'main');
    }

    buttonProbeerClicked() {
        this.gotoPage('probeer', 'main');
    }

    override ngOnInit(): void {
        sessionStorage.removeItem('seizoen');
        super.ngOnInit();
        this.header.subtitle = 'Hoofdmenu';
        this.dao.getSeizoenen()
        .then(result => {
            console.log(result);
            this.seizoenen = result.map(x => Number(x));
            if (this.seizoenen.length) {
                this.seizoenen.sort(this.compareSeizoenen);
                this.selSeizoen = this.seizoenen[0];
                this.createSelectForm();
            }
            this.newSeizoen = this.getNieuwSeizoen();
            this.createNieuwForm();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private gotoSeizoen(seizoen: string) {
        this.header.seizoen = seizoen;
        sessionStorage.setItem('seizoen', this.header.seizoen);
        this.gotoPage('seizoen', 'main');
    }

    private compareSeizoenen(a: number, b: number): number {
        return b - a;
    }

    private getNieuwSeizoen(): number {
        if (this.seizoenen.length) {
            this.minSeizoen = this.seizoenen[0] + 1;
            return this.minSeizoen;
        }
        const dat = new Date();
        this.minSeizoen = dat.getFullYear();
        return this.minSeizoen;
    }

    private createNieuwForm() {
        this.nieuwForm = this.fb.nonNullable.group({
            newSeiz: [this.newSeizoen, [Validators.required, Validators.min(this.minSeizoen), Validators.max(this.maxSeizoen)]]
        });
    }

    private createSelectForm() {
        this.selectForm = this.fb.nonNullable.group({
            selSeiz: [this.selSeizoen]
        });
    }

    get newSeiz() {
        return this.nieuwForm?.get('newSeiz');
    }
    get selSeiz() {
        return this.selectForm?.get('selSeiz');
    }

}
