import * as readline from "readline";

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
        public offer: string = "NA",
        public netPrice: number = 0
    ) {};

    calculateSimpleNetPrice() {
        return this.unitPrice * this.qty;
    }

    setNetPrice(netPrice: number) {
        this.netPrice = netPrice;
    }

    getNetPrice(): number {
        return this.netPrice;
    }

    setOffer(id: string) {
        this.offer = id;
    }
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

class Offer {
    constructor(
        public id: string,
        public prodID: string,
        public minQty: number,
        public discPerc: number
    ) {}
}

class OfferBuilder {
    static createOffer(offerId: string, productId: string, minQty: number, discPerc: number): Offer {
        return new Offer(offerId, productId, minQty, discPerc);
    }
}

class OfferRepo {
    private offers: Offer[] = [];

    add(offer: Offer) {
        this.offers.push(offer);
    }

    findByProdId(pid: string): Offer | undefined {
        return this.offers.find(offer => offer.prodID == pid);
    }

    getOffer(id: string): Offer | undefined {
        return this.offers.find(offer => offer.id == id);
    }

    getAllByProductId(pid: string): Offer[] {
        return this.offers.filter(offer => offer.prodID == pid);
    }
}

class SaleService {
    constructor(
        private inventory: InventoryRepo,
        private offerRepo: OfferRepo
    ) {}

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

            const offerId = this.getBestOfferId(product.id, qty);
            console.log(offerId);
            const netPrice = this.calculateNetPrice(product.price, offerId, qty);
            console.log(netPrice);
            bill.addItem(new BillItem(product.id, product.name, qty, product.price, offerId, netPrice));
            product.reduceStock(qty);
        });

        return bill;
    }

    getBestOfferId(productId: string, qty: number): string {
        const allOffers = this.offerRepo.getAllByProductId(productId);
        if (allOffers.length === 0) return "NA";

        let bestOffer = "NA";
        let maxDiscountValue = 0;

        allOffers.forEach(offer => {
            if (qty >= offer.minQty) {
                const sets = Math.floor(qty / offer.minQty);
                const discount = sets * (offer.minQty * this.inventory.findById(productId)!.price * (offer.discPerc / 100));
                if (discount > maxDiscountValue) {
                    maxDiscountValue = discount;
                    bestOffer = offer.id;
                }
            }
        });

        return bestOffer;
    }


    calculateNetPrice(unitPrice: number, offerId: string, qty: number): number {
        let netPrice = unitPrice * qty;
        console.log(offerId)
        if (offerId != "NA") {
            netPrice = this.getNetPriceAfterOffer(unitPrice, qty, offerId);
            console.log(netPrice);
        }
        return netPrice;
    }

    
    getNetPriceAfterOffer(unitPrice: number, qty: number, offerId: string): number {
        const offer = this.offerRepo.getOffer(offerId);
        if (!offer) return unitPrice * qty;

        if (qty < offer.minQty) {
            return unitPrice * qty; 
        }

        const sets = Math.floor(qty / offer.minQty);
        const discountPerSet = offer.minQty * unitPrice * (offer.discPerc / 100);
        const totalDiscount = sets * discountPerSet;

        return (unitPrice * qty) - totalDiscount;
    }

}


interface Command {
    executeCommand(cmd: string): void;
}

class InventoryCommand implements Command {
    constructor(
        public inventory: Inventory
    ) {}

    executeCommand(cmd: string): void {
        const data = cmd.replace("INVENTORY=>", "").split("|");
        const [pid, name, qtyStr, priceStr] = data;
        const product = new Product(
            pid ?? "",
            name ?? "",
            parseInt(qtyStr ?? "0"),
            parseInt(priceStr ?? "0")
        );
        this.inventory.add(product);
        console.log("Inventory updated.");
    }
}

class SaleCommand implements Command {
    constructor(
        public saleService: SaleService,
        public printer: BillPrinter
    ) {}

    executeCommand(cmd: string): void {
        const salesPart = cmd.replace("SALE=>", "");
        const salesMap = new Map<string, number>();

        salesPart.split(";").forEach(item => {
            let [pid, qtyStr] = item.split("|");
            [pid, qtyStr] = [pid ?? "", qtyStr ?? ""];
            const qty = parseInt(qtyStr);
            if (pid && !Number.isNaN(qty)) {
                salesMap.set(pid, qty);
            }
        });

        const bill = this.saleService.processSale(salesMap);
        this.printer.print(bill);
    }
}

class StockCommand implements Command {
    constructor(
        public inventory: Inventory
    ) {}

    executeCommand(cmd: string): void {
        const pid = cmd.replace("STOCK=>", "").trim();
        console.log(this.inventory.getStockInfo(pid));
    }
}

class OfferCommand implements Command {
    constructor(
        public offerRepo: OfferRepo
    ) {}

    executeCommand(cmd: string): void {
        const data = cmd.replace("NEW-OFFER=>BuyXMore|", "").split("|");
        const [offerId, productId, minQty, specialPrice] = data;
        const offer = OfferBuilder.createOffer(
            offerId ?? "",
            productId ?? "",
            parseInt(minQty ?? "0"),
            parseInt(specialPrice ?? "0")
        );
        this.offerRepo.add(offer);
        console.log("Offer Added.");
    }
}

class CommandManager {
    constructor(
        private inventory: Inventory,
        private saleService: SaleService,
        private printer: BillPrinter,
        private offerRepo: OfferRepo
    ) {}

    execute(command: string) {
        const startCmd = command.split("=>")[0];
        if (startCmd == "INVENTORY") {
            const inventoryCommand: Command = new InventoryCommand(this.inventory);
            inventoryCommand.executeCommand(command);
        } else if (startCmd == "SALE") {
            const saleCommand: Command = new SaleCommand(this.saleService, this.printer);
            saleCommand.executeCommand(command);
        } else if (startCmd == "STOCK") {
            const stockCommand: Command = new StockCommand(this.inventory);
            stockCommand.executeCommand(command);
        } else if (startCmd == "NEW-OFFER") {
            const offerCommand: Command = new OfferCommand(this.offerRepo);
            offerCommand.executeCommand(command);
        } else {
            console.log("Unknown command");
        }
    }
}

class AJPOSApplication {
    run() {
        const inventory = new Inventory();
        const offerRepo = new OfferRepo();
        const saleService = new SaleService(inventory, offerRepo);
        const printer = new BillPrinter();
        const manager = new CommandManager(inventory, saleService, printer, offerRepo);

        console.log("Welcome to AJ SuperMarket POS!");
        this.activatePOS(manager);
    }

    activatePOS(manager: CommandManager) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        const promptUser = () => {
            rl.question("> ", (input) => {
                const command = input.trim();

                if (!command) {
                    console.log("Empty command ignored.");
                    return promptUser();
                }

                if (command.toLowerCase() === "exit") {
                    rl.close();
                    console.log("Exiting POS...");
                    return;
                }

                try {
                    manager.execute(command);
                } catch (err) {
                    console.error("Error:", err instanceof Error ? err.message : err);
                }

                promptUser();
            });
        };

        promptUser();
    }
}


const posApp: AJPOSApplication = new AJPOSApplication();
posApp.run();