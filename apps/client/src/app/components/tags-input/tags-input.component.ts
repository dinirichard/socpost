import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, EventEmitter, Input, model, OnInit, Output, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent
  } from '@angular/material/autocomplete';
  import {OverlayModule} from '@angular/cdk/overlay';
  import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Tag } from "@prisma/client";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "ui-tags-input",
    standalone: true,
    imports: [ 
        CommonModule, FormsModule,
        MatAutocompleteModule, MatFormFieldModule,
        MatInputModule, MatChipsModule,
        MatIconModule, MatButtonModule, OverlayModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./tags-input.component.html",
    styleUrl: "./tags-input.component.scss",
})
export class TagsInputComponent  implements OnInit {
    @Input() tags!: Tag[];
    @Input() tagsAvailable!: Tag[];
  
    @Output() tagsChanged = new EventEmitter<Tag[]>();
  
    @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    isFocused = false;

    onFocus(){
      this.isFocused = !this.isFocused;
    }
  
    readonly tagsSignal = signal([{ id: '', name: '' }]);
    readonly currentTag = model('');
    readonly filteredTags = computed(() => {
      const currentTag = this.currentTag().toLowerCase();
      const aTags = this.tagsAvailable ?? [{ id: '', name: '' }];
      const bTags = this.tagsSignal() ?? [{ id: '', name: '' }];
      const cTags = aTags.filter((value) => !bTags.includes(value));
  
      return currentTag
        ? cTags.filter((tag) => tag.name.toLowerCase().includes(currentTag))
        : cTags;
    });
  
    public constructor() {
      effect(() => {
        if (this.tagsSignal()) {
          this.tagsChanged.emit(this.tagsSignal());
          // console.log('tagsSignal', this.tagsSignal());
        }
      });
      effect(() => {
        if (this.tagsSignal()) {
            // console.log('filteredTags', this.filteredTags());
        }
      });
    }
  
    ngOnInit() {
      this.tagsSignal.set(this.tags);
      // console.log(this.tagsAvailable);
      this.currentTag.subscribe(value => {
        // console.log(value);
      });
      
    }
  
    public onAddTag(event: MatAutocompleteSelectedEvent) {
      const tagId = event.option.value;
      // console.log('MatAutocompleteSelectedEvent', tagId);
      const newTag = this.tagsAvailable.find(({ id }) => id === tagId);
  
      if (this.tagsSignal()?.some((el) => el.id === tagId)) {
        this.currentTag.set('');
        event.option.deselect();
        return;
      }
  
      (this.tagsSignal() && newTag)
        ? this.tagsSignal.update((tags) => [...tags, newTag])
        : this.tagsSignal.update(() => newTag ? [ newTag ] : [] );
      this.currentTag.set('');
      event.option.deselect();
    }

    public onAddTagInput() {
        // const tagId = event.value;
        // console.log('MatAutocompleteSelectedEvent', tagId);
        // const newTag = this.tagsAvailable.find(({ name }) => name === tagId);
    
        // if (this.tagsSignal()?.some((el) => el.id === tagId)) {
        //   this.currentTag.set('');
        // //   event.option.deselect();
        //   return;
        // }
    
        (this.tagsSignal() )
          ? this.tagsSignal.update((tags) => [...tags, {id: '', name: this.currentTag().trim()}])
          : this.tagsSignal.update(() =>  [ {id: '', name: this.currentTag()} ] );
        this.currentTag.set('');
        // event.option.deselect();
      }
  
    public onRemoveTag(aTag: Tag) {
      this.tagsSignal.update((tagsSignal) => {
        const index = tagsSignal.indexOf(aTag);
        if (index < 0) {
          return tagsSignal;
        }
  
        tagsSignal.splice(index, 1);
        return [...tagsSignal];
      });
    }
  }
