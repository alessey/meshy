import { EventEmitter } from "events";
import { log } from "../logging.js";

export class MockTransport extends EventEmitter {
  fromDevice: any;
  toDevice: any;

  constructor() {
    super();
    this.fromDevice = new ReadableStream({ start() {} });
    this.toDevice = new WritableStream({ write() {} });
  }

  async connect(): Promise<void> {
    log("--- SIMULATOR ONLINE ---");
  }
}
