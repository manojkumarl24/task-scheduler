import { Hotel } from "../models/Hotel";
import { Floor } from "../models/Floor";
import { CorridorBuilder } from "./CorridorBuilder";

export class HotelBuilder {
  static create(noFloors: number, noMain: number, noSub: number): Hotel {
    const hotel = new Hotel();
    for (let f = 1; f <= noFloors; f++) {
      const floor = new Floor(f.toString());
      for (let m = 1; m <= noMain; m++) floor.addCorridor(CorridorBuilder.createMain(m.toString()));
      for (let s = 1; s <= noSub; s++) floor.addCorridor(CorridorBuilder.createSub(s.toString()));
      hotel.addFloor(floor);
    }
    return hotel;
  }
}
