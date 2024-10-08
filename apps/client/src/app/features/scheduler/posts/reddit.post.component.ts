import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    imports: [CommonModule],
    template: `<p>reddit.post works!</p>`,
    styleUrl: "./reddit.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedditPostComponent {}
