import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) {}

 getProfile(customerId: string) {
  return this.http.get<any>(`http://localhost:3000/profile/${customerId}`).pipe(
    map((res: any) => {

      console.log("PROFILE RESPONSE:", res);

      return res || {};
    })
  );
}

  getInquiries(customerId: string) {
    return this.http.get<any>(`http://localhost:3000/enquiry/${customerId}`).pipe(
      map((res: any) => {

        console.log(" INQUIRY RAW:", res);

        let items = res?.ET_INQUIRY_LIST?.item;

        if (!items) return [];
        if (!Array.isArray(items)) items = [items];

        console.log(" INQUIRY ITEMS:", items);

        return items.map((item: any) => ({
          inquiryNumber: item.ENQUIRY_NO || '-',
          date: this.formatDate(item.ITEM_DATE),
          material: item.MAT_CODE || '-',
          description: item.DESCRIPTION || '-',
          quantity: item.ORDER_QTY || '-',
          unit: item.UNIT || '-',
          status: this.mapStatus(item.STATUS),
          deliveryDate: this.formatDate(item.REQ_DEL_DATE)
        }));
      })
    );
  }

  getSalesOrders(customerId: string) {
    return this.http.get<any>(`http://localhost:3000/sales/${customerId}`).pipe(
      map((res: any) => {

        console.log(" SALES RAW:", res);

        let items = res?.ET_SALES_ORDER_LIST?.item;

        if (!items) return [];
        if (!Array.isArray(items)) items = [items];

        return items.map((item: any) => ({
          orderNo: item.ORDER_NO || '-',
          date: this.formatDate(item.ORDER_DATE),
          material: item.MAT_CODE || '-',
          description: item.DESCRIPTION || '-',
          quantity: item.ORDER_QTY || '-',
          unit: item.UNIT || '-',
          status: this.mapStatus(item.STATUS)
        }));
      })
    );
  }

  getDeliveries(customerId: string) {
    return this.http.get<any>(`http://localhost:3000/delivery/${customerId}`).pipe(
      map((res: any) => {

        console.log(" DELIVERY RAW:", res);

        let items = res?.ET_DELIVERY?.item;

        if (!items) return [];
        if (!Array.isArray(items)) items = [items];

        return items.map((item: any) => ({
          deliveryNumber: item.VBELN || '-',
          createdDate: this.formatDate(item.ERDAT),
          deliveryDate: this.formatDate(item.WADAT),
          storageLocation: this.getLocationName(item.LGORT),
          shippingPoint: this.getShippingPointName(item.VSTEL)
        }));
      })
    );
  }

  getFinance(customerId: string) {
    return this.http.get<any>(`http://localhost:3000/finance/${customerId}`).pipe(
      map((res: any) => {

        console.log(" FINANCE RAW:", res);

        const data =
          res?.["soap-env:Envelope"]?.["soap-env:Body"]?.["n0:ZFM_FI_FINANCE_20Response"];

        const toArray = (val: any) => {
          if (!val) return [];
          return Array.isArray(val) ? val : [val];
        };

        return {
          aging:       toArray(data?.T_AGING?.item),
          creditDebit: toArray(data?.T_CREDITDEBIT?.item),
          invoice:     toArray(data?.T_INVOICE?.item),
          total:       data?.T_SALES_SUM?.item?.TOTAL_AMOUNT || 0
        };
      })
    );
  }
  private mapStatus(status: string): string {
    switch (status) {
      case 'A': return 'Approved';
      case 'B': return 'Pending';
      case 'C': return 'Completed';
      default: return status || '-';
    }
  }

  private formatDate(date: string): string {
    if (!date || date === '0000-00-00') return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const day   = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year  = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private getLocationName(loc: string): string {
    switch (loc) {
      case '0001': return 'Main Warehouse';
      case 'YBST': return 'Secondary Warehouse';
      case '':     return 'Not Available';
      default:     return loc || 'Not Available';
    }
  }

  private getShippingPointName(point: string): string {
    switch (point) {
      case '0001': return 'Main Shipping Point';
      case 'YS01': return 'Secondary Shipping Point';
      default:     return point || 'Not Available';
    }
  }
}