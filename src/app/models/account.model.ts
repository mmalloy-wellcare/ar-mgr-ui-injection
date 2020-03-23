import { Dependent } from './dependent.model';
import { Address} from './address.model';

export interface Account {
    AccountID: string;
    SubscrbID: string;
    medicareIdFORMTEMP: string;
    ExchngSubID: string;
    ssnID: string;
    FirstName: string;
    LastName: string;
    Dob: string;
    Addresses: Array<Address>;
    addressFORMTEMP?: any;
    dependent?: Array<Dependent>;
}
