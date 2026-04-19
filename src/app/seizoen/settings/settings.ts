import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Seizoen, SpeelDag } from '../../model/seizoen';
import { Btn } from '../../model/misc';
import { Button } from '../../shared/button/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { DateHelper } from '../../services/date-helper';

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
    alleDagen: SpeelDag[] = [];

    btnSave: Btn = new Btn('save', 'Opslaan');

    settingsForm!: FormGroup;

    opslaanClicked() {
        Object.assign(this.settings, this.settingsForm.value);
        this.settings.speelDagen = this.alleDagen.filter(dg => dg.selected);
        this.dao.saveSeizoenfile(this.header.seizoen, this.settings)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.gotoPrevPage();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    dagClicked(idx: number) {
        this.alleDagen[idx].selected = !this.alleDagen[idx].selected;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Instellingen`;

        this.dao.getSeizoenFile(this.header.seizoen)
        .then(data => {
            this.settings = data;
            this.fillAlleDagen();
            this.createsettingsForm();
            console.log(this.settings);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private fillAlleDagen() {
        const selectedDagNrs = this.settings.speelDagen.map(sd => sd.dagNr);
        [0,1,2,3,4,5,6].forEach(dagNr => {
            this.alleDagen.push(new SpeelDag(dagNr, this.dater.getDagNaam(dagNr), selectedDagNrs.includes(dagNr)));
        });
    }

    private createsettingsForm() {
        this.settingsForm =  this.fb.nonNullable.group({
            maxKoppels: [this.settings.maxKoppels, [Validators.min(2), Validators.max(99)]],
            maxKoppelsPerPoule: [this.settings.maxKoppelsPerPoule, [Validators.min(2)]],
            pntWinst: [this.settings.pntWinst, [Validators.min(1)]],
            pntGelijk: [this.settings.pntGelijk, [Validators.min(0)]],
            pntMoyenne: [this.settings.pntMoyenne, [Validators.min(0)]]
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

}
