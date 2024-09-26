import { Directive, EventEmitter, HostBinding, HostListener, NgModule, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Directive({
    selector: "[appDragDrop]",
})
export class DragDropDirective {

    @HostBinding('class.fileover') fileover!: boolean;
    @Output() fileDropped = new EventEmitter<any>();
    
    // Dragover listener
    @HostListener('dragover' ,['$event']) onDragOver(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation()
        this.fileover = true;
        console. log('Drag Over') ;
    }

    // Drag leave listener
    @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
    
        console. log('Drag Leave') ;
    }

    // Drop Listener
    @HostListener('drop', ['$event']) public ondrop(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this.fileover = false;
        const files = evt.dataTransfer?.files;
        if ( files && files.length > 0) {
            // Do Some stuff
            console.log(`You here dropped ${files.length} files.`);
            
            this.fileDropped.emit(files);
        }
    }

}

@NgModule({
    imports: [CommonModule],
    declarations: [DragDropDirective],
    exports: [DragDropDirective],
})
export class DragDropDirectiveModule {}
