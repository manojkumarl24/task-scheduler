import { InputGetter } from "../utils/InputGetter";
import { parsePositiveInt, parseCommand } from "../utils/InputParser";
import { OutputParser } from "../utils/OutputParser";

import { Hotel } from "../models/Hotel";
import { Floor } from "../models/Floor";
import { MainCorridor, SubCorridor } from "../models/Corridor";
import { MotionDetector } from "../models/MotionDetector";
import { Light, AC } from "../models/Equipment";

import { MotionDetectorRepo, Controller } from "../services/Controller";
import { TimeService } from "../services/TimeService";
import { PowerService } from "../services/PowerService";

async function readInt(ig: InputGetter, q: string): Promise<number> {
  while (true) {
    const ans = await ig.ask(q);
    const n = parsePositiveInt(ans);
    if (n !== null) return n;
    console.log("Please enter a non-negative integer.");
  }
}

function buildHotel(floors: number, mains: number, subs: number): Hotel {
  const hotel = new Hotel();
  for (let f = 1; f <= floors; f++) {
    const floor = new Floor(String(f));
    for (let m = 1; m <= mains; m++) floor.addCorridor(new MainCorridor(String(m)));
    for (let s = 1; s <= subs; s++) floor.addCorridor(new SubCorridor(String(s)));
    hotel.addFloor(floor);
  }
  return hotel;
}

function wireMotionRepo(hotel: Hotel): MotionDetectorRepo {
  const repo = new MotionDetectorRepo();
  for (const floor of hotel.floors) {
    for (const corridor of floor.corridors) {
      if (corridor instanceof SubCorridor) {
        const id = `${floor.id}|${corridor.id}`;
        repo.add(new MotionDetector(id, corridor, 1)); // default NO (1)
      }
    }
  }
  return repo;
}

export async function start(): Promise<void> {
  const ig = new InputGetter();

  const noOfFloors = await readInt(ig, "Enter number of Floors: ");
  const noOfMain   = await readInt(ig, "Enter number of Main Corridors: ");
  const noOfSub    = await readInt(ig, "Enter number of Sub Corridors: ");

  const hotel = buildHotel(noOfFloors, noOfMain, noOfSub);
  const mdRepo = wireMotionRepo(hotel);

  const timeService = new TimeService();
  const controller = new Controller(mdRepo, timeService);

  console.log("\nDefault Hotel Status:");
  OutputParser.printHotelStatus(hotel);
  console.log('Enter commands like: MOTION=><floor>|<subCorridor>  (type "quit" to exit)');

  ig.onLine((line: string) => {
    const parsed = parseCommand(line);
    if (parsed.kind === "QUIT") {
      ig.close();
      return;
    }
    if (parsed.kind === "UNKNOWN") {
      console.log(parsed.message);
      ig.prompt();
      return;
    }
    const motionId = `${parsed.floorId}|${parsed.subCorridorId}`;
    controller.handleMotion(hotel, motionId);
    OutputParser.printHotelStatus(hotel);
    ig.prompt();
  });

  ig.prompt();
}
