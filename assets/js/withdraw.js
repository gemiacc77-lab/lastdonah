document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      ".psp-hero-text",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    );
    gsap.to(".login-card", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  } else {
    const card = document.querySelector(".login-card");
    const text = document.querySelector(".psp-hero-text");
    if (card) {
      card.style.opacity = "1";
      card.style.transform = "none";
    }
    if (text) {
      text.style.opacity = "1";
      text.style.transform = "none";
    }
  }

  const els = {
    pid: document.getElementById("w_pid"),
    ppass: document.getElementById("w_ppass"),
    verifyBtn: document.getElementById("verifyBtn"),
    authError: document.getElementById("authError"),
    step1: document.getElementById("step1-auth"),
    step2: document.getElementById("step2-withdraw"),
    step3: document.getElementById("step3-success"),
    availableBalanceDisplay: document.getElementById("availableBalance"),
    emailInput: document.getElementById("w_email"),
    amountInput: document.getElementById("w_amount"),
    methodSelect: document.getElementById("w_method"),
    networkWrapper: document.getElementById("networkWrapper"),
    networkSelect: document.getElementById("w_network"),
    addressInput: document.getElementById("w_address"),
    submitBtn: document.getElementById("submitWithdrawBtn"),
    withdrawError: document.getElementById("withdrawError"),
    addressIcon: document.getElementById("addressIcon"),
  };

  const toggleWPass = document.getElementById("toggleWPass");
  if (toggleWPass && els.ppass) {
    toggleWPass.addEventListener("click", function () {
      const isPassword = els.ppass.getAttribute("type") === "password";
      els.ppass.setAttribute("type", isPassword ? "text" : "password");
      this.classList.remove("fa-eye", "fa-eye-slash");
      this.classList.add(isPassword ? "fa-eye" : "fa-eye-slash");
    });
  }

  let maxAvailableBalance = 0;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("pid")) {
    els.pid.value = urlParams.get("pid");
  }

  function updateSmartInfo() {
    const box = document.getElementById("smartInfoBox");
    const estTime = document.getElementById("estTime");
    const estFee = document.getElementById("estFee");
    const method = els.methodSelect.value;
    const network = els.networkSelect.value;
    if (!method) {
      if (box) box.style.display = "none";
      return;
    }
    if (box) {
      box.style.display = "block";
      if (typeof gsap !== "undefined" && box.style.opacity === "") {
        gsap.fromTo(box, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
      }
    }
    const feeLabel = document.getElementById("feeLabel") || document.querySelector(".info-row span");
    if (method === "PayPal") {
      els.networkWrapper.style.display = "none";
      els.networkSelect.value = "";
      if (estTime) estTime.textContent = "24 - 48 Hours (Invoice Request)";
      if (estFee) estFee.textContent = "Standard PayPal Fees Apply";
      if (feeLabel) feeLabel.innerHTML = '<i class="fas fa-percentage"></i> Fees:';
    } else if (method === "Crypto") {
      els.networkWrapper.style.display = "block";
      if (estTime) estTime.textContent = "1 - 2 Hours";
      if (feeLabel) feeLabel.innerHTML = '<i class="fas fa-percentage"></i> Network Fee:';
      if (network.includes("TRC20") || network.includes("BEP20") || network.includes("POLYGON") || network.includes("SOL") || network === "TRX_NATIVE" || network === "LTC_NATIVE") {
        if (estFee) estFee.textContent = "~$1.00 USD";
      } else if (network.includes("ERC20") || network === "ETH_NATIVE") {
        if (estFee) estFee.textContent = "~$5.00 - $15.00 USD";
      } else if (network.includes("BTC")) {
        if (estFee) estFee.textContent = "~$3.00 - $8.00 USD";
      } else {
        if (estFee) estFee.textContent = "Select Network";
      }
    }
    updateAddressIcon();
  }

  function updateAddressIcon() {
    const method = els.methodSelect.value;
    const icon = els.addressIcon;
    const addressInput = els.addressInput;

    if (method === "PayPal") {
      icon.className = "fas fa-file-invoice-dollar";
      addressInput.placeholder = "PayPal Email (To receive invoice request)";
    } else if (method === "Crypto") {
      icon.className = "fas fa-coins";
      addressInput.placeholder = "USDT Wallet Address";
    } else {
      icon.className = "fas fa-map-marker-alt";
      addressInput.placeholder = "PayPal Email or Wallet Address";
    }
  }

  function addQuickAmountButtons() {
    const amountWrapper = els.amountInput.parentElement;
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "quick-amount-buttons";

    const amounts = [100, 250, 500, 1000];
    amounts.forEach((amt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-amount-btn";
      btn.textContent = `$${amt}`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        els.amountInput.value = amt;
        validateAmount();
      });
      buttonsDiv.appendChild(btn);
    });

    amountWrapper.appendChild(buttonsDiv);
  }

  function validateAmount() {
    const amount = parseFloat(els.amountInput.value);

    if (isNaN(amount) || amount < 100) {
      els.amountInput.classList.add("error");
      return false;
    }

    if (amount > maxAvailableBalance) {
      els.amountInput.classList.add("error");
      return false;
    }

    els.amountInput.classList.remove("error");
    return true;
  }

  function addInputFocusEffects() {
    const inputs = document.querySelectorAll(
      ".input-wrapper input, .input-wrapper select",
    );

    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });

      input.addEventListener("blur", () => {
        input.parentElement.classList.remove("focused");
      });
    });
  }

  function getAddressValidationError(method, network, address) {
    if (method === "PayPal") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return "Invalid PayPal email format.";
      return null;
    } else if (method === "Crypto") {
      if (!address) return "Wallet address cannot be empty.";
      if (network.includes("TRC20") || network === "TRX_NATIVE") {
        if (!/^T[A-Za-z1-9]{33}$/.test(address)) return "Invalid Tron address. It must start with 'T'.";
      } else if (network.includes("ERC20") || network.includes("BEP20") || network.includes("POLYGON") || network === "ETH_NATIVE") {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return "Invalid EVM address. It must start with '0x'.";
      } else if (network === "USDC_SOL") {
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return "Invalid Solana address.";
      } else if (network === "BTC_NATIVE") {
        if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/.test(address)) return "Invalid Bitcoin address.";
      } else if (network === "LTC_NATIVE") {
        if (!/^(ltc1|[LM])[a-zA-HJ-NP-Z0-9]{26,40}$/.test(address)) return "Invalid Litecoin address.";
      }
      return null;
    }
    return "Unknown payout method.";
  }

  function showLoadingState(button, isLoading) {
    const btnText = button.querySelector(".btn-txt");
    const btnIcon = button.querySelector("i:last-child");

    if (isLoading) {
      button.disabled = true;
      btnText.textContent = "Processing...";
      btnIcon.className = "fas fa-spinner fa-spin";
    } else {
      button.disabled = false;
      btnText.textContent =
        button.id === "verifyBtn"
          ? "Verify & Load Balance"
          : "Confirm Withdrawal";
      btnIcon.className =
        button.id === "verifyBtn" ? "fas fa-sync-alt" : "fas fa-check";
    }
  }

  function updateBalanceWithAnimation(newBalance) {
    const balanceEl = els.availableBalanceDisplay;
    const oldValue =
      parseFloat(balanceEl.textContent.replace(/[$,]/g, "")) || 0;

    if (typeof gsap !== "undefined") {
      const obj = { val: oldValue };
      gsap.to(obj, {
        val: newBalance,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          balanceEl.textContent = `$${obj.val.toFixed(2)}`;
        },
        onComplete: () => {
          balanceEl.textContent = `$${newBalance.toFixed(2)}`;
          balanceEl.classList.add("updated");
          setTimeout(() => balanceEl.classList.remove("updated"), 300);
        },
      });
    } else {
      balanceEl.textContent = `$${newBalance.toFixed(2)}`;
    }
  }

  els.methodSelect.addEventListener("change", updateSmartInfo);
  if (els.networkSelect)
    els.networkSelect.addEventListener("change", updateSmartInfo);

  els.verifyBtn.addEventListener("click", () => {
    const id = els.pid.value.trim();
    const pass = els.ppass.value.trim();

    if (!id || !pass) {
      showError(els.authError, "Please enter both Partner ID and Access Key.");
      return;
    }

    showLoadingState(els.verifyBtn, true);
    els.authError.style.display = "none";

    const _a = atob("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4cVgyWmp2MTNHa01JUjNCclBudDBQZTNKUHV6NnkxYUo2YVM1dWlmcnV6ZnJtaGFuNktBRVVsLWxXMkQ2UTd2ZC0vZXhlYw==");
    fetch(_a, {
      method: "POST",
      body: JSON.stringify({
        action: "partner_login",
        partnerId: id,
        password: pass,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          calculateBalanceAndProceed(data.data);
        } else {
          showError(els.authError, "Invalid credentials.");
          showLoadingState(els.verifyBtn, false);
        }
      })
      .catch((err) => {
        showError(
          els.authError,
          "Connection failed. Please check your internet.",
        );
        showLoadingState(els.verifyBtn, false);
      });
  });

  function calculateBalanceAndProceed(data) {
    maxAvailableBalance =
      (parseFloat(data.commission) || 0) - (parseFloat(data.withdrawn) || 0);

    if (maxAvailableBalance < 100) {
      showError(
        els.authError,
        `Your available balance is $${maxAvailableBalance.toFixed(2)}. Minimum withdrawal is $100.`,
      );
      showLoadingState(els.verifyBtn, false);
      return;
    }

    updateBalanceWithAnimation(maxAvailableBalance);

    addQuickAmountButtons();
    addInputFocusEffects();

    if (typeof gsap !== "undefined") {
      gsap.to(els.step1, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          els.step1.style.display = "none";
          els.step2.style.display = "block";
          gsap.fromTo(
            els.step2,
            { opacity: 0, y: 20, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.2)",
            },
          );
        },
      });
    } else {
      els.step1.style.display = "none";
      els.step2.style.display = "block";
    }
  }

  els.submitBtn.addEventListener("click", async () => {
    const email = els.emailInput.value.trim();
    const amount = parseFloat(els.amountInput.value);
    const method = els.methodSelect.value;
    const network = els.networkSelect.value;
    const address = els.addressInput.value.trim();

    els.withdrawError.style.display = "none";
    els.withdrawError.textContent = "";

    if (!validateAmount()) {
      showError(els.withdrawError, "Please enter a valid amount (min $100).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(els.withdrawError, "Please enter a valid email address.");
      els.emailInput.classList.add("error");
      return;
    }
    els.emailInput.classList.remove("error");

    if (!method) {
      showError(els.withdrawError, "Please select a payout method.");
      return;
    }

    if (method === "Crypto" && !network) {
      showError(els.withdrawError, "Please select a transfer network.");
      return;
    }

    const validationError = getAddressValidationError(method, network, address);
    if (validationError) {
      showError(els.withdrawError, validationError);
      els.addressInput.classList.add("error");
      return;
    }
    els.addressInput.classList.remove("error");

    let finalMethod = method;
    if (method === "Crypto") {
      const selectText = els.networkSelect.options[els.networkSelect.selectedIndex].text;
      finalMethod = selectText;
    }

    showLoadingState(els.submitBtn, true);

    try {
      const _e = atob("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5Y2s3cEJSQ1dlc2VlbjdTa1Y0bnRrZ2pSbVo0SWVwT093V1hxNzVwazNXYkpRbkZyVlZUVi02Rm1Cb3l1bGxuVDQvZXhlYw==");
      const response = await fetch(_e, {
        method: "POST",
        body: JSON.stringify({
          action: "withdraw_request",
          partnerId: els.pid.value.trim(),
          email: email,
          amount: amount,
          method: finalMethod,
          address: address,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      const activeSession = localStorage.getItem("optiline_psp_session");
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        parsed.lastActivity = Date.now();
        if (!parsed.data.withdrawn) parsed.data.withdrawn = 0;
        parsed.data.withdrawn += amount;
        if (!parsed.data.withdrawals) parsed.data.withdrawals = [];
        parsed.data.withdrawals.unshift({
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          amount: amount,
          method: finalMethod,
          status: "Pending",
        });
        localStorage.setItem("optiline_psp_session", JSON.stringify(parsed));
      }

      if (typeof gsap !== "undefined") {
        const loginCard = document.querySelector(".login-card");
        const cardTop =
          loginCard.getBoundingClientRect().top + window.scrollY - 100;

        gsap.to(els.step2, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          onComplete: () => {
            els.step2.style.display = "none";
            els.step3.style.display = "block";

            gsap.fromTo(
              els.step3,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            );

            gsap.to(window, {
              duration: 0.8,
              scrollTo: { y: cardTop, autoKill: true },
              ease: "power2.inOut",
            });
          },
        });
      } else {
        els.step2.style.display = "none";
        els.step3.style.display = "block";

        const loginCard = document.querySelector(".login-card");
        if (loginCard) {
          setTimeout(() => {
            loginCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      }
    } catch (err) {
      showError(els.withdrawError, "Network error. Please try again later.");
      showLoadingState(els.submitBtn, false);
    }
  });

  function showError(element, msg) {
    element.textContent = msg;
    element.style.display = "block";
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        element,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
      );
    }
  }

  [els.pid, els.ppass].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.verifyBtn.click();
        }
      });
    }
  });

  els.amountInput.addEventListener("input", validateAmount);
  els.amountInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      els.submitBtn.click();
    }
  });

  [els.emailInput, els.addressInput].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.submitBtn.click();
        }
      });
    }
  });
});
