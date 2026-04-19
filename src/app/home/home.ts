import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Base } from '../base/base';
import { Btn } from '../model/misc';
import { Button } from '../shared/button/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicateNumbers, validJaar } from '../directives/validators';

@Component({
    selector: 'app-home',
    imports: [
        ReactiveFormsModule,
        Button
    ],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home extends Base implements OnInit {
    fb = inject(FormBuilder);
    counter: number = 8;
    intervalHandle: number = -1;
    countdownStopped: boolean = false;

    btnProcede: Btn = new Btn('go', 'Naar hoofdmenu');
    btnStop: Btn = new Btn('stop', 'Stop countdown');

    buttonProcedeClicked() {
        this.gotoMainMenu();
    }

    buttonStopClicked() {
        clearInterval(this.intervalHandle);
        this.countdownStopped = true;
    }

    gotoMainMenu() {
        clearInterval(this.intervalHandle);
        this.gotoPage('main', 'home');
    }

    countdown() {
        this.intervalHandle = setInterval(() => {
            this.counter--;
            if (this.counter == 0) {
                this.gotoMainMenu();
            }
        }, 1000);
    }

    override ngOnInit(): void {
        this.header.subtitle = 'home';
        this.header.urlHistory = [];
        sessionStorage.setItem('urls', JSON.stringify(this.header.urlHistory));
        this.header.seizoen = '';
        sessionStorage.removeItem('seizoen');
        this.countdown();
    }

}
