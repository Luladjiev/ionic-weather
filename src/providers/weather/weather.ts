import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WeatherProvider {
  private weatherEndpoint = 'http://api.openweathermap.org/data/2.5/';
  private weagherKey = '1a105f51cb55745fb36b88017feca1f8';

  constructor(public http: Http) {
    console.log('Hello WeatherProvider Provider');
  }

  private makeDataURL (loc: any, command: string): string {
    let uri = this.weatherEndpoint + command;

    if (loc.long) {
      uri += `?lat=${loc.lat}&lon=${loc.long}`;
    } else {
      uri += `?q=${loc.city}`;
    }

    uri += '&units=metric';
    uri += `&APPID=${this.weagherKey}`;

    return uri;
  }

  private extractData (res: Response) {
    let body = res.json();
    return body || {};
  }

  private handleError (res: Response | any) {
    console.log('Entering handleError');
    console.dir(res);
    return Promise.reject(res.message || res);
  }

  getCurrent(loc: any): Promise<any> {
    let url: string = this.makeDataURL(loc, 'weather');
    return this.http.get(url)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }
}
