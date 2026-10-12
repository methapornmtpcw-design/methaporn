// หน้าสรุปยอด: การ์ดตัวเลข และกราฟแท่งร้านที่ยอดสูงสุด

const STATUSES = ["รอส่ง", "ส่งแล้ว", "ชำระแล้ว"];
const TOP_SHOPS = 5;

function sumTotal(orders) {
  return orders.reduce((sum, order) => sum + orderTotal(order), 0);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function renderCards(orders) {
  const unpaid = orders.filter((o) => o.status !== "ชำระแล้ว");
  const overdue = orders.filter(isOverdue);

  setText("total-sales", formatBaht(sumTotal(orders)));
  setText("total-sales-sub", "จากคำสั่งซื้อทั้งหมด " + orders.length + " รายการ");

  setText("total-unpaid", formatBaht(sumTotal(unpaid)));
  setText(
    "total-unpaid-sub",
    "ยังไม่ชำระ " + unpaid.length + " รายการ ในจำนวนนี้ค้างเกิน " + OVERDUE_DAYS + " วัน " +
      overdue.length + " รายการ รวม " + formatBaht(sumTotal(overdue))
  );

  STATUSES.forEach((status, index) => {
    const matched = orders.filter((o) => o.status === status);
    setText("status-count-" + index, matched.length + " รายการ");
    setText("status-sum-" + index, "รวม " + formatBaht(sumTotal(matched)));
  });
}

function renderTopShops(orders) {
  const totals = {};
  for (const order of orders) {
    totals[order.shop] = (totals[order.shop] || 0) + orderTotal(order);
  }

  const ranked = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SHOPS);

  const chart = document.getElementById("shop-chart");
  chart.textContent = "";

  if (ranked.length === 0) {
    chart.textContent = "ยังไม่มีคำสั่งซื้อ";
    return;
  }

  const highest = ranked[0][1];

  ranked.forEach(([shop, total], index) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = index + 1 + ". " + shop;

    const track = document.createElement("div");
    track.className = "bar-track";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = (total / highest) * 100 + "%";
    track.appendChild(bar);

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent = formatBaht(total);

    row.append(label, track, value);
    chart.appendChild(row);
  });
}

async function renderSummary() {
  const orders = await getOrders();
  renderCards(orders);
  renderTopShops(orders);
}

renderSummary();
