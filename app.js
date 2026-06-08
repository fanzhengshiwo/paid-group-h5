const plans = {
  monthly: { name: "月度会员", price: 199, code: "GROUP-8392" },
  quarterly: { name: "季度会员", price: 499, code: "GROUP-5618" },
  annual: { name: "年度会员", price: 1599, code: "GROUP-2026" },
};

let selectedPlan = "monthly";
let selectedMethod = "wechat";
let toastTimer;

const totalPrice = document.querySelector("#totalPrice");
const orderTitle = document.querySelector("#orderTitle");
const orderNo = document.querySelector("#orderNo");
const verifyOrderNo = document.querySelector("#verifyOrderNo");
const merchantCodeTitle = document.querySelector("#merchantCodeTitle");
const phoneInput = document.querySelector("#phoneInput");
const wechatInput = document.querySelector("#wechatInput");
const paymentDialog = document.querySelector("#paymentDialog");
const successDialog = document.querySelector("#successDialog");
const toast = document.querySelector("#toast");
const payStep = document.querySelector("#payStep");
const joinStep = document.querySelector("#joinStep");

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setPlan(planKey) {
  selectedPlan = planKey;
  const plan = plans[planKey];
  totalPrice.textContent = `¥${plan.price}`;
  orderTitle.textContent = plan.name;

  document.querySelectorAll(".plan-card").forEach((card) => {
    const active = card.dataset.plan === planKey;
    card.classList.toggle("active", active);
    card.setAttribute("aria-checked", String(active));
  });
}

function setMethod(method) {
  selectedMethod = method;
  merchantCodeTitle.textContent = method === "wechat" ? "微信商家码占位符" : "支付宝商家码占位符";
  document.querySelectorAll(".method").forEach((button) => {
    const active = button.dataset.method === method;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function createOrderNo() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
  return `PG${stamp}${Math.floor(1000 + Math.random() * 9000)}`;
}

function openPayment() {
  const phone = phoneInput.value.trim();
  const wechat = wechatInput.value.trim();

  if (!isValidPhone(phone)) {
    showToast("请输入正确的手机号");
    phoneInput.focus();
    return;
  }

  if (wechat.length < 3) {
    showToast("请输入微信号，方便核验");
    wechatInput.focus();
    return;
  }

  orderNo.textContent = createOrderNo();
  verifyOrderNo.textContent = orderNo.textContent;
  drawMerchantCode();
  if (typeof paymentDialog.showModal === "function") {
    paymentDialog.showModal();
  }
}

function drawMerchantCode() {
  const canvas = document.querySelector("#merchantCodeCanvas");
  const ctx = canvas.getContext("2d");
  const cells = 31;
  const size = canvas.width / cells;
  const seed = `${orderNo.textContent}-${selectedPlan}-${selectedMethod}-merchant-placeholder`;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function finder(x, y) {
    ctx.fillStyle = "#14211a";
    ctx.fillRect(x * size, y * size, size * 7, size * 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect((x + 1) * size, (y + 1) * size, size * 5, size * 5);
    ctx.fillStyle = "#14211a";
    ctx.fillRect((x + 2) * size, (y + 2) * size, size * 3, size * 3);
  }

  finder(1, 1);
  finder(23, 1);
  finder(1, 23);

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const inFinder =
        (x >= 1 && x < 8 && y >= 1 && y < 8) ||
        (x >= 23 && x < 30 && y >= 1 && y < 8) ||
        (x >= 1 && x < 8 && y >= 23 && y < 30);
      if (inFinder) continue;

      const charCode = seed.charCodeAt((x * 7 + y * 11) % seed.length);
      if ((charCode + x * 3 + y * 5) % 4 === 0) {
        ctx.fillStyle = (x + y) % 5 === 0 ? "#126a46" : "#14211a";
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }

  ctx.fillStyle = "#fff";
  ctx.fillRect(76, 98, 68, 24);
  ctx.fillStyle = selectedMethod === "wechat" ? "#126a46" : "#2377c8";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(selectedMethod === "wechat" ? "微信收款" : "支付宝收款", 110, 115);
}

function submitPaidInfo() {
  paymentDialog.close();
  payStep.classList.add("done");
  joinStep.classList.add("done");
  successDialog.showModal();
}

document.querySelectorAll(".plan-card").forEach((card) => {
  card.addEventListener("click", () => setPlan(card.dataset.plan));
});

document.querySelectorAll(".method").forEach((button) => {
  button.addEventListener("click", () => setMethod(button.dataset.method));
});

document.querySelector("#payButton").addEventListener("click", openPayment);
document.querySelector("#paidButton").addEventListener("click", submitPaidInfo);
document.querySelector("#closePayment").addEventListener("click", () => paymentDialog.close());
document.querySelector("#copyButton").addEventListener("click", async () => {
  const text = verifyOrderNo.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast("订单号已复制");
  } catch {
    showToast(`订单号：${text}`);
  }
});

setPlan(selectedPlan);
setMethod(selectedMethod);
drawMerchantCode();
