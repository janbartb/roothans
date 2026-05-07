import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Seizoen, SpeelDag } from '../../model/seizoen';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { DateHelper } from '../../services/date-helper';
import { Ronde } from '../../model/ronde';

@Component({
    selector: 'app-settings',
    imports: [
        ReactiveFormsModule,
        Button,
        NgClass
    ],
    templateUrl: './settings.html',
    styleUrl: './settings.css',
})
export class Settings extends Base implements OnInit {
    dater = inject(DateHelper);
    fb = inject(FormBuilder);
    settings: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    rondeNaam: string = '';
    alleDagen: SpeelDag[] = [];

    btnSave: Btn = new Btn('save', 'Opslaan', 'enter');

    settingsForm!: FormGroup;
    statusForm!: FormGroup;

    enterPressed() {
        if (this.settingsForm && this.settingsForm.valid &&
                this.statusForm && this.statusForm.valid && this.alleDagen.filter(dg => dg.selected).length > 0) {
            this.buttonPressed(this.btnSave);
        }
    }

    opslaanClicked() {
        Object.assign(this.settings, this.settingsForm.value);
        this.settings.speelDagen = this.alleDagen.filter(dg => dg.selected);
        this.settings.huidigeRonde = this.huidigeRonde?.value;
        this.dao.saveSeizoenfile(this.header.seizoen, this.settings)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    dagClicked(idx: number) {
        this.alleDagen[idx].selected = !this.alleDagen[idx].selected;
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
        if (event.key === 'Home') {
            this.gotoHome();
            return false;
        }
        return true;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Instellingen`;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.settings = results[0];
            this.rondes = results[1];
            this.fillAlleDagen();
            this.createSettingsForm();
            this.createStatusForm();
            this.setRondeNaam(this.settings.huidigeRonde);
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
                if (btn.id == 'save') {
                    this.opslaanClicked();
                }
            }, 250);
        }, 250);
    }

    private fillAlleDagen() {
        const selectedDagNrs = this.settings.speelDagen.map(sd => sd.dagNr);
        [0,1,2,3,4,5,6].forEach(dagNr => {
            this.alleDagen.push(new SpeelDag(dagNr, this.dater.getDagNaam(dagNr), selectedDagNrs.includes(dagNr)));
        });
    }

    private setRondeNaam(idx: number) {
        if (idx == 0) {
            this.rondeNaam = 'Seizoen nog niet gestart';
        }
        else if (idx == (this.rondes.length + 1)) {
            this.rondeNaam = 'Seizoen compleet afgewerkt';
        }
        else {
            this.rondeNaam = this.rondes[idx - 1].rndNaam;
        }
    }

    private createSettingsForm() {
        this.settingsForm =  this.fb.nonNullable.group({
            maxKoppels: [this.settings.maxKoppels, [Validators.min(2), Validators.max(99)]],
            maxKoppelsPerPoule: [this.settings.maxKoppelsPerPoule, [Validators.min(2)]],
            pntWinst: [this.settings.pntWinst, [Validators.min(1)]],
            pntGelijk: [this.settings.pntGelijk, [Validators.min(0)]],
            pntMoyenne: [this.settings.pntMoyenne, [Validators.min(0)]]
        });
        this.settingsForm.get('maxKoppels')?.disable();
        this.settingsForm.get('maxKoppelsPerPoule')?.disable();
    }

    private createStatusForm() {
        this.statusForm =  this.fb.nonNullable.group({
            huidigeRonde: [this.settings.huidigeRonde, [Validators.min(0), Validators.max(this.rondes.length + 1)]]
        });
        this.statusForm.get('huidigeRonde')?.valueChanges.subscribe(val => {
            if (this.statusForm.valid) {
                this.setRondeNaam(val);
            }
        });
    }

    get maxKoppels() {
        return this.settingsForm?.get('maxKoppels');
    }
    get maxKoppelsPerPoule() {
        return this.settingsForm?.get('maxKoppelsPerPoule');
    }
    get pntWinst() {
        return this.settingsForm?.get('pntWinst');
    }
    get pntGelijk() {
        return this.settingsForm?.get('pntGelijk');
    }
    get pntMoyenne() {
        return this.settingsForm?.get('pntMoyenne');
    }
    get huidigeRonde() {
        return this.statusForm?.get('huidigeRonde');
    }

}
