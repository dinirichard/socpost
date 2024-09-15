import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    imports: [CommonModule],
    template: `<p>instagram.post works!</p>`,
    styleUrl: "./instagram.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstagramPostComponent {}
