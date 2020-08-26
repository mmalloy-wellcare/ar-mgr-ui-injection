import { Injectable } from '@angular/core';
import { Sort, Filter } from '@nextgen/web-care-portal-core-library';
import { DataService } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';
import { Transaction } from '@app/models/transaction.model';

@Injectable()
export class BillingPeriodsService {
  private billingPeriodURI = 'premium-billing/ar-mgr/v1/ar/billing-period';
  private pageSize = 50;

  constructor(private dataService: DataService) { }

  public getBillingPeriods(
    accountId: string,
    restartRowId: string,
    includeVoidedRows: boolean,
    sort: Array<Sort> = [],
    filter: Array<Filter> = []
  ) {
    return this.dataService.getAllRecords({
      url: `${this.billingPeriodURI}/${accountId}`,
      pageSize: this.pageSize,
      restartRowId,
      sort,
      search: '',
      filter
    }).pipe(map((response) => {
      return {
        data: this.flattenBillingPeriods(response.data, includeVoidedRows),
        restartRowId: response.restartRowId
      };
    }));
  }

  public getBillingPeriodsMetadata(lob: string) {
    return this.dataService.getSingleRecord(`${this.billingPeriodURI}/${lob}/meta-data`).pipe(map((response) => {
      return {
        data: this.flattenMapping(response && response[`TopHeader`] ? response[`TopHeader`] : [])
      };
    }));
  }

  public getTransactions(BlngPerSpanSk: number, blngStmtDt: string, billPeriodSpan: string) {
    return this.dataService.getAllRecords({
      url: `${this.billingPeriodURI}/${BlngPerSpanSk}/transactions`,
      pageSize: this.pageSize,
      filter: [{
          operator: 'EQ',
          value: `${BlngPerSpanSk}`,
          property: 'BlngPerSpanSk',
          dataType: 'character'
      }]
    }).pipe(map((response) => {
      return {
        data: this.flattenTransactions(response.data, blngStmtDt, billPeriodSpan)
      };
    }));
  }

  private flattenBillingPeriods(billingPeriods: Array<any>, includeVoidedRows: boolean) {
    const flattenedBillingPeriods = [];

    // loop through billing periods
    for (const billingPeriod of billingPeriods) {
      // if there are billing period spans, create separate records for each span so it's not nested
      // otherwise don't create records since there's no period spans for it
      if (billingPeriod.BlngPerSpans) {
        for (const billingPeriodSpan of billingPeriod.BlngPerSpans) {
          // only flatten period span if span is not voided
          // TODO: update this to toggle showing voided spans in future sprint
          if (!billingPeriodSpan.Voided || includeVoidedRows) {
            const flattenedBillingPeriod = { ...billingPeriod, ...billingPeriodSpan };
            const coverageStart = billingPeriodSpan.CvrgPerStartDt.split('-');
            const coverageEnd = billingPeriodSpan.CvrgPerEndDt.split('-');

            flattenedBillingPeriod[`billPeriodSpan`] =
              `${coverageStart[1]}/${coverageStart[2]}/${coverageStart[0]} - ${coverageEnd[1]}/${coverageEnd[2]}/${coverageEnd[0]}`;
            delete flattenedBillingPeriod.BlngPerSpans;
            flattenedBillingPeriod[`blngStmtDt`] = flattenedBillingPeriod.BillPerDt;
            flattenedBillingPeriod[`TxnType`] = this.getTxnType(flattenedBillingPeriod);
            delete flattenedBillingPeriod.BillPerDt;

            // flatten children data of flattened billing period
            flattenedBillingPeriods.push(this.flattenChildData(flattenedBillingPeriod));
          }
        }
      }
    }

    return flattenedBillingPeriods;
  }

  private flattenChildData(billingPeriod: Array<any>) {
    // loop through keys of flattened billing period until one is an array (child)
    for (const key of Object.keys(billingPeriod)) {
      if (Array.isArray(billingPeriod[key])) {
        // if array found (child), flatten it to billing period
        billingPeriod = this.setFieldAmounts(billingPeriod, key);
      }
    }

    return billingPeriod;
  }

  private setFieldAmounts(billingPeriod: any, category: string) {
    // loop through children data and flatten it
    for (const object of billingPeriod[category]) {
      let mainKey = '';

      // loop through keys in object
      for (const key of Object.keys(object)) {
        if (typeof(object[key]) === 'string') {
          mainKey += `${object[key]}_`;
        } else {
          billingPeriod[`${mainKey}${key}`] = object[key];
        }
      }
    }

    if (!!billingPeriod[category].length && category === 'TxnSmrys') {
      billingPeriod[`transactions`] = true;
    }

    // delete unecessary category once child data has been flattened
    delete billingPeriod[category];

    return billingPeriod;
  }

  private getTxnType(billingPeriod: any) {
    if (billingPeriod.Voided) {
      return 'Voided';
    } else if (billingPeriod.Awkward) {
      return 'Awkward';
    }

    return 'Summary';
  }

  private flattenMapping(metadata: Array<any>, IncludeZeroes?: boolean) {
    const metadataResult = [];

    // loop through parent metadata
    // call flattenMapping function until child is Mapping array
    // when child is Mapping array, flatten it and return data
    for (const data of metadata) {
      if (IncludeZeroes) {
        data.IncludeZeroes = IncludeZeroes;
      }

      if (Array.isArray(data.SubHeader)) {
        data.SubHeader = this.flattenMapping(data.SubHeader, data.IncludeZeroes);
      }

      if (Array.isArray(data.Mapping)) {
        const dataMapping = [];

        for (const dataMap of data.Mapping) {
          let fieldName = '';
          // split field name into type name and value name
          const dataMapFieldNames = dataMap.DataFieldName.split('.');

          for (const filter of dataMap.Filter) {
            fieldName += `${filter.FieldVal}_`;
          }

          // if type and value name exist, add value name to fieldname, otherwise add type name
          fieldName += dataMapFieldNames.length > 1 ? dataMapFieldNames[1] : dataMapFieldNames[0];

          dataMapping.push(fieldName);
        }

        data.Mapping = dataMapping.length === 1 ? dataMapping[0] : dataMapping;
      }

      metadataResult.push(data);
    }

    return metadataResult;
  }

  private flattenTransactions(transactions: Array<Transaction>, blngStmtDt: string, billPeriodSpan: string) {
    for (const transaction of transactions) {
      transaction.blngStmtDt = blngStmtDt;
      transaction.billPeriodSpan = billPeriodSpan;
      transaction.TxnType = this.normalizeTxnType(transaction.TxnType);
      transaction[`${transaction.BilleeTypeCode}_${transaction.Rundown}_Amt`] = transaction.Amt;
    }

    return transactions;
  }

  // Normalizes snake casing text given from backend
  // ex: 'RETRO_BILLED' to 'Retro Billed'
  private normalizeTxnType(txnType: string) {
    const words = txnType.split('_');
    return words.map((word) => this.convertWordToTitle(word)).join(' ');
  }

  // Converts word to title casing
  // ex: 'RETRO' to 'Retro'
  private convertWordToTitle(word: string) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1).toLowerCase()}`;
  }
}
