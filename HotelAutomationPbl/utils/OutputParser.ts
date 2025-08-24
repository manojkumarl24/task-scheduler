import { Hotel } from "../models/Hotel";
import { Light, AC } from "../models/Equipment";
import { MainCorridor } from "../models/Corridor";

const isOn = (eq: any): boolean => {
  if (!eq) return false;
  if (typeof eq.isOn === "function") return eq.isOn();
  if (typeof eq.isStatusOn === "function") return eq.isStatusOn();
  return eq.status === 0; // fallback if enum ON === 0
};

export class OutputParser {
  static printHotelStatus(hotel: Hotel): void {
    for (const floor of hotel.floors) {
      console.log(`Floor ${floor.id}`);
      for (const corridor of floor.corridors) {
        const type = corridor instanceof MainCorridor ? "Main" : "Sub";
        const light = corridor.equipments.find(eq => eq instanceof Light);
        const ac = corridor.equipments.find(eq => eq instanceof AC);
        console.log(
          `${type} corridor ${corridor.id} Light: ${isOn(light) ? "ON" : "OFF"} AC: ${isOn(ac) ? "ON" : "OFF"}`
        );
      }
      console.log();
    }
  }
}
