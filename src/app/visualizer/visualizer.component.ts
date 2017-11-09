import { Component, OnInit, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import * as _ from "lodash"

import { CompensationRecord } from '../../models/compensation-record'

@Injectable()
export class CountyDataService {
    private _url= '../../assets/UintahCounty.json';

    constructor(private _http: Http) {}

    getCountyData () {
        return this._http.get(this._url)
            .map((response: Response) => response.json());
    }
}

@Component({
    selector: 'app-visualizer',
    templateUrl: './visualizer.component.html',
    styleUrls: ['./visualizer.component.css'],
})

export class VisualizerComponent implements OnInit {
    //somethings is going on up here and the _this shows the right stuff but this doesn't
    countyData = []
    cleanedCountyData = []
    title = 'Wage Data Visualizer';
    filters = {
        employeeType: {
            full: true,
            part: true
        },
        county: {
            uintah: true,
            utah: true
        }
    }
    filteredDataSet = []

    constructor(private _countyDataService: CountyDataService) {}

    ngOnInit() {
        this._countyDataService.getCountyData().subscribe((response) => {
            this.countyData = response.data;
            this.cleanUpDataSet();
        });
    }

    private cleanUpDataSet() {
        for(let dataRow of this.countyData) {
            let matchingIndex = -1;

            if (this.cleanedCountyData.length > 0) {
                matchingIndex = _.findIndex(this.cleanedCountyData, (object) => {return object.employee == dataRow["PAYEE NAME"];})
            }

            if (matchingIndex < 0) {
                let newRecord = this.createNewRecord(dataRow);
                this.cleanedCountyData.push(newRecord);
            }
            else {
                this.addToExistingRecord(matchingIndex, dataRow)
            }
        }

        this.filteredDataSet = _.cloneDeep(this.cleanedCountyData)
    }

    private createNewRecord(dataRow) {
        let newRecord: CompensationRecord = new CompensationRecord(
            dataRow["PERSON ID"],
            dataRow["ENTITY NAME"],
            dataRow["PAYEE NAME"],
            dataRow["GENDER"],
            //need to convert payRate to number.  Also could be null in the case of bonuses, so should make sure to account for that in the add to existing just in case you hit a bonus first
            //What else could be null in the case of bonus/benefits?
            dataRow["RATE"],
            dataRow["TITLE"],
            dataRow["DESC"],
            dataRow["AMOUNT"]
        );

        return newRecord
    }

    private addToExistingRecord(matchingIndex, dataRow) {
        let matchingRecord = this.cleanedCountyData[matchingIndex]

        if (dataRow["DESC"] == "Regular Wages") {
            matchingRecord.salary += dataRow["AMOUNT"];
        }

        if (dataRow["DESC"] == "Bonus") {
            matchingRecord.bonus += dataRow["AMOUNT"];
        }

        if (dataRow["DESC"] == "Employer Paid Benefits") {
            matchingRecord.benefits += dataRow["AMOUNT"];
        }

        matchingRecord.totalCompensation += dataRow["AMOUNT"];

        if (dataRow["RATE"] && !matchingRecord.payRate) {
            matchingRecord.payRate = dataRow["RATE"];
        }

        matchingRecord.hoursWorked = matchingRecord.salary / matchingRecord.payRate;

        if (matchingRecord.hoursWorked > 1560) {
            matchingRecord.employeeType = "full";
        }
    }

    private updateDataset() {
        this.filteredDataSet = [];
        let matchingRecords = [];
        let employeeFilteredRecords = [];
        let countyFilteredRecords = []

        _.forEach(this.filters, (filterParams, filterField) => {
            matchingRecords = []

            _.forEach(filterParams, (filterOn, filterValue) => {
                if (filterOn) {
                    matchingRecords = _.filter(this.cleanedCountyData, function(record) { return record[filterField] == filterValue})
                }

                if (filterField == 'employeeType') {
                    employeeFilteredRecords = employeeFilteredRecords.concat(matchingRecords);
                    employeeFilteredRecords = _.uniq(employeeFilteredRecords)
                }

                if (filterField == 'county') {
                    countyFilteredRecords = countyFilteredRecords.concat(matchingRecords);
                    countyFilteredRecords = _.uniq(countyFilteredRecords)
                }
            });
        })

        this.filteredDataSet = _.intersection(employeeFilteredRecords, countyFilteredRecords);

    }

    updateFilters(event, filterName) {
        this.filters[filterName][event.target.defaultValue] = event.target.checked;
        this.updateDataset();
    }

}
