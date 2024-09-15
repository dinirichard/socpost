import { Route } from "@angular/router";
import { AuthComponent } from "./core/auth/auth.component";
import { SchedulerComponent } from "./features/scheduler/scheduler.component";
import { authGuard } from "./shared/auth.guard";

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
            import("./features/scheduler/scheduler.component").then((c) => c.SchedulerComponent),
        canActivate: [authGuard],
    },
];
