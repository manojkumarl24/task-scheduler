import { Floor } from "../models/Floor";
import { MainCorridor, SubCorridor } from "../models/Corridor";

export class PowerService {
  static maxPower(floor: Floor): number {
    return MainCorridor.powerConst * floor.corridors.filter(c=>c instanceof MainCorridor).length +
           SubCorridor.powerConst * floor.subCorridors().length;
  }
  static currentPower(floor: Floor): number {
    return floor.corridors.flatMap(c=>c.equipments)
      .filter(eq=>eq.isOn())
      .reduce((sum, eq)=>sum+eq.units, 0);
  }
}
