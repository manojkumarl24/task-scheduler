import * as readline from "readline";

class Product {
    constructor(
        public pid: string,
        public pname: string,
        public qty: number,
        public price: number
    ) {}

    setQuantity(qty: number){
          this.qty = qty;
    }

}



class Inventory{
   private productInv: Product[] = [];

   addProduct(product: Product): void{
      this.productInv.push(product);
   }
   
   isStockAvailable(product: Product, saleQty: number): boolean{
      return product!=undefined && product.qty >= saleQty;
   }    

   findProduct(pid: string): Product | undefined{
     return this.productInv.find(product => product.pid===pid);
   }

   getSaleProduct(pid: string, saleQty: number){
     const prod = this.findProduct(pid);
     if(this.isStockAvailable(prod, saleQty)){
          return undefined;
     }
     return prod;
   }

   
   updateProductInInventory(product: Product, saleQty: number){
     let updStockQty = product.qty - saleQty;  
     product.setQuantity(updStockQty);      
   }

   getProductStock(pid: string): number | undefined{
       const product = this.getProduct(pid)
       var doExist = (product!=undefined)
       if(doExist){
        return product?.qty;
       }
       return -1;
   }

}

class BillItem{
    constructor(
        public pid: string,
        public pname: string,
        public saleQty: number,
        public netPrice: number
    ) {};
}


class Bill{
    constructor(
        public billItems: BillItem[]
    ) {};

    addBillItem(billItem: BillItem){
        this.billItems.push(billItem);
    }

    computeOverallPrice(){
       
    }

    printBill(){

    }
}

class BillFactory{
  constructor(
    public saleBill: Bill
  ) {};

  prepareSaleBill(inventory: Inventory, sales: Map<string, number>){
      for(const [pid, qty] of sales.entries()) {
         const product = inventory.getProduct(pid);
         const isAvailable = product && inventory.isStockAvailable(product, qty)
         if(isAvailable){
            this.saleBill.addBillItem(new BillItem(pid, product.pname, qty, product.price*qty))            
         }
      }          
   }
}
    




class CLManager{
    executeCommand(cmd: string){
        let cmd
    }

    private inventoryCmd(cmd: string){

    }

    private salesCmd(cmd: string){

    }

    private stockCmd(cmd: string){

    }


}


try{
    const rl = readline.createInterface({
               input: process.stdin,
               output: process.stdout,
    });

    while(true){   
        rl.question("> ", (name) => {
        console.log(`Hello, ${name}!`);
        rl.close();
        });
    }
    
}