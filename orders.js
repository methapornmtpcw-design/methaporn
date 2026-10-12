// หน้ารายการคำสั่งซื้อ: นำข้อมูลมาแสดงเป็นตาราง และกดเปลี่ยนสถานะได้

const STATUS_CLASS = {
  "รอส่ง": "badge-waiting",
  "ส่งแล้ว": "badge-shipped",
  "ชำระแล้ว": "badge-paid"
};

// สถานะถัดไปของแต่ละสถานะ และข้อความบนปุ่ม (ชำระแล้วคือขั้นสุดท้าย ไม่มีปุ่ม)
const NEXT_STEP = {
  "รอส่ง": { status: "ส่งแล้ว", label: "เปลี่ยนเป็น ส่งแล้ว" },
  "ส่งแล้ว": { status: "ชำระแล้ว", label: "เปลี่ยนเป็น ชำระแล้ว" }
};

function addCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
  return cell;
}

async function changeStatus(order, nextStatus) {
  const message = document.getElementById("orders-message");
  try {
    await updateOrderStatus(order.id, nextStatus);
    message.textContent = "";
  } catch (e) {
    message.textContent = "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
  }
  renderOrders();
}

// ตัวกรองที่ผู้ใช้เลือกอยู่
let searchText = "";
let statusFilter = "";

function matchesFilter(order) {
  if (statusFilter && order.status !== statusFilter) {
    return false;
  }
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) {
    return true;
  }
  return order.shop.toLowerCase().includes(keyword) || order.book.toLowerCase().includes(keyword);
}

async function renderOrders() {
  const allOrders = await getOrders();
  const orders = allOrders.filter(matchesFilter);
  // รายการใหม่สุดอยู่บน
  orders.sort((a, b) => b.orderDate.localeCompare(a.orderDate) || b.id.localeCompare(a.id));

  const body = document.getElementById("orders-body");
  body.textContent = "";
  let overdueCount = 0;

  if (orders.length === 0) {
    const row = document.createElement("tr");
    const cell = addCell(row, "ไม่พบรายการที่ตรงกับการค้นหา", "empty-row");
    cell.colSpan = 8;
    body.appendChild(row);
  }

  for (const order of orders) {
    const row = document.createElement("tr");
    const overdue = isOverdue(order);
    if (overdue) {
      row.className = "overdue";
      overdueCount += 1;
    }

    addCell(row, order.id, "nowrap");
    addCell(row, order.shop);
    addCell(row, order.book);
    addCell(row, order.qty.toLocaleString("th-TH"), "num");
    addCell(row, formatBaht(orderTotal(order)), "num");

    const dateCell = addCell(row, formatThaiDate(order.orderDate), "nowrap");
    if (overdue) {
      const note = document.createElement("div");
      note.className = "overdue-note";
      note.textContent = "ค้างชำระ " + daysSinceOrder(order) + " วัน";
      dateCell.appendChild(note);
    }

    const statusCell = addCell(row, "");
    const badge = document.createElement("span");
    badge.className = "badge " + (STATUS_CLASS[order.status] || "");
    badge.textContent = order.status;
    statusCell.appendChild(badge);

    const actionCell = addCell(row, "");
    const next = NEXT_STEP[order.status];
    if (next) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-small";
      button.textContent = next.label;
      button.addEventListener("click", () => changeStatus(order, next.status));
      actionCell.appendChild(button);
    } else {
      actionCell.textContent = "-";
      actionCell.className = "muted";
    }

    body.appendChild(row);
  }

  let countText = "ทั้งหมด " + orders.length + " รายการ";
  if (orders.length !== allOrders.length) {
    countText = "แสดง " + orders.length + " จากทั้งหมด " + allOrders.length + " รายการ";
  }
  if (overdueCount > 0) {
    countText += " (ค้างชำระเกิน " + OVERDUE_DAYS + " วัน " + overdueCount + " รายการ แสดงเป็นแถวสีแดง)";
  }
  document.getElementById("orders-count").textContent = countText;
}

document.getElementById("search").addEventListener("input", (event) => {
  searchText = event.target.value;
  renderOrders();
});

const filterButtons = document.querySelectorAll(".filter-btn");
for (const button of filterButtons) {
  button.addEventListener("click", () => {
    statusFilter = button.dataset.status;
    for (const other of filterButtons) {
      other.classList.toggle("active", other === button);
    }
    renderOrders();
  });
}

renderOrders();
