export interface SubColumn {
    Name: string;
    Label: string;
    Mapping: string | Array<string>;
    SubHeader?: Array<SubColumn>;
}
