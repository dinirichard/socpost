import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    imports: [CommonModule],
    template: `<p>x.post works!</p>`,
    styleUrl: "./x.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XPostComponent {}
