import { Liability } from './liability.model';

export interface Transaction {
    SubscrbID: string;
    BillPerDt: string;
    CreatedDt: string;
    CvrgPerStartDt: string;
    CvrgPerEndDt: string;
    Liabilities?: Array<Liability>;
    flattenedLiabilities?: any;
}
