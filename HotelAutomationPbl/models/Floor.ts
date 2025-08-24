import { Corridor, MainCorridor, SubCorridor } from "./Corridor";

export class Floor {
  public corridors: Corridor[] = [];
  constructor(public id: string) {}
  addCorridor(c: Corridor) { this.corridors.push(c); }
  subCorridors(): SubCorridor[] {
    return this.corridors.filter(c => c instanceof SubCorridor) as SubCorridor[];
  }
}
