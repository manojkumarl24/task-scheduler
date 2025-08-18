import * as readline from "readline";

enum OfferType {
    NA = "N/A"
}

class Product {
    constructor(
        public id: string,
        public name: string,
        public qty: number,
        public price: number
    ) {}

    reduceStock(count: number) {
        if (count > this.qty) throw new Error("Not enough stock");
        this.qty -= count;
    }
}

class BillItem {
    constructor(
        public productId: string,
        public productName: string,
        public qty: number,
        public unitPrice: number,
        public offer: OfferType = OfferType.NA,
        public netPrice: number = unitPrice * qty
    ) {}
}

class Bill {
    private items: BillItem[] = [];

    addItem(item: BillItem) {
        this.items.push(item);
    }

    getItems() {
        return this.items;
    }

    getTotal(): number {
        return this.items.reduce((sum, item) => sum + item.netPrice, 0);
    }
}

class BillPrinter {
    print(bill: Bill) {
        console.log("== Bill ==");
        bill.getItems().forEach(item => {
            console.log(`${item.productId} - ${item.productName} - ${item.qty} - ${item.unitPrice} - ${item.offer} - ${item.netPrice}`);
        });
        console.log("== Total ==");
        console.log(bill.getTotal());
        console.log("========");
    }
}


interface InventoryRepo {
    add(product: Product): void;
    findById(id: string): Product | undefined;
}

class Inventory implements InventoryRepo {
    private products: Map<string, Product> = new Map();

    add(product: Product) {
        this.products.set(product.id, product);
    }

    findById(id: string): Product | undefined {
        return this.products.get(id);
    }

    getStockInfo(pid: string): string {
        const product = this.findById(pid);
        if (!product) return "Product not found";
        return `${product.name} - ${product.qty}`;
    }
}

class SaleService {
    constructor(private inventory: InventoryRepo) {}

    processSale(sales: Map<string, number>): Bill {
        const bill = new Bill();

        sales.forEach((qty, pid) => {
            const product = this.inventory.findById(pid);
            if (!product) {
                console.error(`Product ID ${pid} not found`);
                return;
            }
            if (qty > product.qty) {
                console.error(`Not enough stock for ${product.name}`);
                return;
            }

            product.reduceStock(qty);

            bill.addItem(new BillItem(product.id, product.name, qty,
                product.price, OfferType.NA
            ));
        });

        return bill;
    }
}


class CommandManager {
    constructor(
        private inventory: Inventory,
        private saleService: SaleService,
        private printer: BillPrinter
    ) {}

    execute(command: string) {
        if (command.startsWith("INVENTORY=>")) {
            this.handleInventory(command);
        } else if (command.startsWith("SALE=>")) {
            this.handleSale(command);
        } else if (command.startsWith("STOCK=>")) {
            this.handleStock(command);
        } else {
            console.log("Unknown command");
        }
    }

    private handleInventory(cmd: string) {
        const data = cmd.replace("INVENTORY=>", "").split("|");
        const [pid, name, qtyStr, priceStr] = data;
        const product = new Product(pid, name, parseInt(qtyStr), parseInt(priceStr));
        this.inventory.add(product);
        console.log("Inventory Updated.");
    }

    private handleSale(cmd: string) {
        const salesPart = cmd.replace("SALE=>", "");
        const salesMap = new Map<string, number>();

        salesPart.split(";").forEach(item => {
            const [pid, qtyStr] = item.split("|");
            salesMap.set(pid, parseInt(qtyStr));
        });

        const bill = this.saleService.processSale(salesMap);
        this.printer.print(bill);
    }

    private handleStock(cmd: string) {
        const pid = cmd.replace("STOCK=>", "").trim();
        console.log(this.inventory.getStockInfo(pid));
    }
}


const inventory = new Inventory();
const saleService = new SaleService(inventory);
const printer = new BillPrinter();
const manager = new CommandManager(inventory, saleService, printer);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Welcome to AJ SuperMarket POS!");

function activatePOS() {
    rl.question("> ", (input) => {
        if (input.trim().toLowerCase() === "exit") {
            rl.close();
            return;
        }
        try {
            manager.execute(input.trim());
        } catch (err) {
            console.error("Error:", err);
        }
        activatePOS();
    });
}

activatePOS();
