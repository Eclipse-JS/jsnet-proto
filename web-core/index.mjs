import { netAPI } from "./net/index.js";
console.log(netAPI.core.getNetworkDevices());

netAPI.listen("127.0.0.1", 8000);