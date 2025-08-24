import * as readline from "readline";
import { HotelBuilder } from "./builders/HotelBuilder";
import { MotionDetectorRepoBuilder } from "./builders/MotionDetectorRepoBuilder";
import { TimeService } from "./services/TimeService";
import { Controller } from "./services/Controller";
import { CommandProcessor } from "./services/CommandProcessor";
import { OutputParser } from "./utils/OutputParser";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter Floors: ", (f: string) => {
  rl.question("Enter Main Corridors: ", (m: string) => {
    rl.question("Enter Sub Corridors: ", (s: string) => {
      const hotel = HotelBuilder.create(parseInt(f), parseInt(m), parseInt(s));
      const mdRepo = MotionDetectorRepoBuilder.create(hotel);
      const controller = new Controller(mdRepo, new TimeService());
      const processor = new CommandProcessor(controller, hotel);

      console.log("Default Hotel Status:");
      OutputParser.printHotelStatus(hotel);
      console.log("Enter MOTION=>FLOOR|SUB or 'quit' to exit:");

      rl.on("line", (cmd: string) => processor.execute(cmd.trim()));
    });
  });
});
