import { Equipment } from "./Equipment";

export abstract class Corridor {
  public equipments: Equipment[] = [];
  constructor(public id: string) {}
  addEquipment(eq: Equipment) { this.equipments.push(eq); }
}

export class MainCorridor extends Corridor {
  static powerConst = 15;
}

export class SubCorridor extends Corridor {
  static powerConst = 10;
}
