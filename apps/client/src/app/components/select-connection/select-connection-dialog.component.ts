import { Component, ChangeDetectionStrategy, inject, model, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
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
export class SelectConnectionDialogComponent {
    readonly dialogRef = inject(MatDialogRef<SelectConnectionDialogComponent>);
    readonly data = inject<DialogConnectionData>(MAT_DIALOG_DATA);
    readonly providerStore = inject(ProvidersStore);
    providers: Provider[] = [];

    // ngOnInit(): void {
    // }

    onSelectSocial(provider: Provider): void {
        this.data.selectedProvider = provider;
        this.providerStore.selectProvider(provider);
        this.dialogRef.close(this.data);
    }
}
