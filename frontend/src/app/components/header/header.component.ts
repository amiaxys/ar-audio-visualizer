import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  modalRef?: BsModalRef;

  error: string = '';
  isAuth!: boolean;

  constructor(
    private modalService: BsModalService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });
  }

  signOut(template: TemplateRef<any>) {
    this.api.signOut().subscribe({
      next: () => {
        this.isAuth = false;
        this.modalRef = this.modalService.show(template);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }
}
