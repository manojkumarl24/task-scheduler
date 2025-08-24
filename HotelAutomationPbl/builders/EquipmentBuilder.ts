import { EquipmentStatus, Light, AC } from "../models/Equipment";

export class EquipmentBuilder {
  static createLight(status: EquipmentStatus): Light {
    return new Light(status);
  }
  static createAC(status: EquipmentStatus): AC {
    return new AC(status);
  }
}
