import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module'; // Import routes without '.ts' extension
import { ApiModule } from './api/api.module';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(ApiModule.forRoot({ rootUrl: environment.apiUrl })),
    importProvidersFrom(HttpClientModule), // Import HttpClientModule
    provideRouter(routes) // Pass the routes to provideRouter
  ]
};
