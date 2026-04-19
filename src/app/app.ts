import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeader } from './shared/page-header/page-header';
import { PageAlert } from './shared/page-alert/page-alert';

@Component({
    selector: 'app-root',
    imports: [
        PageHeader,
        PageAlert,
        RouterOutlet
    ],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected readonly title = signal('roothans');
}
