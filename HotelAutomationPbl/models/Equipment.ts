export enum EquipmentStatus { ON, OFF }

export abstract class Equipment {
  constructor(public status: EquipmentStatus, public units: number) {}
  isOn(): boolean { return this.status === EquipmentStatus.ON; }
}

export class Light extends Equipment {
  constructor(status: EquipmentStatus) { super(status, 5); }
}

export class AC extends Equipment {
  constructor(status: EquipmentStatus) { super(status, 10); }
}
