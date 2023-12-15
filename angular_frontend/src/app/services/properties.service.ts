import { Injectable } from '@angular/core';
import { DbConnectionService } from './db-connection.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  public properties: Properties;

  constructor (private db: DbConnectionService) {
    this.fetchProperties();
  }

  fetchProperties(){
    this.db.getProperties().then((r: Properties) => {
      this.properties = r;
    });
  }

}

export interface Properties {
  "Conversation System": string[],
  "Frequency": string[],
  "Time Unit": string[],
  "Listing Kind": string[],
  "Listing Type": string[],
  "Price Calculation": string[],
  "Price Discovery": string[],
  "Quantity": string[],
  "Revenue Source": string[],
  "revenue Stream": string[],
  "Review By": string[],
  "Review Of": string[],
  "UserType": string[],
}


