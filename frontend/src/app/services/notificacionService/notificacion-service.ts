import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, interval, startWith, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificacionResponseModel } from '../../models/notificacionModels/notificacionResponseModel';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {

  private readonly NOTIFICACION_URL = `${environment.apiUrl}/notificaciones`;

    // Contador como observer para que puedan subscribirse
  private notificacionesSinLeer = new BehaviorSubject<number>(0);
  cantNotifSinLeer$ = this.notificacionesSinLeer.asObservable();


  constructor(
    private http: HttpClient
  ) {
    //Se implementa aca para que ni bien se construya ya se ejecute el metodo
    this.iniciarPolling();
  }

  //Cada n segundos consulta las notificaciones
  private iniciarPolling(): void {
    //se repite cada 30 segundos
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getNotificacionesRecibidas(false)) 
      )
      .subscribe({
        next: notifs => this.notificacionesSinLeer.next(notifs.length),
        error: err => {
          console.error('Error obteniendo notificaciones', err);
          this.notificacionesSinLeer.next(0);
        }
      });
  }

  refrescarManual() {

    this.getNotificacionesRecibidas(false).subscribe({
      next: notifs => this.notificacionesSinLeer.next(notifs.length),
      error: err => console.error(err)
    });

  }

  getNotificacionesRecibidas(isLeido?: boolean) {

    let params = new HttpParams();    
    if (isLeido !== undefined) {
      params = params.set('isLeido', isLeido);
    }
    return this.http.get<NotificacionResponseModel[]>(`${this.NOTIFICACION_URL}/recibidas`, {params});
  }

  // ======= PATCH: marcar UNA como leída =======
  marcarNotificacionLeida(idNotificacion: string) {
    return this.http.patch(`${this.NOTIFICACION_URL}/leer/${idNotificacion}`,{}
    ).pipe(
      tap(() => this.refrescarManual()) //actualiza las notificaciones
    );
  }

  // ======= PATCH: marcar TODAS como leídas =======
  marcarTodasLeidas() {
    return this.http.patch(`${this.NOTIFICACION_URL}/leer-todas`,{}
    ).pipe(
      tap(() => this.refrescarManual()) //actualiza las notificaciones
    );
  }
}
