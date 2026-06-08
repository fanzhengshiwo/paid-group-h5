const plans = {
  monthly: { name: "月度会员", price: 199, code: "GROUP-8392" },
  quarterly: { name: "季度会员", price: 499, code: "GROUP-5618" },
  annual: { name: "年度会员", price: 1599, code: "GROUP-2026" },
};

let selectedPlan = "monthly";
let toastTimer;

const totalPrice = document.querySelector("#totalPrice");
const orderTitle = document.querySelector("#orderTitle");
const orderNo = document.querySelector("#orderNo");
const verifyOrderNo = document.querySelector("#verifyOrderNo");
const inlinePayHint = document.querySelector("#inlinePayHint");
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
  inlinePayHint.textContent = `请付 ¥${plan.price}`;

  document.querySelectorAll(".plan-card").forEach((card) => {
    const active = card.dataset.plan === planKey;
    card.classList.toggle("active", active);
    card.setAttribute("aria-checked", String(active));
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
  if (typeof paymentDialog.showModal === "function") {
    paymentDialog.showModal();
  }
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
