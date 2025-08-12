class User{
    protected userName : string;
    protected email : string;
    protected mobileNo: string;
    protected address: string;

}

class Customer extends User{

    function searchByFood(foodName: string){

    }

    function makeOrder(){
        
    }
}

class Restaurant{
    protected name: string;
    protected isOpen: boolean;
    protected branches: string[];
    
}

class Manager extends User{
    protected restaurant : Restaurant;
}

class Deliverer extends User{
   protected name: string;
   protected mobileNo: string;
   protected vehicleNo: string;
}

class FoodItem{
    protected name: string;
    protected cuisine: string;
    protected category: string;
    protected isveg : boolean;
}

class Menu{
   protected foodAvailableMap: Map<FoodItem, boolean>;
   protected foodPriceMap: Map<FoodItem, number>;
}