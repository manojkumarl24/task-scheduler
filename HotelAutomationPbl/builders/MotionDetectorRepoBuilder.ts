import { Hotel } from "../models/Hotel";
import { MotionDetector, MotionStatus } from "../models/MotionDetector";
import { MotionDetectorRepo } from "../services/Controller";
import { SubCorridor } from "../models/Corridor";

export class MotionDetectorRepoBuilder {
  static create(hotel: Hotel): MotionDetectorRepo {
    const repo = new MotionDetectorRepo();
    for (const floor of hotel.floors) {
      for (const corridor of floor.subCorridors()) {
        const id = `${floor.id}|${corridor.id}`;
        repo.add(new MotionDetector(id, corridor, MotionStatus.NO));
      }
    }
    return repo;
  }
}
