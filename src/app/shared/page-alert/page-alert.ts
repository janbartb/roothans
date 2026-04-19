import { Component, inject } from '@angular/core';
import { Alerts } from '../../services/alerts';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-page-alert',
    imports: [
        NgClass
    ],
    templateUrl: './page-alert.html',
    styleUrl: './page-alert.css',
})
export class PageAlert {
    alertService = inject(Alerts);
}
