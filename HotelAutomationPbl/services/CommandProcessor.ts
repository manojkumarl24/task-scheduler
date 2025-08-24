import { Controller } from "./Controller";
import { OutputParser } from "../utils/OutputParser";
import { Hotel } from "../models/Hotel";

export class CommandProcessor {
  constructor(private controller: Controller, private hotel: Hotel) {}
  execute(cmd: string) {
    if (cmd.toLowerCase() === "quit") process.exit(0);
    if (!cmd.startsWith("MOTION=>")) return console.log("Unknown command");
    const motionId = cmd.split("=>")[1] ?? "";
    this.controller.handleMotion(this.hotel, motionId);
    OutputParser.printHotelStatus(this.hotel);
  }
}
