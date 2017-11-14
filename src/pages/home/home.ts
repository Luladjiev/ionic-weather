import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Platform } from 'ionic-angular';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  degreeStr: string = ' degrees (C)';
  currentLoc: any = {};
  c_items: Array<any> = [];
  searchInput: string = '';

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public platform: Platform,
    public weather: WeatherProvider,
    public geolocation: Geolocation,
    public keyboard: Keyboard
  ) {

  }

  ionViewDidLoad () {
    this.platform.ready().then(() => {
      document.addEventListener('resume', () => {
        this.getLocalWeather();
      });

      this.getLocalWeather();
    });
  }

  refreshpage () {
    this.showCurrent();
  }

  getLocalWeather () {
    let locOptions = {
      maximumAge: 3000,
      timeout: 5000,
      enableHighAccuracy: true
    };

    this.geolocation.getCurrentPosition(locOptions).then((pos) => {
      this.currentLoc = { 'lat': pos.coords.latitude, 'long': pos.coords.longitude };
      this.showCurrent();
    });
  }

  showCurrent () {
    this.c_items = [];
    let loader = this.loadingCtrl.create({
      content: "Retrieving current conditions..."
    });
    loader.present();
    this.weather.getCurrent(this.currentLoc).then((data) => {
      loader.dismiss();
      if (data) {
        this.c_items = this.formatWeatherData(data);
      } else {
        console.error('Error retrieving weather data: Data object is empty');
      }
    }, (error) => {
      loader.dismiss();
      console.error('Error retrieving weather data');
      console.dir(error);
      this.showAlert(error);
    });
  }

  private formatWeatherData (data): any {
    let tmpArray = [];

    if (data.name) {
      tmpArray.push({ 'name': 'Location', 'value': data.name });
    }

    tmpArray.push({ 'name': 'Temperature', 'value': data.main.temp + this.degreeStr });
    tmpArray.push({ 'name': 'Low', 'value': data.main.temp_min + this.degreeStr });
    tmpArray.push({ 'name': 'High', 'value': data.main.temp_max + this.degreeStr });
    tmpArray.push({ 'name': 'Humidity', 'value': `${data.main.humidity}%` });
    tmpArray.push({ 'name': 'Pressure', 'value': `${data.main.pressure} hPa` });
    tmpArray.push({ 'name': 'Wind', 'value': `${data.wind.speed} mph` });

    if (data.visibility) {
      tmpArray.push({ 'name': 'Visibility', 'value': `${data.visibility} meters` });
    }

    if (data.sys.sunrise) {
      var sunriseDate = new Date(data.sys.sunrise * 1000);
      tmpArray.push({ 'name': 'Sunrise', 'value': sunriseDate.toLocaleTimeString() });
    }

    if (data.sys.sunset) {
      var sunsetDate = new Date(data.sys.sunset * 1000);
      tmpArray.push({ 'name': 'Sunset', 'value': sunsetDate.toLocaleTimeString() });
    }

    if (data.coord) {
      tmpArray.push({ 'name': 'Latitude', 'value': data.coord.lat });
      tmpArray.push({ 'name': 'Longitude', 'value': data.coord.lon });
    }

    return tmpArray;
  }

  showAlert (message: string) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Source: Weather Service',
      message: message,
      buttons: [{text: 'Sorry'}]
    });
    alert.present();
  }

  searchCity () {
    this.keyboard.close();
    this.currentLoc = { 'city': this.searchInput };
    this.searchInput = '';
    this.showCurrent();
  }
}
