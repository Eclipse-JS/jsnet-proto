import { netAPI } from "./net/index.js";

netAPI.core.addNetworkDevice("lo", 127, 0, 0, [1], () => {}, () => {});
console.log(netAPI.core.getNetworkDevices());