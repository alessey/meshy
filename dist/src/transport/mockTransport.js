import { EventEmitter } from "events";
import { log } from "../logging.js";
export class MockTransport extends EventEmitter {
    constructor() {
        super();
        this.fromDevice = new ReadableStream({ start() { } });
        this.toDevice = new WritableStream({ write() { } });
    }
    async connect() {
        log("--- SIMULATOR ONLINE ---");
    }
}
