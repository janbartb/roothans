import { Component, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Seizoen } from '../../model/seizoen';

@Component({
    selector: 'app-afsluiten-seizoen',
    imports: [],
    templateUrl: './afsluiten-seizoen.html',
    styleUrl: './afsluiten-seizoen.css',
})
export class AfsluitenSeizoen extends Base implements OnInit {
    seizoen: Seizoen = new Seizoen();

    override ngOnInit(): void {
        
    }

}
