import { Routes } from '@angular/router';
import { Home } from './home/home';
import { InitSpelers } from './init-spelers/init-spelers';
import { Spelers } from './spelers/spelers';
import { MainMenu } from './main-menu/main-menu';
import { Seizoen } from './seizoen/seizoen';
import { Koppels } from './seizoen/koppels/koppels';
import { KoppelsToevoegen } from './seizoen/koppels/koppels-toevoegen/koppels-toevoegen';
import { KoppelPreferences } from './seizoen/koppels/koppel-preferences/koppel-preferences';
import { Settings } from './seizoen/settings/settings';
import { Rondes } from './seizoen/rondes/rondes';
import { PouleRondePlanning } from './seizoen/rondes/poule-ronde-planning/poule-ronde-planning';
import { Probeer } from './probeer/probeer';
import { PouleRondePlanningData } from './seizoen/rondes/poule-ronde-planning/poule-ronde-planning-data/poule-ronde-planning-data';
import { PouleRondeMatch } from './seizoen/rondes/poule-ronde-match/poule-ronde-match';
import { PouleRondeWedstrijd } from './seizoen/rondes/poule-ronde-wedstrijd/poule-ronde-wedstrijd';
import { PouleRondePoules } from './seizoen/rondes/poule-ronde-spelen/poule-ronde-poules/poule-ronde-poules';
import { PouleRondePouleschema } from './seizoen/rondes/poule-ronde-spelen/poule-ronde-pouleschema/poule-ronde-pouleschema';
import { PouleRondeScore } from './seizoen/rondes/poule-ronde-score/poule-ronde-score';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: 'main', component: MainMenu },
    { path: 'seizoen', component: Seizoen },
    { path: 'settings', component: Settings },
    { path: 'koppels/toevoegen', component: KoppelsToevoegen },
    { path: 'koppels/:koppelId', component: KoppelPreferences },
    { path: 'koppels', component: Koppels },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId/:wedIdx/score', component: PouleRondeScore },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId/:wedIdx', component: PouleRondeWedstrijd },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId', component: PouleRondeMatch },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx', component: PouleRondePouleschema },
    { path: 'rondes/poule/:rondeId/spel', component: PouleRondePoules },
    { path: 'rondes/poule/:rondeId/data', component: PouleRondePlanningData },
    { path: 'rondes/poule/:rondeId', component: PouleRondePlanning },
    { path: 'rondes', component: Rondes },
    { path: 'init', component: InitSpelers },
    { path: 'spelers', component: Spelers },
    { path: 'probeer', component: Probeer },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
