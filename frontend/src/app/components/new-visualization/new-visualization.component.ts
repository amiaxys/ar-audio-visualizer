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
  
  constructor(private fb: FormBuilder, private router: Router, private api: ApiService) {
    this.newVisForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      soundFile: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {}
  
  soundFileChanged(event: any) {
    const file = event.target.files[0];

    this.newVisForm.patchValue({
      soundFile: file
    })
  }

  onSubmit() {
    const formData = new FormData();

    formData.append('title', this.newVisForm.value.title);
    formData.append('description', this.newVisForm.value.title);
    formData.append('soundFile', this.newVisForm.value.soundFile);

    // TODO: submit file
  }
}
