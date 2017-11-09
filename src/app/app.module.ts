import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';
import { VisualizerComponent, CountyDataService } from './visualizer/visualizer.component';


@NgModule({
  declarations: [
    AppComponent,
    VisualizerComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [CountyDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
