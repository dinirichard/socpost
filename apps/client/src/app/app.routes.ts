import { Route } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';
import { authGuard } from './shared/auth.guard';

export const appRoutes: Route[] = [
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full",
    },
    {
        path: "login",
        component: AuthComponent,
    },
    {
        path: "signUp",
        component: AuthComponent,
    },
    {
        path: "scheduler",
        loadComponent: () =>
            import("./features/providers/providers.component").then((c) => c.ProvidersComponent),
        canActivate: [authGuard],
    },
];
