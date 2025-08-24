import { Corridor } from "./Corridor";

export enum MotionStatus { YES, NO }

export class MotionDetector {
  constructor(
    public id: string,
    public corridor: Corridor,
    public status: MotionStatus = MotionStatus.NO
  ) {}
  toggle(): void {
    this.status = this.status === MotionStatus.YES ? MotionStatus.NO : MotionStatus.YES;
  }
}
