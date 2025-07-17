import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WorkService } from '../../services/work-service';
import { AuthService } from '../../services/authorization-service';
import { ListeningArea } from "../listening-area/listening-area";
import { WorkModel } from '../../models/work-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadWork } from '../upload-work/upload-work';
import { UserService } from '../../services/user-service';
import { UserModel } from '../../models/user-model';
import { WorkList } from "../home-lists/work-list/work-list";

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, WorkList],
  templateUrl: './user-page.html',
  styleUrls: ['./user-page.css']
})
export class UserPage implements OnInit {
[x: string]: any;

  private _router = inject(ActivatedRoute);
  private _routerPages = inject(Router);
  private _workService = inject(WorkService); 
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  works: WorkModel[] = [];

  ngOnInit() {
    console.log('--- ngOnInit UserPage ---');
    console.log('Router.url:', this._routerPages.url);
    console.log('paramMap snapshot id:', this._router.snapshot.paramMap.get('id'));
    console.log('decodePayload: ', this._authService.decodePayload());

    const token = this._authService.getToken();
    if (!token) {
      setTimeout(() => this.ngOnInit(), 100);
      return;
    }

    const payload = this._authService.decodePayload();
    const userName = payload?.userName
    const artName = payload?.artName;
    console.log("artName: " + artName);

    this._router.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.userId = idParam ? +idParam : 0;
      console.log('User corrente: ', this.userId);

      if (!this.userId) {
        console.error('ID utente non valido');
        return;
      }

      this._workService.findWorkDoneByUser(this.userId).subscribe({
        next: ws => {
          this.works = ws;
          console.log('Works caricati:', this.works);
        },
        error: err => console.error(err)
      });

        
    });
  }

  uploadedWorks = this.works;
  currentWork?: WorkModel | null = null;
  
  userId!: number;
  userModel?: UserModel;
  artName?: string = this._authService.decodePayload()?.artName;

  onSelect(work: WorkModel): void {
    this.currentWork = work;
  }
  goToHome() {
    this._routerPages.navigate(['/home']);
  }
  goToUploadWork() { 
    this._routerPages.navigate(['/upload-work', this.userId]);
  }
  showUserWorks(userId: number) {
    if(!this.userId) return;

    this._workService.findWorkDoneByUser(this.userId).subscribe({
    next: ws => {
      this.works = ws; 
      console.log('Works caricati:', this.works);
    },
    error: err => console.error(err)
    });
    console.log(userId);
  }
  
}
