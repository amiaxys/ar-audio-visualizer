import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faMicrophone,
  faCircleStop,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { MetatypeService } from 'src/app/services/metatype.service';
import { Metadata } from 'src/app/classes/metadata';
import { Metatype } from 'src/app/classes/metatype';

declare var MediaRecorder: any;

@Component({
  selector: 'app-new-visualization',
  templateUrl: './new-visualization.component.html',
  styleUrls: ['./new-visualization.component.scss'],
})
export class NewVisualizationComponent implements OnInit {
  newVisForm: FormGroup;

  isAuth!: boolean;
  sending: boolean = false;

  mediaRecorder!: MediaRecorder;
  isRecording: boolean = false;
  chunks: BlobPart[] = [];
  audioSrc: any;

  types!: string[];
  metatype!: Metatype;
  metadataUpload: boolean = false;

  @ViewChild('fileInput') fileInputVar!: ElementRef;
  @ViewChild('metadataInput') metadataInputVar!: ElementRef;

  constructor(
    private library: FaIconLibrary,
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService,
    private domSanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private metaApi: MetatypeService
  ) {
    library.addIcons(faMicrophone, faCircleStop, faTrash);

    this.newVisForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      audio: ['', [Validators.required]], // TODO: add further validation for audio file
      type: ['', [Validators.required]],
      timeColor: new FormControl({ value: '', disabled: true }),
      defaultTimeColor: [true],
      timeEntities: this.fb.array([]),
      freqColor: new FormControl({ value: '', disabled: true }),
      defaultFreqColor: [true],
      freqEntities: this.fb.array([]),
      metadataFile: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.api.me().subscribe({
      next: (res) => {
        this.isAuth = res ? true : false;
      },
      error: () => {
        this.isAuth = false;
      },
    });

    this.types = this.metaApi.getTypes();
    this.newVisForm.patchValue({
      type: this.types[0],
    });

    this.updateFormArray(this.types[0]);

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

  get timeEntities() {
    return this.newVisForm.controls['timeEntities'] as FormArray<FormControl>;
  }

  get freqEntities() {
    return this.newVisForm.controls['freqEntities'] as FormArray<FormControl>;
  }

  updateFormArray(type: string) {
    const apiMetatype = this.metaApi.getMetatype(type);
    if (apiMetatype) {
      this.metatype = apiMetatype;
      this.timeEntities.clear();
      for (let i = 0; i < apiMetatype.timeEntityNum; i++) {
        this.timeEntities.push(new FormControl(apiMetatype.entityTypes[0]));
      }
      this.freqEntities.clear();
      for (let i = 0; i < apiMetatype.freqEntityNum; i++) {
        this.freqEntities.push(new FormControl(apiMetatype.entityTypes[0]));
      }
    }
  }

  toggleTimeColor() {
    if (this.newVisForm.value.defaultTimeColor) {
      this.newVisForm.controls['timeColor'].disable();
    } else {
      this.newVisForm.controls['timeColor'].enable();
    }
  }

  toggleFreqColor() {
    if (this.newVisForm.value.defaultFreqColor) {
      this.newVisForm.controls['freqColor'].disable();
    } else {
      this.newVisForm.controls['freqColor'].enable();
    }
  }

  metadataFileChanged(event: any) {
    const file = event.target.files[0];
    file.text().then((res: string) => {
      // to check if the file is valid Metadata
      let metadataFromFile: Metadata = JSON.parse(res);
      this.newVisForm.patchValue({
        metadataFile: metadataFromFile,
      });
    });
  }

  updateForm() {
    if (this.newVisForm.value.type === 'upload') {
      this.metadataUpload = true;
      this.newVisForm.controls['metadataFile'].enable();
      return;
    } else {
      this.metadataUpload = false;
      this.newVisForm.controls['metadataFile'].setValue('');
      this.newVisForm.controls['metadataFile'].disable();
      this.updateFormArray(this.newVisForm.value.type);
    }
  }

  onSubmit() {
    if (this.newVisForm.value.type === 'upload') {
      this.sending = true;
      this.api
        .newVisualization(
          this.newVisForm.value.title,
          this.newVisForm.value.audio,
          this.newVisForm.value.metadataFile
        )
        .subscribe({
          next: () => {
            this.sending = false;
            this.router.navigate(['/visualizations']);
          },
          error: (err) => {
            console.log(`File error: ${err}`);
          },
        });
    } else {
      let metadata: Metadata = {
        type: this.newVisForm.value.type,
        time: {
          color:
            this.newVisForm.controls['timeColor'].status === 'VALID'
              ? this.newVisForm.value.timeColor
              : null,
          entities: this.newVisForm.value.timeEntities,
        },
        freq: {
          color:
            this.newVisForm.controls['freqColor'].status === 'VALID'
              ? this.newVisForm.value.freqColor
              : null,
          entities: this.newVisForm.value.freqEntities,
        },
      };
      this.sending = true;
      this.api
        .newVisualization(
          this.newVisForm.value.title,
          this.newVisForm.value.audio,
          metadata
        )
        .subscribe({
          next: () => {
            this.sending = false;
            this.router.navigate(['/visualizations']);
          },
          error: (err) => {
            console.log(`File error: ${err}`);
          },
        });
    }
  }
}
