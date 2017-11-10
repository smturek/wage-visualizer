import * as _ from "lodash"

export class CompensationRecord {
    id: number;
    county: string;
    employee: string;
    employeeGender: string;
    employeeType: string;
    payRate: number;
    title: string;
    totalCompensation: number;
    salary: number;
    bonus: number;
    benefits: number;
    hoursWorked: number;
    selected: boolean;

    constructor(id: number, county: string, employee: string, employeeGender: string, payRate: string, title: string, type: string, amount: number){
        this.totalCompensation = 0;
        this.salary = 0;
        this.bonus = 0;
        this.benefits = 0;
        this.selected = false;

        this.id = id;
        this.employee = employee;
        this.employeeGender = employeeGender;
        this.employeeType = "half"
        this.payRate = payRate ? parseFloat(payRate) : null;
        this.title = title;

        //set up county name
        let countyArray = county.split(' ');
        countyArray.pop();
        this.county = _.toLower(countyArray.join(''));

        //figure out what amount refers to and store in the proper place
        if (type == "Regular Wages") {
            this.salary = amount;
        }

        if (type == "Bonus") {
            this.bonus = amount;
        }

        if (type == "Employer Paid Benefits") {
            this.benefits = amount;
        }

        this.totalCompensation = amount;

        //calculate hourly rate
        this.hoursWorked = this.salary / this.payRate;

        //set up employee type
        if (this.hoursWorked > 1560) {
            this.employeeType = "full";
        }
        else if (this.hoursWorked < 1040) {
            this.employeeType = "part"
        }
    }
}