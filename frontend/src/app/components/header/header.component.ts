import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

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
    private router: Router,
    private library: FaIconLibrary
  ) {
    this.library.addIcons(faMusic);
  }

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    // TODO: fix this
    this.api.authStatus.subscribe((isAuth) => {
      this.api.me().subscribe({
        next: (res) => {
          this.isAuth = true;
        },
        error: () => {
          this.isAuth = isAuth;
        },
      });
    });
  }

  signOut(template: TemplateRef<any>) {
    this.api.signOut().subscribe({
      next: () => {
        this.api.updateAuthStatus(false);
        this.modalRef = this.modalService.show(template);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }
}
