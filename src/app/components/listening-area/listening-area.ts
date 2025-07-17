import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.js';

import { WorkService } from '../../services/work-service';
import { AudioService } from '../../services/audio-service';
import { FormsModule } from '@angular/forms';
import { WorkModel } from '../../models/work-model';
import { WorkDto } from '../../models/dto/work-dto';

@Component({
  	standalone: true,
	selector: 'app-listening-area',
	imports: [CommonModule, FormsModule],
  	template: `
		
		<div class="container">
			<div class="scroll-container">
                    <h1 class="title-text">
                        YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ 
                        YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ YOU NEED NO SAINTZ
                    </h1>
                </div>
			
			<!-- Waveform + Timeline -->
			<div #waveformContainer class="waveform" [class.loaded]="audioLoaded"></div>
			<div #timelineContainer id="timeline" [class.loaded]="audioLoaded"></div>

			<!-- Pulsanti principali -->
			<div class="controls" *ngIf="audioLoaded">
				<button class="btn-play" (click)="togglePlay()">
					<i [class.ls-icon-play]="!playing" [class.ls-icon-pause]="playing"></i>
				</button>
				<span class="time-display">
					{{ formatTime(currentTime) }} / {{ formatTime(duration) }}
				</span>
				<!-- Volume -->
				<button class="btn-volume" (click)="toggleMute()">
					<i [class.ls-icon-volume]="volume > 0" [class.ls-icon-mute]="volume === 0"></i>
				</button>
				<input
					class="volume-slider"
					type="range"
					min="0" max="1" step="0.01"
					[value]="volume"
					(input)="onVolumeChange($event)"
				/>
				<div class="wave-progress">
					<div
					class="wave-progress-inner"
					[style.width.%]="progressPercent"
					></div>
				</div>

				<button (click)="togglePanel()">Plugins</button>
				<div *ngIf="zoomActive" class="zoom-slider-wrapper">
					<input
						id="zoom-slider"
						type="range"
						min="1"
						max="1000"
						step="1"
						[value]="zoomLevel"
						(input)="onZoomSliderInput($event)"
					/>
				</div>
			</div>

			<!-- Pannello aggiuntivo (slide in/out) -->
			<div class="slide-panels" [class.open]="showPanel && audioLoaded">
				<button (click)="enableZoom($event)" [class.active]="zoomActive">Zoom</button>
				<button (click)="enableEnvelope()" [class.active]="envelopeActive">Envelope</button>
				<button (click)="enableRegions()" [class.active]="regionsActive">Regions</button>
				<button (click)="enableHover()" [class.active]="hoverActive">Pointer</button>
				<button (click)="showSpectrogram()" [class.active]="spectrogramVisible">Spectrogram</button>

				<!-- <div class="spectrogram-wrapper">
					<div #spectrogramContainer class="spectrogram"></div>
				</div> -->
			</div>
			<div class="regions-notes-list">
				<ul>
					<li *ngFor="let r of regionsList" (click)="selectRegion(r)" [style.background]="r.color" class="region-item">
						<strong>{{ r.start | number:'1.1-2' }} - {{ r.end | number:'1.1-2' }}</strong>
						<textarea
							name="nota{{r.id}}"
							[(ngModel)]="r.nota"
							(blur)="saveNoteFull(r)"
							placeholder="Note ({{ r.start | number:'1.0-2' }} - {{ r.end | number:'1.0-2' }})">
						</textarea>
					</li>
				</ul>
			</div>
		</div>
	`,
  	styleUrls: ['./listening-area.css']
})
export class ListeningArea implements OnDestroy, OnChanges, AfterViewInit{
	@ViewChild('waveformContainer', { static: true }) waveformRef!: ElementRef;
	@ViewChild('spectrogramContainer', { static: true }) spectrogramRef!: ElementRef;
	@ViewChild('timelineContainer', { static: true }) timelineRef!: ElementRef;

	private wavesurfer!: WaveSurfer;

	audioFileName?: string;
	private envelope?: ReturnType<typeof EnvelopePlugin.create>;
	private zoom?: ReturnType<typeof ZoomPlugin.create>;
	// public regions?: ReturnType<typeof RegionsPlugin.create>;
	private timeline?: ReturnType<typeof TimelinePlugin.create>;
	private hover?: ReturnType<typeof HoverPlugin.create>;
	private regionsPlugin?: ReturnType<typeof RegionsPlugin.create>;

	constructor(
		private route: ActivatedRoute,
		private workService: WorkService,
		private audioService: AudioService,
		
	) {}

	private isMobile = top!.matchMedia('(max-width: 900px)').matches;
	private spectrogramPlugin?: ReturnType<typeof SpectrogramPlugin.create>;
	private nextRegionHue = 180;
	private zoomListenerSet = false;
	

