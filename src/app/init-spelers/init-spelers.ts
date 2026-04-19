import { Component, inject, OnInit } from '@angular/core';
import { Dao } from '../services/dao';
import { Speler } from '../model/speler';
import { Alerts } from '../services/alerts';
import { Headers } from '../services/headers';
import { Base } from '../base/base';
import { Helper } from '../services/helper';

@Component({
    selector: 'app-init-spelers',
    imports: [],
    templateUrl: './init-spelers.html',
    styleUrl: './init-spelers.css',
})
export class InitSpelers extends Base implements OnInit {
    helper = inject(Helper);
    spelersAsTxt: string[] = [];
    spelers: Speler[] = [];
    existingIds: string[] = [];

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Initieel inlezen spelers';
        this.dao.getInitSpelers()
        .then(data => {
            this.spelersAsTxt = data.split('\r\n');
            this.spelersAsTxt.forEach(spl => {
                this.addSpeler(spl);
            });
            console.log(this.spelers);
            this.dao.saveInitSpelers(this.spelers)
            .then(resp => {
                this.alert.showSuccess('Spelers succesvol opgeslagen.');
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    addSpeler(spl: string) {
        let splToAdd = new Speler();
        const parts = spl.split(' ');
        // moyenne
        let part = parts[parts.length - 1];
        part = part.replace(',', '.');
        splToAdd.moyenne = Number(part);
        parts.pop();
        // anaam en extra
        part = parts[parts.length - 1];
        if (part.startsWith('(')) {
            splToAdd.extra = part;
            parts.pop();
            part = parts[parts.length - 1];
        }
        splToAdd.anaam = part;
        parts.pop();
        // vnaam en snaam
        part = parts[0];
        part = part.replace('-', ' ');
        splToAdd.vnaam = part;
        splToAdd.snaam = part;
        parts.shift();
        part = '';
        if (parts.length == 2) {
            splToAdd.tvoeg = parts[0].toLowerCase() + ' ' + parts[1].toLowerCase();
        }
        else if (parts.length == 1) {
            if (parts[0] == 'v') {
                splToAdd.tvoeg = 'van';
            }
            else {
                splToAdd.tvoeg = parts[0].toLowerCase();
            }
        }
        splToAdd.id = this.helper.createSpelerId(splToAdd, this.existingIds);
        this.existingIds.push(splToAdd.id);
        this.spelers.push(splToAdd);
    }

}
