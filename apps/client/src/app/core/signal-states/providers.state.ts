import { patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { afterRender, inject, Injectable } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Provider } from "../../models/provider.dto";
import { ProvidersService } from '../../services/providers.service';


type ProvidersState = { 
    providers: Provider[];
    orgId: string;
    isLoading: boolean;
    selectedProvider: Provider | undefined;
    calenderArgs: any;
};

const initialState: ProvidersState = {
    providers: [],
    orgId: '',
    isLoading: false,
    selectedProvider: undefined,
    calenderArgs: undefined,
};

// @Injectable()
// readonly #providersService = inject(ProvidersService);
export const ProvidersStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, providersService = inject(ProvidersService)) => ({
        loadProviders: rxMethod<void>(
            pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => patchState(store, { orgId : localStorage.getItem('orgId') ?? '' })),
                tap(() => patchState(store, { isLoading: true })),
                exhaustMap(() => {
                    return providersService.getAllProviders(store.orgId()).pipe(
                        tapResponse({
                            next: (providers) => patchState(store, { providers }),
                            error: console.error,
                            finalize: () => patchState(store, { isLoading: false }),
                        })
                    );
                })
            )
        ),
        reset(): void {
            patchState(store, { 
                providers: [],
                orgId: '',
                isLoading: false,
                selectedProvider: undefined,
                calenderArgs: undefined,
            });
        },
        addProvider(provider: Provider): void {
            patchState(store, (state) => ({ providers: state.providers.concat(provider) }));
        },
        removeProvider(provider: Provider): void {
            patchState(store, (state) => ({ 
                providers: state.providers.filter(val => val.id !== provider.id) 
            }));
        },
        selectProvider(provider: Provider): void {
            patchState(store, { selectedProvider: provider });
        },
        clearSelectedProvider(): void {
            patchState(store, { selectedProvider: undefined });
        },
        addCalendarArgs(calendarArgs: any): void {
            patchState(store, { calenderArgs: calendarArgs });
        },
        clearCalendarArgs(): void {
            patchState(store, { calenderArgs: undefined });
        },
    })),
    withComputed((store) => ({})),
    withHooks({
        onInit({ loadProviders }) {
            loadProviders();
        },
    }),
);
    