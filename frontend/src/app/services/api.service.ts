import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../classes/user';
import { Visualization } from '../classes/visualization';
import { Metadata } from '../classes/metadata';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  url = environment.backendUrl;

  private auth = new BehaviorSubject(false);
  authStatus = this.auth.asObservable();

  constructor(private http: HttpClient) {}

  updateAuthStatus(status: boolean) {
    this.auth.next(status);
  }

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

  newVisualization(
    title: string,
    audio: File,
    metadata: Metadata
  ): Observable<Visualization> {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('audio', audio, audio.name);
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post<Visualization>(
      `${this.url}/api/visualizations`,
      formData
    );
  }

  getVisualizations(
    page: number,
    limit: number
  ): Observable<{ count: number; rows: Visualization[] }> {
    return this.http.get<{ count: number; rows: Visualization[] }>(
      `${this.url}/api/visualizations?page=${page}&limit=${limit}`
    );
  }

  deleteVisualization(visualizationId: string): Observable<Visualization> {
    return this.http.delete<Visualization>(
      `${this.url}/api/visualizations/${visualizationId}`
    );
  }

  editVisualization(
    visualizationId: string,
    newTitle: string,
    newMetadata: Object
  ): Observable<Visualization> {
    return this.http.patch<Visualization>(
      `${this.url}/api/visualizations/${visualizationId}`,
      { title: newTitle, metadata: JSON.stringify(newMetadata) }
    );
  }

  getVisualization(visualizationId: string): Observable<Visualization> {
    return this.http.get<Visualization>(
      `${this.url}/api/visualizations/${visualizationId}`
    );
  }
}
