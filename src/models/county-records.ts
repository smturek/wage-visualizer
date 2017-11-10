export class CountyJobCompositeRecord {
    name: string;
    payRate: number;
    salary: number;
    benefits: number;
    bonus: number;
    totalCompensation: number;
    recordCount: number;

    constructor(name: string) {
        this.name = name;
        this.payRate = 0;
        this.salary = 0;
        this.benefits = 0;
        this.bonus = 0;
        this.totalCompensation = 0;
        this.recordCount = 0;
    }
}