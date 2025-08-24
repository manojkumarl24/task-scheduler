import { MotionDetector } from "../models/MotionDetector";
import { Light } from "../models/Equipment";
import { Floor } from "../models/Floor";
import { PowerService } from "./PowerService";
import { TimeService } from "./TimeService";

export class MotionDetectorRepo {
  private detectors: MotionDetector[] = [];
  add(md: MotionDetector) { this.detectors.push(md); }
  get(id: string): MotionDetector | undefined {
    return this.detectors.find(md => md.id === id);
  }
}

export class Controller {
  constructor(private mdRepo: MotionDetectorRepo, private timeService: TimeService) {}

  handleMotion(hotel: any, motionId: string): void {
    const md = this.mdRepo.get(motionId);
    if (!md) {
      console.log("Invalid motion!");
      return;
    }

    md.toggle();
    const light = md.corridor.equipments.find(eq => eq instanceof Light);
    if (light) light.status = md.status === 0 ? 1 : 0;

    const corridorNo = motionId && motionId.includes("|") ? motionId.split("|")[0] : "";
    this.adjustPower(hotel, corridorNo);

    this.timeService.setResetTimer(motionId, () => this.resetLight(md, hotel));
  }

  private resetLight(md: MotionDetector, hotel: any): void {
    const light = md.corridor.equipments.find(eq => eq instanceof Light);
    if (light) light.status = 0;
    const floorId = md.id && md.id.includes("|") ? md.id.split("|")[0] : "";
    this.adjustPower(hotel, floorId);
  }

  private adjustPower(hotel: any, floorId: string): void {
    if (!floorId) return;
    const floor: Floor | undefined = hotel.getFloor(floorId);
    if (!floor) return;

    while (PowerService.currentPower(floor) > PowerService.maxPower(floor)) {
      const sub = floor.subCorridors().find(sc =>
        sc.equipments.some(eq => eq.isOn() && eq.units === 10)
      );
      if (!sub) break;
      const ac = sub.equipments.find(eq => eq.units === 10);
      if (ac) ac.status = 0;
    }
  }
}
