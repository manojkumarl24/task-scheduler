export interface Product{
    skuCode: string;
    price: number;
    quantity: number;
    taxAmt: number;
    paidAmt?: number;
}

export interface Bill{
    date: string;
    products: Product[];
    discount: string;
    boughtForBirthday?: boolean;
    grossTotal?:number;
    payableAmt?: number;
}

export interface User{
    name: string;
    dob: string;
    bills: Bill[];
    age?: number;
    ltv?: number;
    lastBillDate?: string;
}
