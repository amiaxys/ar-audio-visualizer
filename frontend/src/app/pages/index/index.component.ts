import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  constructor(private api: ApiService) {}

  isAuth: boolean = false;

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth() {
    this.api.me().subscribe((res) => {
      this.isAuth = res ? true : false;
    });
  }
}
