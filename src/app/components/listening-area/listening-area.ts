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

@Component({
  	standalone: true,
	selector: 'app-listening-area',
	imports: [CommonModule],
  	template: `
		
		<div class="container">

			<!-- Waveform + Timeline -->
			<div #waveformContainer class="waveform" [class.loaded]="audioLoaded"></div>
			<div #timelineContainer id="timeline" [class.loaded]="audioLoaded"></div>

			<!-- Pulsanti principali -->
			<div class="controls" *ngIf="audioLoaded">
				<button (click)="togglePanel()">Plugins</button>
			</div>

			<!-- Pannello aggiuntivo (slide in/out) -->
			<div class="slide-panels" [class.open]="showPanel && audioLoaded">
				<button (click)="enableEnvelope()" [class.active]="envelopeActive">Envelope</button>
				
				<div class="zoom-wrapper" *ngIf="!trackpadZoomEnabled">
					<button (click)="enableZoom()" [class.active]="zoomActive">
						Zoom
					</button>

					<div *ngIf="zoomActive" class="zoom-slider">
						<input
						id="zoom-slider"
						type="range"
						min="1"
						max="200"
						step="1"
						[value]="zoomLevel"
						(input)="onZoomSliderInput($event)"
						/>
					</div>
				</div>
				
				<button (click)="enableRegions()" [class.active]="regionsActive">Regions</button><br>
				<button (click)="enableHover()" [class.active]="hoverActive">Pointer</button>
				<div class="spectrogram-wrapper">
					<button (click)="showSpectrogram()" [class.active]="spectrogramVisible">
						Spectrogram
					</button>
					<div #spectrogramContainer class="spectrogram"></div>
					<div *ngIf="spectrogramLoading" class="water-loader">
						<div class="water"></div>
					</div>
				</div>
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
							mediaControls: true,
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
							// this.showSpectrogram();
						});

						// this.wavesurfer.on('finish', () => {
						// 	this.playing = false
						// });

						this.wavesurfer.load(audioUrl);
					
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


	ngOnChanges(changes: SimpleChanges): void {
		if(changes['audioFileName'] && !changes['audioFileName'].isFirstChange()) {
			if(this.fullUrl) {
				this.wavesurfer.load(this.fullUrl);
			}
		}
	}


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

	enableZoom(event?: Event): void {
		if (!this.zoom) {
			this.zoom = this.wavesurfer.registerPlugin(
				ZoomPlugin.create({
					scale: 0.5,
					maxZoom: 1000,
				})
			);
			this.wavesurfer.on('zoom', (minPxPerSec) =>
				console.log('Zoom level:', minPxPerSec)
			);
		}

		this.zoomActive = !this.zoomActive;

		const level = this.zoomActive ? this.zoomLevel : 1;
		this.wavesurfer.zoom(level);
	}

	onZoomSliderInput(event: Event): void {
		const pxPerSec = parseInt((event.target as HTMLInputElement).value, 10);
		this.zoomLevel = pxPerSec;
		if (this.zoomActive) {
			this.wavesurfer.zoom(pxPerSec);
		}
	}

	enableRegions():void {
		if (this.regionsPlugin) {
			this.regionsActive = !this.regionsActive;
			this.regionsPlugin.getRegions().forEach( region => {
				(region.element as HTMLElement).style.display = this.regionsActive ? 'block' : 'none';
			});
			return;
		}
		const cfg: any = {
			dragSelection: { slop: 5 },
			dragToSeek: false 
		};

		this.regionsPlugin = this.wavesurfer.registerPlugin(
			RegionsPlugin.create(cfg)
		);

		this.regionsActive = true;
		this.nextRegionHue = 180;
		
		this.wavesurfer.on('click', (time: number) => {
			if (!this.regionsActive) return;

			const duration = this.wavesurfer.getDuration();
    		const regionDuration = 5;
			const start = Math.max(0, time - regionDuration / 2);
			const end = Math.min(duration, time + regionDuration / 2);

			const color = this.getNextColor();

			this.regionsPlugin!.addRegion({ start, end, color });
		});

		this.regionsPlugin.on('region-created', (region: any) => {
			region.update({ color: `hsla(${this.nextRegionHue}, 100%, 50%, 0.3)` });
			region.element?.classList.add('custom-region');
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

	togglePanel() {
		this.showPanel = !this.showPanel;
	}

	ngOnDestroy(): void {
		this.wavesurfer?.destroy();
	}

  
}
