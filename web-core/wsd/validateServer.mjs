async function getData(url = "", method = "GET", data) {
  const response = await fetch(url, {
    method: method,
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: data ? JSON.stringify(data) : undefined,
  });
  
  return response.json();
}

// Eclipse Network Configuration Protocol
export async function enCPConfig(wsIP) {
  const httpURL = wsIP.replace("ws", "http");
  const reserveTest = await getData(httpURL + "/api/v1/reserveClientIP", "POST");

  console.log(reserveTest);

  return reserveTest;
}