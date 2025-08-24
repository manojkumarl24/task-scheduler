import { Floor } from "./Floor";

export class Hotel {
  public floors: Floor[] = [];
  addFloor(floor: Floor) { this.floors.push(floor); }
  getFloor(id: string): Floor | undefined {
    return this.floors.find(f => f.id === id);
  }
}
