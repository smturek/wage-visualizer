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

    constructor(id: number, county: string, employee: string, employeeGender: string, payRate: string, title: string, type: string, amount: number){
        this.totalCompensation = 0;
        this.salary = 0;
        this.bonus = 0;
        this.benefits = 0;

        this.id = id;
        this.county = _.lowerCase(county.split(' ')[0]);
        this.employee = employee;
        this.employeeGender = employeeGender;
        this.employeeType = "part"
        this.payRate = payRate ? parseFloat(payRate) : null;
        this.title = title;

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

        this.hoursWorked = this.salary / this.payRate;

        if (this.hoursWorked > 1560) {
            this.employeeType = "full";
        }
    }
}