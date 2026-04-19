import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-wide-info',
    imports: [
        DecimalPipe
    ],
    templateUrl: './scorebord-wide-info.html',
    styleUrl: './scorebord-wide-info.css',
})
export class ScorebordWideInfo {
    @Input() naam: string = '';
    @Input() moyenne: number = 0;
    @Input() position: string = 'left';

}
