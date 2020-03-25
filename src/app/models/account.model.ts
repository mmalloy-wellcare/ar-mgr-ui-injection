import { Dependent } from './dependent.model';
import { Address} from './address.model';

export interface Account {
    AccountID: string;
    SubscrbID: string;
    MedicareId: string;
    ExChgSubID: string;
    SSN: string;
    FirstName: string;
    LastName: string;
    Dob: string;
    Addresses?: Array<Address>;
    AddrLine1?: string;
    City?: string;
    State?: string;
    Zip?: string;
    Members?: Array<Dependent>;
}
