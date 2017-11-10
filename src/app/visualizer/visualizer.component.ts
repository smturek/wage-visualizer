import { Component, OnInit, Injectable, Input } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import * as _ from "lodash"

import { CompensationRecord } from '../../models/compensation-record'
import { CountyJobCompositeRecord } from '../../models/county-records'

@Injectable()
export class CountyDataService {
    private _url= '../../assets/AllUtahCounties.json';

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
    @Input() search: string;
    countyData = []
    cleanedCountyData = []
    title = 'Loading...';
    loading = true;

    employeeTypes = {
        full: "30+ hrs/wk",
        half: "20-19 hrs/wk",
        part: "<20 hrs/wk"
    }

    countyNames = {
        beaver: 'Beaver',
        boxelder: 'Box Elder',
        cache: 'Cache',
        carbon: 'Carbon',
        daggett: 'Daggett',
        davis: 'Davis',
        duchesne: 'Duchesne',
        emery: 'Emery',
        garfield: 'Garfield',
        grand: 'Grand',
        iron: 'Iron',
        juab: 'Juab',
        kane: 'Kane',
        millard: 'Millard',
        morgan: 'Morgan',
        piute: 'Piute',
        saltlake: 'Salt Lake',
        sanjuan: 'San Juan',
        sanpete: 'Sanpete',
        sevier: 'Sevier',
        summit: 'Summit',
        tooele: 'Tooele',
        uintah: 'Uintah',
        utah: 'Utah',
        wasatch: 'Wasatch',
        washington: 'Washington',
        wayne: 'Wayne',
        weber: 'Weber'
    }

    //could probably turn this into a model/instance
    filters = {
        employeeType: {
            full: true,
            part: true,
            half: true
        },
        county: {
            beaver: false,
            boxelder: false,
            cache: false,
            carbon: false,
            daggett: false,
            davis: false,
            duchesne: false,
            emery: false,
            garfield: false,
            grand: false,
            iron: false,
            juab: false,
            kane: false,
            millard: false,
            morgan: false,
            piute: false,
            saltlake: false,
            sanjuan: false,
            sanpete: false,
            sevier: false,
            summit: false,
            tooele: false,
            uintah: false,
            utah: false,
            wasatch: false,
            washington: false,
            wayne: false,
            weber: false
        }
    }
    filteredDataSet = []

    //could probably turn this into a model/instance
    modalData = {
        jobTitle: "",
        averages: []
    }

    constructor(private _countyDataService: CountyDataService) {}

    ngOnInit() {
        this._countyDataService.getCountyData().subscribe((response) => {
            this.countyData = response;
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

        this.title = 'Utah Employee Compensation Benchmarker'
        this.loading = false
        console.log("DONE LOADING!!!???")
        // this.filteredDataSet = _.cloneDeep(this.cleanedCountyData)
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

        if (dataRow["RATE"] && matchingRecord.payRate < dataRow["RATE"]) {
            matchingRecord.payRate = dataRow["RATE"];
        }

        matchingRecord.hoursWorked = matchingRecord.salary / matchingRecord.payRate;

        if (matchingRecord.hoursWorked > 1560) {
            matchingRecord.employeeType = "full";
        }
        else if (matchingRecord.hoursWorked < 1040) {
            matchingRecord.employeeType = "part"
        }
        else {
            matchingRecord.employeeType = "half"
        }
    }

    private updateDataset() {
        this.filteredDataSet = [];
        let matchingRecords = [];
        let employeeFilteredRecords = [];
        let countyFilteredRecords = [];

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

    searchRecords(searchString) {
        this.filteredDataSet = [];
        let matchingRecords = [];
        let employeeFilteredRecords = [];
        let countyFilteredRecords = [];

        let searchFilteredDataSet = _.filter(this.cleanedCountyData, function(record) {
            return _.toLower(record.title).includes(_.toLower(searchString))
        })

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

        this.filteredDataSet = _.intersection(searchFilteredDataSet, employeeFilteredRecords, countyFilteredRecords);
    }

    updateFilters(event, filterName) {
        this.filters[filterName][event.target.defaultValue] = event.target.checked;
        this.updateDataset();
    }

    showCustomSummaryModal(useSelected) {
        this.modalData.jobTitle = "Custom Summary"
        this.modalData.averages = [];
        let totals = this.createNewCountyRecord('total');
        let counties = [];
        let countyRecord = null;
        let modalRecords = this.filteredDataSet;
        let matchingIndex = -1;
        let self = this;

        if (useSelected) {
            modalRecords = _.filter(this.filteredDataSet, function(record) { return record.selected});
        }

        _.forEach(modalRecords, function(record) {
            matchingIndex = _.findIndex(counties, function(county) {
                return county.name == record.county;
            })

            if (matchingIndex >= 0) {
                counties[matchingIndex] = self.addRecord(counties[matchingIndex], record);
            }
            else {
                countyRecord = self.createNewCountyRecord(record.county);
                countyRecord = self.addRecord(countyRecord, record);
                counties.push(countyRecord);
            }

            totals = self.addRecord(totals, record);
        })

        this.modalData.averages.push(this.calculateAverages(totals));

        _.forEach(counties, function(county) {
            self.modalData.averages.push(self.calculateAverages(county));
        })
    }

    showDetailModal(jobTitle) {
        this.modalData.jobTitle = jobTitle;
        this.modalData.averages = [];
        let counties = [];
        let totals = this.createNewCountyRecord('total');
        let countyRecord = null;
        let matchingIndex = -1;
        let self = this;

        let modalRecords = _.filter(this.filteredDataSet, function(record) { return record.title == jobTitle});

        _.forEach(modalRecords, function(record) {
            matchingIndex = _.findIndex(counties, function(county) {
                return county.name == record.county;
            })

            if (matchingIndex >= 0) {
                counties[matchingIndex] = self.addRecord(counties[matchingIndex], record);
            }
            else {
                countyRecord = self.createNewCountyRecord(record.county);
                countyRecord = self.addRecord(countyRecord, record);
                counties.push(countyRecord);
            }

            totals = self.addRecord(totals, record);
        })

        this.modalData.averages.push(this.calculateAverages(totals));

        _.forEach(counties, function(county) {
            self.modalData.averages.push(self.calculateAverages(county));
        })

        //median & average switch
    }

    private calculateAverages(totals) {
        let numberOfRecords = totals.recordCount;
        totals.payRate = totals.payRate / numberOfRecords;
        totals.salary = totals.salary / numberOfRecords;
        totals.benefits = totals.benefits / numberOfRecords;
        totals.bonus = totals.bonus / numberOfRecords;
        totals.totalCompensation = totals.totalCompensation / numberOfRecords;

        return totals;
    }

    private addRecord(totalRecord, record) {
        totalRecord.payRate += record.payRate;
        totalRecord.salary += record.salary;
        totalRecord.benefits += record.benefits;
        totalRecord.bonus += record.bonus;
        totalRecord.totalCompensation += record.totalCompensation;
        totalRecord.recordCount++;

        return totalRecord;
    }

    private createNewCountyRecord(county) {
        return new CountyJobCompositeRecord(county);
    }

    toggleRecordSelect(record) {
        record.selected = !record.selected
    }

}
