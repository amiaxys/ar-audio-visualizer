import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-new-visualization',
  templateUrl: './new-visualization.component.html',
  styleUrls: ['./new-visualization.component.scss'],
})
export class NewVisualizationComponent implements OnInit {
  newVisForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService
  ) {
    this.newVisForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      // TODO: add further validation for audio file
      audio: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  soundFileChanged(event: any) {
    const file = event.target.files[0];

    this.newVisForm.patchValue({
      audio: file,
    });
  }

  onSubmit() {
    this.api.me().subscribe({
      next: (res) => {
        this.api
          .newVisualization(
            res.id,
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
      },
      error: (err) => {
        console.log(`Auth error: ${err}`);
      },
    });
  }
}
