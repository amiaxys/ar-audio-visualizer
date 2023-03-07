import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../classes/user';
import { Visualization } from '../classes/visualization';

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

  newVisualization(userId: string, title: string, audio: File): Observable<Visualization> {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('audio', audio, audio.name);
    formData.append('metadata', JSON.stringify({ attribute: "123" }));

    return this.http.post<Visualization>(`${this.url}/api/users/${userId}/visualizations`, formData);
  }
}
