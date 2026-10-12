// หน้าเพิ่มคำสั่งซื้อ: แบบฟอร์ม คิดยอดเงินอัตโนมัติ ตรวจว่ากรอกครบ แล้วบันทึก

const form = document.getElementById("order-form");
const shopSelect = document.getElementById("shop");
const bookSelect = document.getElementById("book");
const qtyInput = document.getElementById("qty");
const dateInput = document.getElementById("orderDate");
const priceText = document.getElementById("price-text");
const totalText = document.getElementById("total-text");
const dateHint = document.getElementById("date-hint");
const formError = document.getElementById("form-error");

let books = [];

function addOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

// วันนี้ตามเวลาของเครื่อง ในรูปแบบ 2026-10-12
function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function selectedBook() {
  return books.find((b) => b.title === bookSelect.value);
}

// จำนวนต้องเป็นเลขจำนวนเต็มตั้งแต่ 1 ขึ้นไป ถ้าไม่ใช่คืนค่า null
function readQty() {
  const text = qtyInput.value.trim();
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const qty = Number(text);
  return qty >= 1 ? qty : null;
}

function updateTotal() {
  const book = selectedBook();
  const qty = readQty();
  priceText.textContent = book ? formatBaht(book.price) : "-";
  totalText.textContent = book && qty ? formatBaht(book.price * qty) : "-";
}

function updateDateHint() {
  dateHint.textContent = dateInput.value ? "ตรงกับวันที่ " + formatThaiDate(dateInput.value) : "";
}

function setError(input, message) {
  const field = input.closest(".field");
  field.classList.toggle("has-error", Boolean(message));
  field.querySelector(".error-text").textContent = message;
}

// ตรวจทุกช่อง คืนค่า true เมื่อกรอกครบและถูกต้อง
function validate() {
  const problems = [
    [shopSelect, shopSelect.value ? "" : "กรุณาเลือกร้าน"],
    [bookSelect, bookSelect.value ? "" : "กรุณาเลือกหนังสือ"],
    [qtyInput, qtyInput.value.trim() === "" ? "กรุณาใส่จำนวน" : readQty() ? "" : "จำนวนต้องเป็นตัวเลขจำนวนเต็มตั้งแต่ 1 ขึ้นไป"],
    [dateInput, dateInput.value ? "" : "กรุณาเลือกวันที่สั่ง"]
  ];

  let firstBad = null;
  for (const [input, message] of problems) {
    setError(input, message);
    if (message && !firstBad) {
      firstBad = input;
    }
  }

  formError.textContent = firstBad ? "ยังกรอกข้อมูลไม่ครบ กรุณาตรวจช่องที่มีข้อความสีแดง" : "";
  if (firstBad) {
    firstBad.focus();
  }
  return !firstBad;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validate()) {
    return;
  }

  try {
    await addOrder({
      shop: shopSelect.value,
      book: bookSelect.value,
      qty: readQty(),
      price: selectedBook().price,
      orderDate: dateInput.value
    });
    window.location.href = "index.html";
  } catch (e) {
    formError.textContent = "บันทึกไม่สำเร็จ เบราว์เซอร์นี้ไม่อนุญาตให้เก็บข้อมูล กรุณาลองเปิดด้วยเบราว์เซอร์อื่น";
  }
});

bookSelect.addEventListener("change", updateTotal);
qtyInput.addEventListener("input", updateTotal);
dateInput.addEventListener("change", updateDateHint);

async function setupForm() {
  const shops = await getShops();
  books = await getBooks();

  for (const shop of shops) {
    addOption(shopSelect, shop, shop);
  }
  for (const book of books) {
    addOption(bookSelect, book.title, book.title);
  }

  dateInput.value = todayIso();
  updateDateHint();
  updateTotal();
}

setupForm();