	//dichiarazioni per wavesurfer
	playing = false;
	panelOpen = false;
	audioLoaded = false;
	showPanel = false;
	envelopeActive = false;
	zoomActive     = false;
	regionsActive  = false;
	hoverActive    = false;
	// spectrogramActive = false;
	loading = true;
  	waveformReady = false;
  	loadError = false;
	spectrogramVisible = false;
	spectrogramLoading = false;
	zoomLevel: number = 1;
	maxZoom: number = 200;
	minZoom: number = 1;
	trackpadZoomEnabled: boolean = false;
	currentTime = 0;
	duration = 0;
	progressPercent = 0;
	volume = 1;
	private prevVolume = 1;
	regionsList: Array<{ id: string; start: number; end: number; color: string; nota: string; elementX: number }> = [];
	selectedRegionId: string | null = null;
	work: WorkDto | undefined;

	//METODI LISTENING AREA

	public get fullUrl():string | null  {
		return this.audioFileName
		? `http://localhost:8080/api/audios/${this.audioFileName}`
		: null;
	}


	public get audioType(): string {
		if (!this.audioFileName) return 'audio/mpeg';
		const ext = this.audioFileName.split('.').pop()?.toLowerCase();
		return ext === 'wav' ? 'audio/wav' : 'audio/mpeg';
	}

	private setupTrackpadZoom(): void {
		const container = this.waveformRef.nativeElement as HTMLElement;
		container.addEventListener('wheel', (event) => {
			if(event.ctrlKey || event.metaKey) {
				event.preventDefault();
				this.trackpadZoomEnabled = true;

				const delta = Math.sign(event.deltaY);
				this.zoomLevel = Math.max(
					this.minZoom,
					Math.min(this.maxZoom, this.zoomLevel - delta * 5)
				);
				this.wavesurfer.zoom(this.zoomLevel);
			}
		});
	}

	private getNextColor(): string {
		const color = `hsla(${this.nextRegionHue}, 100%, 50%, 0.3)`;
		this.nextRegionHue += 15;
		if (this.nextRegionHue > 330) this.nextRegionHue = 180;
		return color;
	}
	

	ngAfterViewInit(): void {
		const workId = Number(this.route.snapshot.paramMap.get('id'));
		
		this.workService.findWorkById(workId).subscribe({
			next: work => {
				if (!work.audio?.storedFileName) {
      				console.error('Nessun audio associato a questo work:', work);
					return;
    			} 
				const fullName = work.audio.storedFileName;

				this.audioFileName = fullName.includes('/') 
					? fullName.split('/').pop()! 
					: fullName;

				this.audioService.getByFileName(this.audioFileName).subscribe({
					next: blob => {
						if (!this.waveformRef?.nativeElement) {
							console.error('waveformRef non disponibile');
							return;
						}
						const audioUrl = URL.createObjectURL(blob);

						this.wavesurfer = WaveSurfer.create({
							container: this.waveformRef.nativeElement,
							waveColor: '#00ffff',
							progressColor: '#ffffff',
							cursorColor: '#333',
							backend: 'MediaElement',
							mediaControls: false,
							dragToSeek: true,
							minPxPerSec: 100,
							height: 100,
							plugins: 
								[TimelinePlugin.create({ container: this.timelineRef.nativeElement })]
						});
						this.setupTrackpadZoom();
						this.spectrogramRef.nativeElement.style.display = 'none';
						
						this.wavesurfer.on('ready', () => {
							this.audioLoaded = true;
							this.duration = this.wavesurfer.getDuration();
							this.currentTime = 0;
							this.wavesurfer.setVolume(this.volume);
						});

						// this.wavesurfer.on('finish', () => {
						// 	this.playing = false
						// });

						this.wavesurfer.load(audioUrl);

						this.wavesurfer.on('interaction', () => {
							const container = this.wavesurfer.getWrapper();
							container.addEventListener('wheel', this.onWheelZoomControl, { passive: false });
						});
						this.wavesurfer.on('audioprocess', (time: number) => {
							this.currentTime = time;
							this.progressPercent = (time / this.duration) * 100;
						});
					},
					error: err => {
						console.error('Errore download audio blob ', err)
						this.loading = false;
    					this.loadError = true;
					}
				});
			},
			error: err => console.error('Errore recupero work', err)
		});
	}

