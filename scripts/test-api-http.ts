import "dotenv/config";

async function testHttp() {
  const url = "http://localhost:3000/api/v1/payment/methods?cartTotal=500";
  console.log(`[HTTP GET] ${url}`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response JSON:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("HTTP Fetch Error:", err.message);
  }
}

testHttp();
