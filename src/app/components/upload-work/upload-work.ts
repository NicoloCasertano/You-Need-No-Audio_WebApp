import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authorization-service';
import { WorkService } from '../../services/work-service';

@Component({
	standalone: true,
	selector: 'app-upload-work',
	templateUrl: './upload-work.html',
	styleUrls: ['./upload-work.css'],
	imports: [FormsModule, CommonModule]
})
export class UploadWork implements OnInit{
	
	private _router = inject(Router);
	private _authService = inject(AuthService);
	private _workService = inject(WorkService);

	work: {
		title?: string,
		artName?: string,
		bpm?: number,
		key?: string,
  	} = {};  
	file?: File;
	keys = ['A', 'A#', 'B','C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
	userId = this._authService.getUserId();
	isAdmin = false;
	currentArtName = '';

	constructor(private http: HttpClient) {}
	ngOnInit(): void {
		throw new Error('Method not implemented.');
	}

	onDragOver(event: DragEvent) {
		event.preventDefault();
	}

	onDragLeave(event: DragEvent) {
  		event.preventDefault();
	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		if(event.dataTransfer?.files.length) {
			this.file = event.dataTransfer.files[0];
		}
	}

	ngOnIiti() {
		const payload = this._authService.decodePayload();
		this.isAdmin = payload?.['roles']?.includes('ROLE_ADMIN') || false;;

		if (!this.isAdmin) {
			this.currentArtName = payload?.['artName'] || '';
		}
	}
	onFileSelected(ev: Event) {
		const input = ev.target as HTMLInputElement;
		this.file = input.files?.[0];
	}

	submitWork() {
		if(!this.file || !this.work.title || !this.work.bpm || !this.work.key) return;

		const targetArtName = this.isAdmin ? this.work.artName?.trim() : this.currentArtName;
		// const targetArtName = this.work.artName?.trim() ? this.currentArtName : this.currentArtName;
		if (!targetArtName) {
			console.error('Unvalid Art Name');
			return;
		}

		const form = new FormData();
		form.append('file', this.file);
		form.append('title', this.work.title!);
		form.append('artName', targetArtName);
		form.append('bpm', this.work.bpm!.toString());
		form.append('key', this.work.key!);
		form.append('dataDiCreazione', new Date().toISOString().slice(0, 10));

		this._workService.uploadWork(form).subscribe({
			next: w => this._router.navigate(['/listening-area', w.workId]),
			error: err => console.error('Upload fallito:', err)
		});
	}

	goToUserPage() {
		this._router.navigate(['/user', this.userId]);
	}
	goToHome() {
		this._router.navigate(['/home']);
	}
}
