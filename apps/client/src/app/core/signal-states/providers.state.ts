import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, exhaustMap, pipe, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { Provider } from "../../models/provider.dto";
import { ProvidersService } from '../../services/providers.service';
import { withDevtools, withStorageSync, updateState } from '@angular-architects/ngrx-toolkit';
import {DayPilot} from "daypilot-pro-angular";
import EventData = DayPilot.EventData;
import { SchedulerService } from '../../services/scheduler.service';
import { MediaDTO, Post, PostEvent } from '../../models/post.dto';


type ProvidersState = { 
    providers: Provider[];
    orgId: string;
    isLoading: boolean;
    selectedProvider: Provider | undefined;
    calenderArgs: Date | undefined;
    postEvents: EventData[];
    selectedPost: Post | undefined; 
    postMedia: MediaDTO[];
};

const initialState: ProvidersState = {
    providers: [],
    orgId: '',
    isLoading: false,
    selectedProvider: undefined,
    calenderArgs: undefined,
    postEvents: [],
    selectedPost: undefined,
    postMedia: [],
};


export const ProvidersStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withStorageSync({
        key: 'syncedStore', // key used when writing to/reading from storage
        autoSync: true, // read from storage on init and write on state changes - `true` by default
        // select: (state: ProvidersState) => Partial<ProvidersState>, // projection to keep specific slices in sync
        // parse: (stateString: string) => State, // custom parsing from storage - `JSON.parse` by default
        // stringify: (state: ProvidersState) => string, // custom stringification - `JSON.stringify` by default
        storage: () => sessionStorage, // factory to select storage to sync with
    }),
    withDevtools('providerStore'),
    withMethods((store, providersService = inject(ProvidersService), schedulerService = inject(SchedulerService)) => ({
        loadProviders: rxMethod<void>(
            pipe(
                debounceTime(300),
                distinctUntilChanged(),
                // tap(() => store.clearStorage()),
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
                }),
                tap(() => patchState(store, { isLoading: true })),
                exhaustMap(() => {
                    return schedulerService.getPostEvents(store.orgId()).pipe(
                        tapResponse({
                            next: (posts) => {
                                const events = posts.map((post) => {
                                    const newEvent = new PostEvent(post.id, post.publishDate, post.title, post.profileImage, post.provider);
                                    return newEvent.getAsEvent();
                                });
                                patchState(store, { postEvents: events});
                            },
                            error: console.error,
                            finalize: () => patchState(store, { isLoading: false }),
                        })
                    );
                }),
                // tap(() => store.writeToStorage()),
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
        addPostEvent(event: EventData): void {
            updateState(store, 'addPostEvent', (state) => ({ postEvents: state.postEvents.concat(event) }));
        },
        removePostEvent(event: EventData): void {
            updateState(store, 'removePostEvent', (state) => ({ 
                postEvents: state.postEvents.filter(val => val.id !== event.id)
            }));
        },
        selectProvider(provider: Provider): void {
            updateState(store, 'selectProvider', { selectedProvider: provider });
        },
        clearSelectedProvider(): void {
            updateState(store, 'clearSelectedProvider', { selectedProvider: undefined });
        },
        selectPostEvent(post: Post): void {
            updateState(store, 'selectPostEvent', { selectedPost: post });
        },
        clearSelectedPostEvent(): void {
            updateState(store, 'clearSelectedPostEvent', { selectedPost: undefined });
        },
        addMedia(media: MediaDTO[] | MediaDTO): void {
            // console.log('Media BEFORE adding', store.postMedia().toLocaleString());
            updateState(store, 'addMedia', (state) => ({ 
                postMedia: [...new Set([...state.postMedia, ...(Array.isArray(media) ? media : [media])])] 
            }));
            // console.log('Media AFTER adding', store.postMedia().toLocaleString());
        },
        removeMedia(media: MediaDTO): void {
            patchState(store, (state) => ({ 
                postMedia: state.postMedia.filter(val => val.id !== media.id) 
            }));
        },
        clearMedia(): void {
            updateState(store, 'clearMedia', { postMedia: [] });
        },
        addCalendarArgs(start: Date): void {
            updateState(store, 'addCalendarArgs', { calenderArgs: start });
        },
        clearCalendarArgs(): void {
            updateState(store, 'clearCalendarArgs', { calenderArgs: undefined });
        },
    })),
    withComputed((store) => ({})),
    withHooks({
        // onInit({ loadProviders }) {
        //     loadProviders();
        // },
        onDestroy(store) {
            console.log('Destroy State', store.selectedPost());
            // store.clearStorage();
        },
        // onInit(store) {
        //     store.readFromStorage();
        // },
    }),
);
    