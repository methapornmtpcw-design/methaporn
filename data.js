// ส่วนเก็บข้อมูลของระบบ ทุกหน้าเรียกข้อมูลผ่านไฟล์นี้ไฟล์เดียว
// รอบแรกเก็บในเบราว์เซอร์ของเครื่อง ช่วงบ่ายเปลี่ยนไปใช้ Supabase โดยแก้เฉพาะไฟล์นี้

const STORAGE_KEY = "amata-orders";

// ข้อมูลสมมติทั้งหมด ไม่ใช่ร้านหรือหนังสือจริง
const SAMPLE_ORDERS = [
  { id: "PO-2569-001", shop: "ร้านหนังสือใบไม้ผลิ", book: "ทางกลับบ้านของสายลม", qty: 40, price: 250, orderDate: "2026-08-14", status: "ชำระแล้ว" },
  { id: "PO-2569-002", shop: "ร้านอักษรริมคลอง", book: "บันทึกคนปลูกดาว", qty: 25, price: 320, orderDate: "2026-08-19", status: "ส่งแล้ว" },
  { id: "PO-2569-003", shop: "ร้านนกฮูกยามบ่าย", book: "ตำรับขนมจากครัวยายเมฆ", qty: 30, price: 295, orderDate: "2026-08-26", status: "ส่งแล้ว" },
  { id: "PO-2569-004", shop: "ร้านสมุดจันทร์เสี้ยว", book: "คู่มือเลี้ยงแมวฉบับคนขี้ลืม", qty: 50, price: 189, orderDate: "2026-09-02", status: "ชำระแล้ว" },
  { id: "PO-2569-005", shop: "ร้านหนังสือใบไม้ผลิ", book: "เมืองเล็กในหมอก", qty: 20, price: 350, orderDate: "2026-09-08", status: "รอส่ง" },
  { id: "PO-2569-006", shop: "ร้านบ้านตัวอักษรสีคราม", book: "ทางกลับบ้านของสายลม", qty: 60, price: 250, orderDate: "2026-09-15", status: "ชำระแล้ว" },
  { id: "PO-2569-007", shop: "ร้านชั้นหนังสือปลายซอย", book: "ประวัติศาสตร์ฉบับกระเป๋าเสื้อ", qty: 15, price: 450, orderDate: "2026-09-22", status: "ส่งแล้ว" },
  { id: "PO-2569-008", shop: "ร้านอักษรริมคลอง", book: "เมืองเล็กในหมอก", qty: 35, price: 350, orderDate: "2026-09-29", status: "ชำระแล้ว" },
  { id: "PO-2569-009", shop: "ร้านนกฮูกยามบ่าย", book: "บันทึกคนปลูกดาว", qty: 45, price: 320, orderDate: "2026-10-05", status: "รอส่ง" },
  { id: "PO-2569-010", shop: "ร้านสมุดจันทร์เสี้ยว", book: "ตำรับขนมจากครัวยายเมฆ", qty: 28, price: 295, orderDate: "2026-10-09", status: "รอส่ง" }
];

// รายชื่อร้านและหนังสือให้เลือกในหน้าเพิ่มคำสั่งซื้อ (ข้อมูลสมมติ) ราคาเป็นราคาต่อเล่ม
const SHOPS = [
  "ร้านชั้นหนังสือปลายซอย",
  "ร้านนกฮูกยามบ่าย",
  "ร้านบ้านตัวอักษรสีคราม",
  "ร้านสมุดจันทร์เสี้ยว",
  "ร้านหนังสือใบไม้ผลิ",
  "ร้านอักษรริมคลอง"
];

const BOOKS = [
  { title: "คู่มือเลี้ยงแมวฉบับคนขี้ลืม", price: 189 },
  { title: "ตำรับขนมจากครัวยายเมฆ", price: 295 },
  { title: "ทางกลับบ้านของสายลม", price: 250 },
  { title: "บันทึกคนปลูกดาว", price: 320 },
  { title: "ประวัติศาสตร์ฉบับกระเป๋าเสื้อ", price: 450 },
  { title: "เมืองเล็กในหมอก", price: 350 }
];

async function getShops() {
  return SHOPS.slice();
}

async function getBooks() {
  return BOOKS.slice();
}

// บันทึกคำสั่งซื้อใหม่ ระบบออกเลขที่ให้เอง แล้วคืนรายการที่บันทึกกลับไป
async function addOrder(newOrder) {
  const orders = await getOrders();
  const lastNumber = orders.reduce((max, o) => Math.max(max, Number(o.id.split("-")[2]) || 0), 0);
  const buddhistYear = Number(newOrder.orderDate.slice(0, 4)) + 543;
  const order = {
    id: "PO-" + buddhistYear + "-" + String(lastNumber + 1).padStart(3, "0"),
    shop: newOrder.shop,
    book: newOrder.book,
    qty: newOrder.qty,
    price: newOrder.price,
    orderDate: newOrder.orderDate,
    status: "รอส่ง"
  };
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return order;
}

// เปลี่ยนสถานะของคำสั่งซื้อตามเลขที่
async function updateOrderStatus(id, status) {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    throw new Error("ไม่พบคำสั่งซื้อ " + id);
  }
  order.status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return order;
}

// อ่านคำสั่งซื้อทั้งหมด ถ้ายังไม่เคยมีข้อมูลในเครื่อง ให้เริ่มจากข้อมูลตัวอย่าง
async function getOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
  } catch (e) {
    // เบราว์เซอร์บางโหมดไม่ให้เก็บข้อมูล ให้แสดงข้อมูลตัวอย่างแทน
  }
  return SAMPLE_ORDERS.slice();
}

// ตัวช่วยแสดงผล ใช้ร่วมกันทุกหน้า

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// "2026-08-14" -> "14 ส.ค. 2569"
function formatThaiDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return day + " " + THAI_MONTHS[month - 1] + " " + (year + 543);
}

// 10000 -> "฿10,000.00"
function formatBaht(amount) {
  return "฿" + amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function orderTotal(order) {
  return order.qty * order.price;
}

const OVERDUE_DAYS = 30;

// นับจำนวนวันจากวันที่สั่งถึงวันนี้
function daysSinceOrder(order) {
  const [year, month, day] = order.orderDate.split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - Date.UTC(year, month - 1, day)) / 86400000);
}

// ค้างชำระ คือ ยังไม่ชำระ และสั่งมาเกิน 30 วัน
function isOverdue(order) {
  return order.status !== "ชำระแล้ว" && daysSinceOrder(order) > OVERDUE_DAYS;
}
