import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { WorkModel } from "../../../models/work-model";
import { Component, ElementRef, Input, ViewChild, AfterViewInit } from "@angular/core";

@Component({
  standalone: true,
  selector: 'app-work-list',
  imports: [CommonModule, RouterModule],
  template:  `
   <div class="work-list-wrapper">
      <div class="scroll-button-div">
        <button class="scroll-button left" (click)="scrollLeft()">‹</button>
      </div>
      
      
      <div class="work-list-container">
        <h2 class="works-title">YOUR WORKS</h2><br>

        <!-- Container scrollabile con riferimento corretto -->
        <div class="work-scroll" #scrollContainer>
          <a
            class="work-card"
            *ngFor="let work of works"
            [routerLink]="['/listening-area', work.workId]"
          >
            <h3 class="works-title">{{ work.title }}</h3><br>
            <p>BPM:<br>{{ work.bpm }}<br><br>Key:<br>{{ work.key }}</p>
          </a>
        </div>
      </div>
      <div class="scroll-button-div"></div>
      <button class="scroll-button right" (click)="scrollRight()">›</button>
    </div>
	`,
	styleUrls: ['./work-list.css']
})
export class WorkList implements AfterViewInit{
  ngAfterViewInit(): void {
   
  }
  @Input() works: WorkModel[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scrollRight() {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  }

  scrollLeft() {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  }
}


