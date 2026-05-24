import { Routes } from '@angular/router';
import { Home } from './home/home';
import { InitSpelers } from './init-spelers/init-spelers';
import { Spelers } from './spelers/spelers';
import { MainMenu } from './main-menu/main-menu';
import { Koppels } from './seizoen/koppels/koppels';
import { KoppelsToevoegen } from './seizoen/koppels/koppels-toevoegen/koppels-toevoegen';
import { KoppelPreferences } from './seizoen/koppels/koppel-preferences/koppel-preferences';
import { Settings } from './seizoen/settings/settings';
import { Rondes } from './seizoen/rondes/rondes';
import { Probeer } from './probeer/probeer';
import { PouleRondeMatch } from './seizoen/rondes/poule-ronde-match/poule-ronde-match';
import { PouleRondeWedstrijd } from './seizoen/rondes/poule-ronde-wedstrijd/poule-ronde-wedstrijd';
import { PouleRondeScore } from './seizoen/rondes/poule-ronde-score/poule-ronde-score';
import { SeizoenMenu } from './seizoen/seizoen-menu/seizoen-menu';
import { AfvalRondePlanning } from './seizoen/rondes/afval/afval-ronde-planning/afval-ronde-planning';
import { AfvalRondePlanner } from './seizoen/rondes/afval/afval-ronde-planner/afval-ronde-planner';
import { PoulesAanmaken } from './seizoen/rondes/poule/planning/poules-aanmaken/poules-aanmaken';
import { PoulesSpeeldata } from './seizoen/rondes/poule/planning/poules-speeldata/poules-speeldata';
import { PoulesOverview } from './seizoen/rondes/poule/spelen/poules-overview/poules-overview';
import { PouleOverview } from './seizoen/rondes/poule/spelen/poule-overview/poule-overview';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: 'main', component: MainMenu },
    { path: 'seizoen', component: SeizoenMenu },
    { path: 'settings', component: Settings },
    { path: 'koppels/toevoegen', component: KoppelsToevoegen },
    { path: 'koppels/:koppelId', component: KoppelPreferences },
    { path: 'koppels', component: Koppels },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId/:wedIdx/score', component: PouleRondeScore },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId/:wedIdx', component: PouleRondeWedstrijd },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx/match/:splKopId/:tegKopId', component: PouleRondeMatch },
    { path: 'rondes/poule/:rondeId/spel/:pouleIdx', component: PouleOverview },
    { path: 'rondes/poule/:rondeId/spel', component: PoulesOverview },
    { path: 'rondes/poule/:rondeId/data', component: PoulesSpeeldata },
    { path: 'rondes/poule/:rondeId/planner', component: PoulesAanmaken },
    { path: 'rondes/afval/:rondeId/plan', component: AfvalRondePlanning },
    { path: 'rondes/afval/:rondeId/planner', component: AfvalRondePlanner },
    { path: 'rondes', component: Rondes },
    { path: 'init', component: InitSpelers },
    { path: 'spelers', component: Spelers },
    { path: 'probeer', component: Probeer },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
