export interface Column {
    field: string;
    title: string;
    hidden: boolean;
    default?: boolean;
    children?: Array<Column>;
}
