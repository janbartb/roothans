import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { DecimalPipe, registerLocaleData } from '@angular/common';
import { Speech } from './services/speech';
import localeNl from '@angular/common/locales/nl';
import { provideHttpClient, withFetch } from '@angular/common/http';
registerLocaleData(localeNl);

export const appConfig: ApplicationConfig = {
    providers: [
        DecimalPipe,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withFetch()),
        { provide: LOCALE_ID, useValue: "nl-NL" },
        provideAppInitializer(() => {
            const spraak = inject(Speech);
            spraak.initialize('Google Nederlands');
        })
    ]
};
