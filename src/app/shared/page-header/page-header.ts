import { Component, OnInit } from '@angular/core';
import { Base } from '../../base/base';

@Component({
    selector: 'app-page-header',
    imports: [],
    templateUrl: './page-header.html',
    styleUrl: './page-header.css',
})
export class PageHeader extends Base implements OnInit {

    homeClicked() {
        this.gotoHome();
    }

    seizoenClicked() {
        if (this.router.url == 'seizoen') {
            return;
        }
        this.goBackToPage('seizoen');
    }

    prevPageClicked() {
        this.gotoPrevPage();
    }

    override ngOnInit(): void {
        
    }
}
