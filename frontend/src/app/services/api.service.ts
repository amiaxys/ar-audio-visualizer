import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../classes/user';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  url = environment.backendUrl;

  constructor(private http: HttpClient) {}

  signIn(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.url}/api/users/signin`, {
      username,
      password,
    });
  }

  signUp(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.url}/api/users/signup`, {
      username,
      password,
    });
  }

  signOut(): Observable<User> {
    return this.http.post<User>(`${this.url}/api/users/signout`, {});
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.url}/api/users/me`);
  }

  newVisualization(userId: string, title: string, audio: File) {
    return this.http.post(`${this.url}/api/users/${userId}/visualizations`, {title, audio});
  }
}