	//PLAY STOP AND TIMELINE WITH SS & MM + VOLUME
	formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		const mm = m.toString().padStart(2, '0');
		const ss = s.toString().padStart(2, '0');
		return `${mm}:${ss}`;
	}

	togglePlay() {
		if (this.playing) {
			this.wavesurfer.pause();
		} else {
			this.wavesurfer.play();
		}
		this.playing = !this.playing;
	}

	onVolumeChange(event: Event): void {
		this.volume = parseFloat((event.target as HTMLInputElement).value);
		this.prevVolume = this.volume;
		this.wavesurfer.setVolume(this.volume);
	}

	toggleMute(): void {
		if (this.volume > 0) {
			this.prevVolume = this.volume;
    		this.volume = 0;
		} else {
			this.volume = this.prevVolume || 1;
		}
		this.wavesurfer.setVolume(this.volume);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes['audioFileName'] && !changes['audioFileName'].isFirstChange()) {
			if(this.fullUrl) {
				this.wavesurfer.load(this.fullUrl);
			}
		}
	}

	onWheelZoomControl = (event: WheelEvent) => {
		if (!this.zoomActive) {
			
			event.preventDefault();
			event.stopPropagation();
		}
	};

	togglePanel() {
		this.showPanel = !this.showPanel;
	}

	//SPECTROGRAMMA
	showSpectrogram():void {
		if (!this.wavesurfer) {
			console.error('wavesurfer non inizializzato');
			return;
		}
		if (!this.spectrogramPlugin) {
			this.spectrogramPlugin = this.wavesurfer.registerPlugin(
				SpectrogramPlugin.create({
					container: this.spectrogramRef.nativeElement, 
					labels: true,
					height: 200,
					splitChannels: false,
					scale: 'mel', // or 'linear', 'logarithmic', 'bark', 'erb'
					frequencyMax: 8000,
					frequencyMin: 10,
					fftSamples: 512,
					labelsBackground: 'rgba(0, 0, 0, 0.1)',
				})
			);
    	}
		this.spectrogramVisible = !this.spectrogramVisible;
		this.spectrogramRef.nativeElement.style.display = this.spectrogramVisible
			? 'block'
			: 'none';
	}

	//ENVELOPE
  	enableEnvelope() {
		if (!this.envelope) {
			this.envelope = this.wavesurfer.registerPlugin(
				EnvelopePlugin.create({
					volume: 0.8,
					lineColor: 'rgba(4, 9, 56, 0.42)',
					lineWidth: '4',
					dragPointSize: this.isMobile ? 20 : 8,
					dragLine: !this.isMobile,
					dragPointFill: 'rgba(255, 255, 255, 0.8)',
					dragPointStroke: 'rgba(0, 0, 0, 0.5)',
					points: [
						{ time: 11.2, volume: 0.5 },
						{ time: 15.5, volume: 0.8 },
					],
				})
			);
			this.envelope.on('points-change', (points) =>
				console.log('Envelope changed', points)
			);
		}
		this.envelopeActive = !this.envelopeActive;
	}

	//ZOOM
	enableZoom(event?: Event): void {
		if (!this.zoom) {
			this.zoom = this.wavesurfer.registerPlugin(
				ZoomPlugin.create({
					scale: 0.5,
					maxZoom: 1000
				})
			);
			if(!this.zoomListenerSet) {
				this.wavesurfer.on('zoom', (minPxPerSec) => {
					this.zoomLevel = minPxPerSec
				});
				this.zoomListenerSet = true;
			}
			
		}

		this.zoomActive = !this.zoomActive;

		const level = this.zoomActive ? this.zoomLevel : 1;
		this.wavesurfer.zoom(level);
		this.updateRegionPositions();
	}

	onZoomSliderInput(event: Event): void {
		const pxPerSec = parseInt((event.target as HTMLInputElement).value, 10);
		this.zoomLevel = pxPerSec;
		if (this.zoomActive) {
			this.wavesurfer.zoom(pxPerSec);
		}
	}


	//REGIONS + NOTE
	enableRegions(): void {
		if (this.regionsPlugin) {
			this.regionsActive = !this.regionsActive;
			this.regionsPlugin.getRegions().forEach(region =>
				(region.element as HTMLElement).style.display = this.regionsActive ? 'block' : 'none'
			);
			return;
		}
		const cfg: any = { dragSelection: { slop: 5 }, dragToSeek: false };
		this.regionsPlugin = this.wavesurfer.registerPlugin(RegionsPlugin.create(cfg));
		this.regionsActive = true;
		this.nextRegionHue = 180;

		this.wavesurfer.on('click', () => {
			if (!this.regionsActive) return;
			const time = this.wavesurfer.getCurrentTime();
			const existing = this.regionsPlugin?.getRegions().find((r: any) => time >= r.start && time <= r.end);
			if (existing) {
				this.selectedRegionId = existing.id;
				return;
			}
			
			//se non esiste la regione ne crea una nuova
			const regionDuration = 5;
			const start = Math.max(0, time - regionDuration / 2);
			const end = Math.min(this.duration, time + regionDuration / 2);
			const color = this.getNextColor();
			const region = this.regionsPlugin!.addRegion({ start, end, color });
  			this.selectedRegionId = region.id;
		});

		this.regionsPlugin.on('region-created', region => {
			this.onRegionCreate(region);
			region.element!.addEventListener('click', (ev: MouseEvent) => {
				if (ev.altKey) {
					if (confirm('Vuoi cancellare questa region?')) {
						region.remove(); 
					}
				}
			});

			this.regionsPlugin!.on('region-removed', (region) => {
				this.onRegionRemove(region);
			});
		});
		console.log(this.regionsList);
		this.regionsPlugin.on('region-updated', region => this.onRegionUpdate(region));
	}

	//create - update - delete
	private onRegionCreate(region: any): void {
		const container = this.wavesurfer.getWrapper(); 
		const totalWidth = container.clientWidth;
		const startPercent = region.start / this.duration;
		const elementX = startPercent * totalWidth;

		const regionData = {
			id: region.id,
			start: region.start,
			end: region.end,
			color: region.color,
			elementX: elementX,
			nota: ''
		};

		this.regionsList.push(regionData);
		this.persistNotes();
	}

	private onRegionUpdate(region: any): void {
		const r = this.regionsList.find(r => r.id === region.id);
		if (r) {
			r.start = region.start;
			r.end = region.end;

			const container = this.wavesurfer.getWrapper();
			const totalWidth = container.clientWidth;
			const startPercent = region.start / this.duration;
			r.elementX = startPercent * totalWidth;
			this.persistNotes();
		}
  	}

	private onRegionRemove(region: any): void {
		this.regionsList = this.regionsList.filter(r => r.id !== region.id);
		if (this.selectedRegionId === region.id) {
			this.selectedRegionId = null;
		}
		this.persistNotes();
	}

	selectRegion(r: any) {
		this.selectedRegionId = r.id;
		setTimeout(() => {
			const el = document.querySelector(`textarea[name="nota${r.id}"]`) as HTMLTextAreaElement;
			if (el) {
				el.focus();
				el.select(); 
			}
		}, 0);
  	}

	saveNoteFast(region: any): void {
		if(!this.work) return;
		this.work.nota = region.nota;
		this.workService.updateWork(this.work.workId, { nota: region.nota }).subscribe({
			next: res => console.log('Nota salvata con update rapido', res),
			error: err => console.error(err),
		});
	}

	saveNoteFull(region: any): void {
		if(!this.work) return;
		const dto: WorkDto = {
			workId: this.work.workId,
			title: this.work.title,
			bpm: this.work.bpm,
			key: this.work.key,
			
			nota: region.nota,
		};
		this.workService.updateWorkFull(this.work.workId, dto).subscribe({
			next: res => console.log('Nota salvata con update completo', res),
			error: err => console.error(err),
		});
	}

	private persistNotes(): void {
		
		const workId = Number(this.route.snapshot.paramMap.get('id'));
		const work = this.workService.findWorkById(workId);

		if(!work) return;

		const payload = JSON.stringify(this.regionsList);

		if (!this.work) return;

		const dto: WorkDto = {
			workId: this.work.workId,
			title: this.work.title,
			bpm: this.work.bpm,
			key: this.work.key,
			nota: payload
		};
		this.workService.updateWork(workId, { nota: payload }).subscribe();
	}

	updateRegionPositions(): void {
		const totalWidth = this.wavesurfer.getWrapper().clientWidth;
		this.regionsList.forEach(r => {
			r.elementX = (r.start / this.duration) * totalWidth;
		});
	}

	enableTimeline() {
		if (!this.timeline) {
		this.timeline = this.wavesurfer.registerPlugin(
			TimelinePlugin.create({ container: '#timeline' })
		);
		}
	}

	enableHover() {
		if (!this.hover) {
			this.hover = this.wavesurfer.registerPlugin(
				HoverPlugin.create({
				lineColor: '#ff0000',
				lineWidth: 1,
				labelBackground: '#555',
				labelColor: '#fff',
				labelSize: '15px',
				labelPreferLeft: false,
				})
			);
		}
		this.hoverActive = !this.hoverActive;
		// rimuoviamo o aggiungiamo il canvas pointer
		const hoverEl = this.waveformRef.nativeElement.querySelector('.wavesurfer-hover-pointer');
		if (hoverEl) hoverEl.style.display = this.hoverActive ? 'block' : 'none';
	}
	
	
	ngOnDestroy(): void {
		const container = this.wavesurfer?.getWrapper?.();
		if (container) {
			container.removeEventListener('wheel', this.onWheelZoomControl);
		}
		this.wavesurfer?.destroy();
	}

  
}
