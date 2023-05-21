import { getStdin } from 'https://deno.land/x/get_stdin@v1.1.0/mod.ts';

import { netAPI } from "./net/index.mjs";
import { register } from "./wsd/index.mjs";

await register(netAPI);

async function stdout(...data) {
  await Deno.stdout.write(new TextEncoder().encode(data.join(" ")));
}

const client = await netAPI.connect(prompt("Enter an enCP IP:"), 19132);
client.on("message", async(data) => {
  const msg = JSON.parse(data);
  switch (msg.type) {
    default: {
      console.error("ERROR: Unknown message type:", msg.type)
      break;
    }

    case "stdoutClear": {
      for (var i = 0; i < 50; i++) {
        console.log(" ");
      }
      
      break;
    }

    case "stdout": {
      await stdout(msg.data); 
      break;
    }

    case "stdinRequest": {
      const msg = (await getStdin()).replaceAll("\r", "");
      
      client.send(JSON.stringify({
        type: "stdin",
        data: msg
      }))
    }
  }
});