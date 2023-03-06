import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(private api: ApiService, private router: Router) {}

  error: string = '';
  isAuth: boolean = false;

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });
  }

  signOut() {
    this.api.signOut().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }
}
