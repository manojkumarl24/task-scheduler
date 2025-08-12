enum Cuisine {
    INDIAN = "Indian",
    CHINESE = "Chinese",
    ITALIAN = "Italian"
}

enum FoodCategory {
    VEG = "Veg",
    NON_VEG = "Non-Veg"
}

enum OrderStatus {
    IN_DELIVERY = "In Delivery",
    DELIVERED = "Delivered",
    CANCELED = "Canceled"
}

class FoodItem {
    constructor(
        public name: string,
        public price: number,
        public isAvailable: boolean
    ) {}
}

class Menu {
    private foodItems: FoodItem[] = [];

    addFoodItem(item: FoodItem) {
        this.foodItems.push(item);
    }

    getAvailableItems(): FoodItem[] {
        return this.foodItems.filter(item => item.isAvailable);
    }

    searchFoodByName(foodName: string): FoodItem[] {
        return this.foodItems.filter(item =>
            item.name.toLowerCase().includes(foodName.toLowerCase()) &&
            item.isAvailable
        );
    }
}

class Order {
    public assignedDeliverer?: Deliverer;
    constructor(
        public customerName: string,
        public restaurant: Restaurant,
        public items: FoodItem[],
        public status: OrderStatus = OrderStatus.IN_DELIVERY
    ) {}

    getTotalPrice(): number {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    updateStatus(newStatus: OrderStatus) {
        this.status = newStatus;
    }

    assignDeliverer(deliverer: Deliverer) {
        this.assignedDeliverer = deliverer;
    }
}

class Restaurant {
    public orders: Order[] = [];
    constructor(public name: string, public menu: Menu) {}

    addOrder(order: Order) {
        this.orders.push(order);
    }

    getPendingOrders(): Order[] {
        return this.orders.filter(order => order.status === OrderStatus.IN_DELIVERY);
    }
}

class RestaurantManager {
    constructor(public name: string, public restaurant: Restaurant) {}

    addFoodToMenu(foodName: string, price: number, isAvailable: boolean) {
        const item = new FoodItem(foodName, price, isAvailable);
        this.restaurant.menu.addFoodItem(item);
    }

    viewOrders(): Order[] {
        return this.restaurant.orders;
    }

    assignOrderToDeliverer(order: Order, deliverer: Deliverer) {
        order.assignDeliverer(deliverer);
        console.log(`Manager ${this.name} assigned ${deliverer.name} to deliver order for ${order.customerName}`);
    }
}

class Customer {
    constructor(public name: string) {}

    searchRestaurantsByName(restaurants: Restaurant[], name: string): Restaurant[] {
        return restaurants.filter(r =>
            r.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    searchFood(restaurants: Restaurant[], foodName: string): { restaurant: Restaurant, food: FoodItem[] }[] {
        return restaurants
            .map(r => ({
                restaurant: r,
                food: r.menu.searchFoodByName(foodName)
            }))
            .filter(result => result.food.length > 0);
    }

    placeOrder(restaurant: Restaurant, foodNames: string[]): Order {
        const selectedItems = restaurant.menu.getAvailableItems().filter(item =>
            foodNames.includes(item.name)
        );
        const order = new Order(this.name, restaurant, selectedItems);
        restaurant.addOrder(order);
        console.log(`Order placed by ${this.name} at ${restaurant.name} for ₹${order.getTotalPrice()}`);
        return order;
    }
}

class Deliverer {
    constructor(public name: string) {}

    deliverOrder(order: Order) {
        console.log(`${this.name} is delivering order for ${order.customerName}`);
        order.updateStatus(OrderStatus.DELIVERED);
    }

    cancelOrder(order: Order) {
        console.log(`${this.name} canceled the order for ${order.customerName}`);
        order.updateStatus(OrderStatus.CANCELED);
    }
}

try {
    const menu1 = new Menu();
    const rest1 = new Restaurant("Spicy Hub", menu1);
    const manager1 = new RestaurantManager("Alice", rest1);

    manager1.addFoodToMenu("Biryani", 150, true);
    manager1.addFoodToMenu("Paneer Butter Masala", 200, true);
    manager1.addFoodToMenu("Gulab Jamun", 50, false);

    const customer1 = new Customer("John");
    console.log(customer1.searchRestaurantsByName([rest1], "Spicy"));
    console.log(customer1.searchFood([rest1], "Biryani"));

    const order1 = customer1.placeOrder(rest1, ["Biryani", "Paneer Butter Masala"]);

    console.log("Manager's Orders:", manager1.viewOrders());

    const deliverer1 = new Deliverer("Mike");
    manager1.assignOrderToDeliverer(order1, deliverer1);

    deliverer1.deliverOrder(order1);
    console.log(`Order Status: ${order1.status}`);
} catch (error) {
    console.error('Error:', error);
}
