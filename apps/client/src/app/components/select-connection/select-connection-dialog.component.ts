import { Component, ChangeDetectionStrategy, inject, OnInit } from "@angular/core";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Provider } from "../../models/provider.dto";
import { ProvidersStore } from "../../core/signal-states/providers.state";

export interface DialogConnectionData {
    selectedProvider: Provider;
    title: string;
}

@Component({
    selector: 'app-select-connection-dialog',
    standalone: true,
    imports: [MatDialogModule],
    providers: [ProvidersStore],
    templateUrl: './select-connection-dialog.component.html',
    styleUrl: './select-connection-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectConnectionDialogComponent 
// implements OnInit 
{
    readonly dialogRef = inject(MatDialogRef<SelectConnectionDialogComponent>);
    readonly data = inject<DialogConnectionData>(MAT_DIALOG_DATA);
    readonly store = inject(ProvidersStore);

    // ngOnInit(): void {
    //     this.store.readFromStorage();
    // }

    onSelectSocial(provider: Provider): void {
        this.data.selectedProvider = provider;
        this.store.selectProvider(provider);
        // this.store.writeToStorage();
        this.dialogRef.close(this.data);
    }
}
