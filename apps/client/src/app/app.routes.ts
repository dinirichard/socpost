import { Route } from "@angular/router";
import { AuthComponent } from "./core/auth/auth.component";
import { SchedulerComponent } from "./features/scheduler/scheduler.component";

export const appRoutes: Route[] = [
    {
        path: "",
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
    },
];
