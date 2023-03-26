import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faMicrophone,
  faCircleStop,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/services/api.service';

declare var MediaRecorder: any;

@Component({
  selector: 'app-new-visualization',
  templateUrl: './new-visualization.component.html',
  styleUrls: ['./new-visualization.component.scss'],
})
export class NewVisualizationComponent implements OnInit {
  newVisForm: FormGroup;

  isAuth!: boolean;

  mediaRecorder!: MediaRecorder;
  isRecording: boolean = false;
  chunks: BlobPart[] = [];
  audioSrc: any;

  @ViewChild('fileInput') fileInputVar!: ElementRef;

  constructor(
    private library: FaIconLibrary,
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService,
    private domSanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) {
    library.addIcons(faMicrophone, faCircleStop, faTrash);

    this.newVisForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      audio: ['', [Validators.required]], // TODO: add further validation for audio file
    });
  }

  ngOnInit(): void {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' });
        this.chunks = [];
        this.audioSrc = this.domSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(blob)
        );
        this.newVisForm.patchValue({
          audio: new File([blob], 'Microphone Recording'),
        });
        this.cdRef.detectChanges();
      };

      this.mediaRecorder.ondataavailable = (e) => {
        this.chunks.push(e.data);
      };
    });
  }

  startRecording() {
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  onDelete() {
    this.audioSrc = '';
    this.fileInputVar.nativeElement.value = '';

    this.newVisForm.patchValue({
      audio: null,
    });

    this.cdRef.detectChanges();
  }

  soundFileChanged(event: any) {
    const file = event.target.files[0];

    this.newVisForm.patchValue({
      audio: file,
    });

    this.audioSrc = this.domSanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(file)
    );
  }

  onSubmit() {
    this.api
      .newVisualization(
        this.newVisForm.value.title,
        this.newVisForm.value.audio
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/visualizations']);
        },
        error: (err) => {
          console.log(`File error: ${err}`);
        },
      });
  }
}
