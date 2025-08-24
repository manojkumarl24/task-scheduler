import { EquipmentStatus } from "../models/Equipment";
import { Corridor, MainCorridor, SubCorridor } from "../models/Corridor";
import { EquipmentBuilder } from "./EquipmentBuilder";

export class CorridorBuilder {
  static createMain(id: string): MainCorridor {
    const corridor = new MainCorridor(id);
    corridor.addEquipment(EquipmentBuilder.createLight(EquipmentStatus.ON));
    corridor.addEquipment(EquipmentBuilder.createAC(EquipmentStatus.ON));
    return corridor;
  }
  static createSub(id: string): SubCorridor {
    const corridor = new SubCorridor(id);
    corridor.addEquipment(EquipmentBuilder.createLight(EquipmentStatus.OFF));
    corridor.addEquipment(EquipmentBuilder.createAC(EquipmentStatus.ON));
    return corridor;
  }
}
