import * as fs from 'fs';
import { User, Bill, Product } from './Models';

function formatStringToDate(stringDate: string): Date{
  return new Date(stringDate);
}

function calculateYearWiseDateDifference(dateA: Date, dateB: Date): number{
   const diff = dateA.getFullYear() - dateB.getFullYear()
   return diff
}

function calculateMonthWiseDateDifference(dateA: Date, dateB: Date): number{
   const diff = dateA.getMonth() - dateB.getMonth()
   return diff
}

// function didDateCrossBirthDate(gnDate: Date, dob: Date): boolean{
//   const condt = gnDate.getDate() < dob.getDate();
//   return condt;
// }

// function didDateCrossBirthMonth(gnDate: Date, dob: Date): boolean{
//   const monthDiff = calculateMonthWiseDateDifference(gnDate, dob);
//   const result = (monthDiff < 0 || monthDiff == 0 && didDate)
// }

function calculateAge(user: User): number{
  let lastBillDate = formatStringToDate(user.lastBillDate ?? "");
  let dob = formatStringToDate(user.dob);

  let age = calculateYearWiseDateDifference(lastBillDate, dob);
  const monthDiff = calculateMonthWiseDateDifference(lastBillDate, dob);

  if (monthDiff < 0 || (monthDiff === 0 && lastBillDate.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function calculateDiscount(discountPerc: string, amt: number): number{
   let discountValue = parseFloat(discountPerc.replace('%', '')) / 100;
   discountValue *= amt;
   return discountValue;
}

function calculatePaidAmt(product: Product, discount:string) : number { 
    let paidAmount = product.price * product.quantity;
    let discountValue = calculateDiscount(discount, paidAmount);
    paidAmount = paidAmount + product.taxAmt - discountValue;
    return paidAmount;
}

function convertDateWithCommonYear(date: Date): Date{
   const commonYear = 2000;
   const dateWithCommonYear = new Date(commonYear, date.getMonth(), date.getDate());
   return dateWithCommonYear;
}

function calculateDaysBetweenDates(billDate: string, dob: string): number{
  let billDateVaue = formatStringToDate(billDate);
  let dobValue = formatStringToDate(dob)
  const billDateWithCommonYear = convertDateWithCommonYear(billDateVaue);
  const dobWithCommonYear = convertDateWithCommonYear(dobValue);
  const differenceInMs = Math.abs(dobWithCommonYear.getTime() - billDateWithCommonYear.getTime());
  const millisecondsInDay: number = 1000 * 60 * 60 * 24;
  const noOfDays = differenceInMs / millisecondsInDay;
  return noOfDays;
}

function wasBoughtOnBirthday(billDate: string, dob: string) : boolean{
    const dateDiff = calculateDaysBetweenDates(billDate, dob);
    const wasBought = (dateDiff<=30);
    return wasBought;
}

function isLastBillDate(user: User, bill: Bill): string{
  if(user.lastBillDate == "") return bill.date

  let lastBillDate = formatStringToDate((user.lastBillDate ?? ""));
  let billDate = formatStringToDate(bill.date);
  const lastBillDateFound = (lastBillDate >= billDate) ? (user.lastBillDate ?? ""): bill.date;
  return lastBillDateFound;
}


function calculateGrossAmount(billData: Bill, product: Product): number{
  const calcGrossAmt = (billData.grossTotal ?? 0) + product.price * product.quantity + product.taxAmt;
  return calcGrossAmt;
}

function calculatePayableAmount(billData: Bill, product: Product): number{
  const calcPayableAmt = (billData.payableAmt ?? 0) + (product.paidAmt ?? 0);
  return calcPayableAmt;
}

function calculateLtv(user: User, bill: Bill): number{
   const calcLtv = (user.ltv ?? 0) + (bill.payableAmt ?? 0);
   return calcLtv;
}

function transformBillData(billData: Bill, dob:string): Bill{
  const billDataTransformed: Bill = billData;  
  billDataTransformed.grossTotal = 0;
  billDataTransformed.payableAmt = 0;
  for(let product of billData.products){
      product.paidAmt = calculatePaidAmt(product, billData.discount);
      billDataTransformed.grossTotal = calculateGrossAmount(billDataTransformed, product);
      billDataTransformed.payableAmt = calculatePayableAmount(billDataTransformed, product);
  }
  
  billDataTransformed.boughtForBirthday = wasBoughtOnBirthday(billData.date, dob)
  return billDataTransformed;
}


function transformUserData(userData: User): User{
   let userTransformed:User = userData;
   userTransformed.lastBillDate = "";
   userTransformed.ltv = 0;
   for(let bill of userTransformed.bills){
    let billTransformed = transformBillData(bill, userTransformed.dob);
    bill = billTransformed;
    userTransformed.lastBillDate = isLastBillDate(userTransformed, bill);
    userTransformed.ltv = calculateLtv(userTransformed, bill);
   }
   userTransformed.age = calculateAge(userTransformed);

   return userTransformed;
}

function parseUserJSONFile(filepath: string): User{
  const jsonString: string = fs.readFileSync(filepath, 'utf8');
  const userData: User = JSON.parse(jsonString) as User; 
  return userData;
}

function saveUserAsJSON(user: User): void{
  const userJSON = JSON.stringify(user, null, 2);
  fs.writeFileSync('OutputUser.json', userJSON, 'utf8');
  console.log("User data saved to OutputUser.json");
}

try {
      const filepath: string = 'src\\InputUser.json'
      const inputUser: User = parseUserJSONFile(filepath)
      const userTransformed = transformUserData(inputUser)
      console.log(JSON.stringify(userTransformed, null, 2));
      saveUserAsJSON(userTransformed);
    } catch (error) {
      console.error('Error parsing JSON:', error);
}
