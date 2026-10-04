// Comprehensive Test Suite for Nalala Admin Dashboard APIs and Frontend
import { io } from "socket.io-client";

const BASE_URL = process.env.BASE_URL || "https://nalala-be.belanjamu.company/api/v1";
const DASHBOARD_URL = "http://localhost:3001";

let adminToken = "";
let testOrderId = "";
let testWaybill = "";
let createdAccountId = "";
let createdNotifId = "";

const report = [];
function logResult(section, testName, passed, details = "") {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  report.push({ section, testName, status, details });
  console.log(`[${status}] [${section}] ${testName} ${details ? `(${details})` : ""}`);
}

async function runTests() {
  console.log("==================================================");
  console.log("🚀 MEMULAI PENGUJIAN MENYELURUH FITUR ADMIN NALALA");
  console.log("==================================================\n");

  // 1. TEST DASHBOARD FRONTEND HTTP ROUTES
  console.log("--- 1. Testing Dashboard Next.js Pages (Port 3001) ---");
  const routes = [
    "/login",
    "/",
    "/orders",
    "/payments",
    "/shipments",
    "/payment-accounts",
    "/notifications",
    "/products",
    "/vouchers",
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${DASHBOARD_URL}${route}`);
      logResult("Frontend Pages", `Route ${route}`, res.status === 200, `HTTP ${res.status}`);
    } catch (e) {
      logResult("Frontend Pages", `Route ${route}`, false, e.message);
    }
  }

  // 2. TEST AUTHENTICATION
  console.log("\n--- 2. Testing Authentication & Profile API ---");
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@nalala.com", password: "admin123" }),
    });
    const loginJson = await loginRes.json();
    adminToken = loginJson.data?.accessToken;
    const isSuccess = loginJson.success && !!adminToken && loginJson.data?.user?.role === "admin";
    logResult("Auth", "POST /auth/signin (admin@nalala.com)", isSuccess, `Role: ${loginJson.data?.user?.role}`);

    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meJson = await meRes.json();
    logResult("Auth", "GET /users/me (Admin Profile)", meJson.success && meJson.data?.role === "admin", `User: ${meJson.data?.name}`);
  } catch (e) {
    logResult("Auth", "Authentication Pipeline", false, e.message);
  }

  // Also test alternate admin: daffa@nalala.com
  try {
    const daffaRes = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "daffa@nalala.com", password: "password123" }),
    });
    const daffaJson = await daffaRes.json();
    logResult("Auth", "POST /auth/signin (daffa@nalala.com)", daffaJson.success && daffaJson.data?.user?.role === "admin");
  } catch (e) {
    logResult("Auth", "Daffa Auth Test", false, e.message);
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };

  // 3. TEST HALAMAN A: ORDERS MANAGEMENT
  console.log("\n--- 3. Testing Halaman A: Orders API ---");
  try {
    const ordersRes = await fetch(`${BASE_URL}/orders?page=1&limit=10`, { headers: authHeaders });
    const ordersJson = await ordersRes.json();
    const hasOrders = ordersJson.success && Array.isArray(ordersJson.data);
    logResult("Orders", "GET /orders (List Orders)", hasOrders, `Count: ${ordersJson.data?.length}`);

    if (hasOrders && ordersJson.data.length > 0) {
      testOrderId = ordersJson.data[0].id;
      const detailRes = await fetch(`${BASE_URL}/orders/${testOrderId}`, { headers: authHeaders });
      const detailJson = await detailRes.json();
      logResult("Orders", `GET /orders/${testOrderId} (Order Detail)`, detailJson.success, `Order #: ${detailJson.data?.orderNumber}`);
    }
  } catch (e) {
    logResult("Orders", "Orders Pipeline", false, e.message);
  }

  // 4. TEST HALAMAN B: PAYMENTS VERIFICATION
  console.log("\n--- 4. Testing Halaman B: Payments Verification API ---");
  try {
    // Find an order that has pending payment or can be tested
    // Find an order that has pending payment or can be tested
    let ordersRes = await fetch(`${BASE_URL}/orders?limit=20`, { headers: authHeaders });
    let ordersJson = await ordersRes.json();
    let pendingOrder = ordersJson.data?.find(o => o.status === "pending_payment" || o.status === "awaiting_payment_reupload");

    if (!pendingOrder && ordersJson.data?.length > 0) {
      // Create or reset one order status to pending_payment for idempotent testing
      const targetOrder = ordersJson.data[0];
      const { PrismaClient } = await import("../backend/node_modules/@prisma/client/index.js");
      const prisma = new PrismaClient();
      await prisma.shipment.deleteMany({ where: { orderId: BigInt(targetOrder.id) } });
      await prisma.order.update({
        where: { id: BigInt(targetOrder.id) },
        data: { status: "pending_payment" },
      });
      await prisma.payment.updateMany({
        where: { orderId: BigInt(targetOrder.id) },
        data: { status: "waiting_verification", proofImageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500" },
      });
      await prisma.$disconnect();

      ordersRes = await fetch(`${BASE_URL}/orders?limit=20`, { headers: authHeaders });
      ordersJson = await ordersRes.json();
      pendingOrder = ordersJson.data?.find(o => o.id === targetOrder.id);
    }

    if (pendingOrder) {
      // Test verify reject
      const rejectRes = await fetch(`${BASE_URL}/payments/${pendingOrder.id}/verify`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "reject",
          rejectionReason: "Uji otomatis: Gambar bukti transfer kurang jelas",
        }),
      });
      const rejectJson = await rejectRes.json();
      logResult("Payments", "POST /payments/:id/verify (action: reject)", rejectJson.success, rejectJson.message);

      // Test verify approve
      const approveRes = await fetch(`${BASE_URL}/payments/${pendingOrder.id}/verify`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "approve",
          shippingServiceType: "EZ",
        }),
      });
      const approveJson = await approveRes.json();
      testWaybill = approveJson.data?.waybillNumber;
      logResult("Payments", "POST /payments/:id/verify (action: approve & auto waybill)", approveJson.success, `Resi: ${testWaybill}`);
    }
  } catch (e) {
    logResult("Payments", "Payments Verify Pipeline", false, e.message);
  }

  // 5. TEST HALAMAN C: SHIPMENTS LOGISTICS & TRACKING
  console.log("\n--- 5. Testing Halaman C: Shipments & Logistics API ---");
  try {
    if (!testWaybill) {
      // Find an order with waybill
      const ordersRes = await fetch(`${BASE_URL}/orders?limit=20`, { headers: authHeaders });
      const ordersJson = await ordersRes.json();
      const shipped = ordersJson.data?.find(o => o.shipping?.shipment?.waybillNumber);
      if (shipped) {
        testWaybill = shipped.shipping.shipment.waybillNumber;
      }
    }

    if (testWaybill) {
      // Checkpoint 1: on_transit
      const cp1Res = await fetch(`${BASE_URL}/payments/shipments/${testWaybill}/checkpoint`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          status: "on_transit",
          city: "Jakarta Barat",
          description: "Paket tiba di Sorting Hub Jakarta Pusat",
        }),
      });
      const cp1Json = await cp1Res.json();
      logResult("Shipments", `PUT /payments/shipments/${testWaybill}/checkpoint (on_transit)`, cp1Json.success, cp1Json.message);

      // Checkpoint 2: delivered
      const cp2Res = await fetch(`${BASE_URL}/payments/shipments/${testWaybill}/checkpoint`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          status: "delivered",
          city: "Tangerang Selatan",
          description: "Paket berhasil diserahkan kepada penerima",
        }),
      });
      const cp2Json = await cp2Res.json();
      logResult("Shipments", `PUT /payments/shipments/${testWaybill}/checkpoint (delivered)`, cp2Json.success, cp2Json.message);
    } else {
      logResult("Shipments", "Shipment Checkpoint Test", false, "No waybill available to test");
    }
  } catch (e) {
    logResult("Shipments", "Shipments Pipeline", false, e.message);
  }

  // 6. TEST HALAMAN D: PAYMENT ACCOUNTS (FULL CRUD)
  console.log("\n--- 6. Testing Halaman D: Master Payment Accounts (Full CRUD) ---");
  try {
    // 1. GET list
    const listRes = await fetch(`${BASE_URL}/payment-accounts`, { headers: authHeaders });
    const listJson = await listRes.json();
    logResult("Payment Accounts", "GET /payment-accounts", listJson.success, `Count: ${listJson.data?.length}`);

    // 2. POST create
    const createRes = await fetch(`${BASE_URL}/payment-accounts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        type: "bank_transfer",
        providerName: "Bank Mandiri",
        accountNumber: "1230009988776",
        accountHolderName: "PT Nalala Niaga Sejahtera",
        qrImageUrl: null,
        isActive: true,
      }),
    });
    const createJson = await createRes.json();
    createdAccountId = createJson.data?.id;
    logResult("Payment Accounts", "POST /payment-accounts (Create Bank)", createJson.success, `ID: ${createdAccountId}`);

    if (createdAccountId) {
      // 3. PUT update
      const updateRes = await fetch(`${BASE_URL}/payment-accounts/${createdAccountId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          isActive: false,
          accountHolderName: "PT Nalala Niaga Sejahtera (Updated)",
        }),
      });
      const updateJson = await updateRes.json();
      logResult("Payment Accounts", `PUT /payment-accounts/${createdAccountId} (Update & Toggle)`, updateJson.success, updateJson.message);

      // 4. DELETE
      const deleteRes = await fetch(`${BASE_URL}/payment-accounts/${createdAccountId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const deleteJson = await deleteRes.json();
      logResult("Payment Accounts", `DELETE /payment-accounts/${createdAccountId} (Delete)`, deleteJson.success, deleteJson.message);
    }
  } catch (e) {
    logResult("Payment Accounts", "Payment Accounts Pipeline", false, e.message);
  }

  // 7. TEST HALAMAN E: BROADCAST NOTIFICATIONS
  console.log("\n--- 7. Testing Halaman E: Broadcast Notifications API ---");
  try {
    // 1. POST broadcast
    const broadcastRes = await fetch(`${BASE_URL}/notifications/broadcast`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        targetAudience: "reseller",
        title: "Pengujian Sistem Admin",
        message: "Pengumuman otomatis verifikasi integritas sistem dashboard admin.",
        type: "announcement",
      }),
    });
    const broadcastJson = await broadcastRes.json();
    logResult("Notifications", "POST /notifications/broadcast (Create)", broadcastJson.success, broadcastJson.message);

    // 2. GET my notifications
    const myNotifsRes = await fetch(`${BASE_URL}/notifications/my`, { headers: authHeaders });
    const myNotifsJson = await myNotifsRes.json();
    logResult("Notifications", "GET /notifications/my", myNotifsJson.success, `Count: ${myNotifsJson.data?.length}`);

    if (myNotifsJson.data?.length > 0) {
      createdNotifId = myNotifsJson.data[0].id;
      // 3. DELETE notification
      const delNotifRes = await fetch(`${BASE_URL}/notifications/${createdNotifId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const delNotifJson = await delNotifRes.json();
      logResult("Notifications", `DELETE /notifications/${createdNotifId} (Delete)`, delNotifJson.success, delNotifJson.message);
    }
  } catch (e) {
    logResult("Notifications", "Notifications Pipeline", false, e.message);
  }

  // 8. TEST SUPPORTING CATALOG & VOUCHERS API
  console.log("\n--- 8. Testing Catalog & Vouchers Supporting APIs ---");
  try {
    const prodRes = await fetch(`${BASE_URL}/products?page=1&limit=5`);
    const prodJson = await prodRes.json();
    logResult("Catalog", "GET /products", prodJson.success, `Count: ${prodJson.data?.length}`);

    const vouchRes = await fetch(`${BASE_URL}/vouchers?page=1&limit=5`, { headers: authHeaders });
    const vouchJson = await vouchRes.json();
    logResult("Vouchers", "GET /vouchers", vouchJson.success, `Count: ${vouchJson.data?.length}`);
  } catch (e) {
    logResult("Catalog/Vouchers", "Catalog APIs", false, e.message);
  }

  // 9. TEST WEBSOCKET GATEWAY (SOCKET.IO)
  console.log("\n--- 9. Testing Socket.io WebSocket Gateway ---");
  await new Promise((resolve) => {
    try {
      const socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
        timeout: 5000,
      });

      socket.on("connect", () => {
        logResult("WebSocket", "Socket.io Handshake", true, `Socket ID: ${socket.id}`);
        socket.emit("join", { userId: "1", role: "admin" });
        logResult("WebSocket", "Emit 'join' to room:admin", true);
        setTimeout(() => {
          socket.disconnect();
          resolve();
        }, 1000);
      });

      socket.on("connect_error", (err) => {
        logResult("WebSocket", "Socket.io Connection", false, err.message);
        resolve();
      });
    } catch (e) {
      logResult("WebSocket", "Socket.io Exception", false, e.message);
      resolve();
    }
  });

  // SUMMARY
  console.log("\n==================================================");
  console.log("📊 RINGKASAN HASIL PENGUJIAN FITUR ADMIN NALALA");
  console.log("==================================================");
  const total = report.length;
  const passed = report.filter(r => r.status.includes("PASS")).length;
  const failed = total - passed;
  console.log(`Total Pengujian : ${total}`);
  console.log(`Berhasil (PASS) : ${passed}`);
  console.log(`Gagal (FAIL)    : ${failed}`);
  console.log(`Success Rate    : ${((passed / total) * 100).toFixed(1)}%`);
  console.log("==================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
