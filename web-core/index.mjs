import { netAPI } from "./net/index.mjs";
import { register } from "./wsd/index.mjs";

await register(netAPI);
console.log(netAPI.core.getNetworkDevices());