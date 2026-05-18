import { Component, inject, OnInit } from '@angular/core';
import { Dao } from '../services/dao';
import { Headers } from '../services/headers';
import { Alerts } from '../services/alerts';
import { Router } from '@angular/router';

@Component({
    selector: 'app-base',
    imports: [],
    templateUrl: './base.html',
    styleUrl: './base.css',
})
export class Base implements OnInit {
    dao = inject(Dao);
    router = inject(Router);
    header = inject(Headers);
    alert = inject(Alerts);
    dialogVisible: boolean = false;
    dialogTitle: string = '';

    escapePressed() {
        this.gotoPrevPage();
    }

    gotoHome() {
        this.router.navigate(['home']);
    }

    addPageToHistory(url: string) {
        this.header.urlHistory.push(url);
        sessionStorage.setItem('urls', JSON.stringify(this.header.urlHistory));
    }

    gotoPage(url: string, prevUrl: string) {
        this.header.urlHistory.push(prevUrl);
        sessionStorage.setItem('urls', JSON.stringify(this.header.urlHistory));
        this.router.navigate([url]);
    }

    goBackToPage(urlTo: string) {
        const idx = this.header.urlHistory.findIndex(url => url == urlTo);
        if (idx < 0) {
            return;
        }
        this.header.urlHistory.slice(idx);
        this.router.navigate([urlTo]);
    }

    gotoPrevPage() {
        const url = this.header.urlHistory.pop();
        if (!url) {
            this.alert.showError('Teruggaan niet mogelijk. De URL historie is leeg.');
            return;
        }
        sessionStorage.setItem('urls', JSON.stringify(this.header.urlHistory));
        this.router.navigate([url]);
    }

    ngOnInit(): void {
        const urls = sessionStorage.getItem('urls');
        if (!urls) {
            this.router.navigate(['home']);
            return;
        }
        this.header.urlHistory = JSON.parse(urls);
        const seiz = sessionStorage.getItem('seizoen');
        this.header.seizoen = seiz ? seiz : '';
    }
}
