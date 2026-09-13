document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRODUCTS === "undefined") return;

  const productGrid = document.getElementById("products-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (productGrid) {
    const searchInput = document.getElementById("catalog-search");
    const searchClear = document.getElementById("catalog-search-clear");
    const countEl = document.getElementById("catalog-count");

    let currentCategory = "all";
    let searchQuery = "";

    const renderProducts = () => {
      const q = searchQuery.trim().toLowerCase();
      const filtered = PRODUCTS.filter(p => {
        const matchesCat = currentCategory === "all" || (p.categories && p.categories.includes(currentCategory));
        if (!matchesCat) return false;
        if (!q) return true;
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const descMatch = (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
        const catMatch = p.category && p.category.toLowerCase().includes(q);
        const occasionMatch = p.occasion && p.occasion.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch || occasionMatch;
      });

      if (countEl) {
        countEl.textContent = filtered.length;
      }

      if (filtered.length === 0) {
        productGrid.innerHTML = `
          <div class="no-products-msg" style="grid-column:1/-1;text-align:center;padding:3rem 1.5rem;">
            <p style="font-size:1.125rem;color:var(--color-muted);margin-bottom:1.5rem;">No handcrafted flowers match "${searchQuery || currentCategory}".</p>
            <button class="btn btn-secondary" id="reset-catalog-filters">Clear Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById("reset-catalog-filters");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            currentCategory = "all";
            searchQuery = "";
            if (searchInput) searchInput.value = "";
            if (searchClear) searchClear.style.display = "none";
            filterBtns.forEach(b => {
              if (b.getAttribute("data-category") === "all") {
                b.classList.add("active");
              } else {
                b.classList.remove("active");
              }
            });
            window.history.replaceState(null, "", window.location.pathname);
            renderProducts();
          });
        }
        return;
      }

      const wishlist = typeof window.getWishlist === "function" ? window.getWishlist() : [];

      productGrid.innerHTML = filtered.map(p => {
        const isSaved = wishlist.some(item => item.id === p.id);
        return `
        <article class="product-card">
          <div class="product-card-img">
            <button type="button" class="product-wishlist-toggle ${isSaved ? "active" : ""}" data-id="${p.id}" aria-label="${isSaved ? "Remove from wishlist" : "Add to wishlist"}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <a href="product.html?product=${encodeURIComponent(p.slug)}" aria-label="View details for ${p.name}">
              <img src="${p.image}" alt="${p.name} - Handmade Flower Arrangement by Namomót-an" loading="lazy">
            </a>
            ${p.signature ? '<span class="badge badge-signature">Signature</span>' : ''}
            ${p.isSample ? '<span class="badge badge-sample" style="top:auto;bottom:0.75rem;right:0.75rem;left:auto;">Sample</span>' : ''}
            <span class="product-card-price">${p.priceDisplay || "₱350"}</span>
          </div>
          <div class="product-card-body">
            <div class="product-card-meta-row">
              <span class="product-card-cat">${p.category.replace("-", " ")}</span>
              <span class="product-card-avail">${p.availability}</span>
            </div>
            <h3 class="product-card-title">
              <a href="product.html?product=${encodeURIComponent(p.slug)}">${p.name}</a>
            </h3>
            <p class="product-card-desc">${p.shortDescription}</p>
            <div class="product-card-actions">
              <a href="product.html?product=${encodeURIComponent(p.slug)}" class="btn btn-secondary btn--sm">View Details</a>
              <button type="button" class="btn btn-primary btn--sm quick-inquire-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.priceDisplay || "₱350"}" data-image="${p.image}">Inquire</button>
            </div>
          </div>
        </article>
      `}).join("");

      productGrid.querySelectorAll(".product-wishlist-toggle").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pid = parseInt(btn.getAttribute("data-id"), 10);
          const p = PRODUCTS.find(item => item.id === pid);
          if (p && typeof window.toggleWishlist === "function") {
            window.toggleWishlist(p);
          }
        });
      });

      productGrid.querySelectorAll(".quick-inquire-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const itemName = btn.getAttribute("data-name");
          const itemPrice = btn.getAttribute("data-price");
          triggerOrderModal(itemName, itemPrice);
        });
      });
    };

    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get("category") || "all";

    filterBtns.forEach(btn => {
      const cat = btn.getAttribute("data-category");
      if (cat === currentCategory) {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = cat;
        renderProducts();
        const newUrl = cat === "all" ? window.location.pathname : `${window.location.pathname}?category=${cat}`;
        window.history.replaceState(null, "", newUrl);
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = searchQuery ? "inline-flex" : "none";
        }
        renderProducts();
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        searchClear.style.display = "none";
        renderProducts();
        if (searchInput) searchInput.focus();
      });
    }

    const customDropdowns = document.querySelectorAll(".custom-dropdown-wrap");
    customDropdowns.forEach(dropdown => {
      const btn = dropdown.querySelector(".custom-dropdown-btn");
      const menu = dropdown.querySelector(".custom-dropdown-menu");
      const valDisplay = dropdown.querySelector(".custom-dropdown-val");
      const hiddenInput = dropdown.querySelector("input[type='hidden']");
      const items = dropdown.querySelectorAll(".custom-dropdown-item");

      if (btn && menu) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = dropdown.classList.contains("open");
          customDropdowns.forEach(d => {
            if (d !== dropdown) d.classList.remove("open");
          });
          dropdown.classList.toggle("open", !isOpen);
          btn.setAttribute("aria-expanded", (!isOpen).toString());
        });

        items.forEach(item => {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            items.forEach(it => it.classList.remove("active"));
            item.classList.add("active");
            const text = item.textContent.trim();
            const val = item.getAttribute("data-value");
            if (valDisplay) valDisplay.textContent = text;
            if (hiddenInput) hiddenInput.value = val;
            dropdown.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
          });
        });
      }
    });

    document.addEventListener("click", () => {
      customDropdowns.forEach(d => {
        d.classList.remove("open");
        const b = d.querySelector(".custom-dropdown-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });

    const matcherRecipient = document.getElementById("matcher-recipient");
    const matcherOccasion = document.getElementById("matcher-occasion");
    const matcherFilterBtn = document.getElementById("matcher-filter-btn");
    const matcherResetBtn = document.getElementById("matcher-reset-btn");

    if (matcherFilterBtn && matcherRecipient && matcherOccasion) {
      matcherFilterBtn.addEventListener("click", () => {
        const occ = matcherOccasion.value;
        const rec = matcherRecipient.value;
        let terms = [];
        if (occ !== "any") terms.push(occ);
        if (rec !== "any") terms.push(rec);
        searchQuery = terms.join(" ");
        if (searchInput) searchInput.value = searchQuery;
        if (searchClear) searchClear.style.display = "inline-flex";
        if (matcherResetBtn) matcherResetBtn.style.display = "inline-flex";
        renderProducts();
      });
    }

    if (matcherResetBtn) {
      matcherResetBtn.addEventListener("click", () => {
        if (matcherRecipient) matcherRecipient.value = "any";
        if (matcherOccasion) matcherOccasion.value = "any";
        customDropdowns.forEach(d => {
          const first = d.querySelector(".custom-dropdown-item[data-value='any']");
          const items = d.querySelectorAll(".custom-dropdown-item");
          const valDisplay = d.querySelector(".custom-dropdown-val");
          items.forEach(it => it.classList.remove("active"));
          if (first) {
            first.classList.add("active");
            if (valDisplay) valDisplay.textContent = first.textContent.trim();
          }
        });
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        if (searchClear) searchClear.style.display = "none";
        matcherResetBtn.style.display = "none";
        renderProducts();
      });
    }

    renderProducts();
  }

  const detailWrap = document.getElementById("product-detail-wrap");
  if (detailWrap) {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("product");
    const product = PRODUCTS.find(p => p.slug === slug);

    if (!product) {
      detailWrap.innerHTML = `
        <div class="error-page" style="padding:4rem 1.5rem;text-align:center;">
          <h1 style="font-family:var(--font-heading);font-size:2rem;color:var(--color-charcoal);margin-bottom:1rem;">Sorry, we couldn't find that flower.</h1>
          <p style="color:var(--color-muted);margin-bottom:2rem;">The flower you are looking for may have been updated or does not exist.</p>
          <a href="products.html" class="btn btn-primary">Back to Flowers</a>
        </div>
      `;
      return;
    }

    document.title = `${product.name} | Namomót-an Flowers`;

    const breadcrumbCurrent = document.getElementById("breadcrumb-current");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

    const mainImg = document.getElementById("product-main-image");
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = `${product.name} - Handmade Flower Arrangement by Namomót-an`;
    }

    const thumbsWrap = document.getElementById("product-thumbnails");
    if (thumbsWrap && product.additionalImages && product.additionalImages.length > 1) {
      thumbsWrap.innerHTML = product.additionalImages.map((imgSrc, idx) => `
        <button class="thumb-btn ${idx === 0 ? "active" : ""}" data-img="${imgSrc}" aria-label="View photo ${idx + 1}">
          <img src="${imgSrc}" alt="${product.name} thumbnail ${idx + 1}">
        </button>
      `).join("");

      thumbsWrap.querySelectorAll(".thumb-btn").forEach(thumb => {
        thumb.addEventListener("click", () => {
          thumbsWrap.querySelectorAll(".thumb-btn").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
          if (mainImg) mainImg.src = thumb.getAttribute("data-img");
        });
      });
    }

    const nameEl = document.getElementById("product-name");
    if (nameEl) nameEl.textContent = product.name;

    const catEl = document.getElementById("product-category");
    if (catEl) catEl.textContent = product.category.replace("-", " ");

    const priceEl = document.getElementById("product-price");
    const basePriceNum = parseInt(String(product.priceDisplay || "₱350").replace(/[^0-9]/g, ""), 10) || 350;
    let currentAddonPrice = 0;
    let selectedAddonNames = [];

    const updateProductPriceDisplay = () => {
      const currentTotal = basePriceNum + currentAddonPrice;
      if (priceEl) priceEl.textContent = `₱${currentTotal}`;
      const stickyPrice = document.getElementById("sticky-prod-price");
      if (stickyPrice) stickyPrice.textContent = `₱${currentTotal}`;
    };

    if (priceEl) priceEl.textContent = product.priceDisplay || "₱350";

    const descEl = document.getElementById("product-description");
    if (descEl) descEl.textContent = product.description;

    const specsTable = document.getElementById("product-specs-body");
    if (specsTable) {
      const specs = [
        { label: "Flower Type", val: product.flowerType },
        { label: "Size Options", val: product.size },
        { label: "Available Colors", val: product.color },
        { label: "Wrapping", val: product.wrapping },
        { label: "Availability", val: product.availability },
        { label: "Occasion Suitability", val: product.categories ? product.categories.join(", ") : "" }
      ].filter(s => s.val);

      specsTable.innerHTML = specs.map(s => `
        <div class="spec-row">
          <span class="spec-label">${s.label}</span>
          <span class="spec-value">${s.val}</span>
        </div>
      `).join("");
    }

    const addonGrid = document.getElementById("product-addon-grid");
    if (addonGrid) {
      const addonChips = addonGrid.querySelectorAll(".addon-chip");
      addonChips.forEach(chip => {
        chip.addEventListener("click", () => {
          chip.classList.toggle("active");
          const cost = parseInt(chip.getAttribute("data-price"), 10) || 0;
          const aName = chip.getAttribute("data-name");
          if (chip.classList.contains("active")) {
            currentAddonPrice += cost;
            selectedAddonNames.push(aName);
          } else {
            currentAddonPrice = Math.max(0, currentAddonPrice - cost);
            selectedAddonNames = selectedAddonNames.filter(n => n !== aName);
          }
          updateProductPriceDisplay();
        });
      });
    }

    const addBagBtn = document.getElementById("product-add-bag-btn");
    if (addBagBtn) {
      addBagBtn.addEventListener("click", () => {
        if (typeof window.addToCart === "function") {
          const totalVal = basePriceNum + currentAddonPrice;
          window.addToCart({
            id: product.id + (selectedAddonNames.length ? `-${Date.now()}` : ""),
            name: selectedAddonNames.length ? `${product.name} (Curated)` : product.name,
            price: totalVal,
            image: product.image,
            slug: product.slug,
            addons: [...selectedAddonNames]
          });
        }
      });
    }

    const triggerBtn = document.getElementById("product-order-modal-trigger");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", () => {
        const totalVal = basePriceNum + currentAddonPrice;
        const displayLabel = selectedAddonNames.length ? `${product.name} (+ ${selectedAddonNames.join(", ")})` : product.name;
        triggerOrderModal(displayLabel, `₱${totalVal}`);
      });
    }

    const stickyBar = document.getElementById("mobile-sticky-actionbar");
    const stickyThumb = document.getElementById("sticky-prod-img");
    const stickyTitle = document.getElementById("sticky-prod-title");
    const stickyPrice = document.getElementById("sticky-prod-price");
    const stickyAddBag = document.getElementById("sticky-add-bag-btn");
    const stickyOrder = document.getElementById("sticky-order-btn");

    if (stickyBar) {
      if (stickyThumb) stickyThumb.src = product.image;
      if (stickyTitle) stickyTitle.textContent = product.name;
      if (stickyPrice) stickyPrice.textContent = product.priceDisplay || "₱350";

      if (stickyAddBag) {
        stickyAddBag.addEventListener("click", () => {
          if (typeof window.addToCart === "function") {
            const totalVal = basePriceNum + currentAddonPrice;
            window.addToCart({
              id: product.id + (selectedAddonNames.length ? `-${Date.now()}` : ""),
              name: selectedAddonNames.length ? `${product.name} (Curated)` : product.name,
              price: totalVal,
              image: product.image,
              slug: product.slug,
              addons: [...selectedAddonNames]
            });
          }
        });
      }

      if (stickyOrder) {
        stickyOrder.addEventListener("click", () => {
          const totalVal = basePriceNum + currentAddonPrice;
          const displayLabel = selectedAddonNames.length ? `${product.name} (+ ${selectedAddonNames.join(", ")})` : product.name;
          triggerOrderModal(displayLabel, `₱${totalVal}`);
        });
      }

      window.addEventListener("scroll", () => {
        if (window.innerWidth <= 768) {
          if (window.scrollY > 300) {
            stickyBar.classList.add("visible");
          } else {
            stickyBar.classList.remove("visible");
          }
        }
      }, { passive: true });
    }

    const deliveryDateInput = document.getElementById("delivery-date-input");
    const checkDeliveryBtn = document.getElementById("check-delivery-btn");
    const deliveryStatus = document.getElementById("delivery-checker-status");
    const calendarReminderWrap = document.getElementById("calendar-reminder-wrap");
    const downloadCalendarBtn = document.getElementById("download-calendar-reminder-btn");

    if (deliveryDateInput && checkDeliveryBtn && deliveryStatus) {
      const today = new Date();
      const minDateStr = today.toISOString().split("T")[0];
      deliveryDateInput.min = minDateStr;

      checkDeliveryBtn.addEventListener("click", () => {
        const val = deliveryDateInput.value;
        if (!val) {
          deliveryStatus.className = "delivery-checker-status rush";
          deliveryStatus.style.display = "block";
          deliveryStatus.textContent = "Please select a target delivery date.";
          if (calendarReminderWrap) calendarReminderWrap.style.display = "none";
          return;
        }

        const targetDate = new Date(val + "T00:00:00");
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          deliveryStatus.className = "delivery-checker-status past";
          deliveryStatus.style.display = "block";
          deliveryStatus.textContent = "Please choose a future date.";
          if (calendarReminderWrap) calendarReminderWrap.style.display = "none";
        } else if (diffDays <= 2) {
          deliveryStatus.className = "delivery-checker-status rush";
          deliveryStatus.style.display = "block";
          deliveryStatus.innerHTML = "⚡ <strong>Rush Order:</strong> Delivery is within 48 hours. Please message us immediately on Facebook to confirm workshop slot availability!";
          if (calendarReminderWrap) calendarReminderWrap.style.display = "block";
        } else {
          deliveryStatus.className = "delivery-checker-status available";
          deliveryStatus.style.display = "block";
          deliveryStatus.innerHTML = "🌸 <strong>Available:</strong> Plenty of time for bespoke handcrafting, wrapping, and Sorsogon delivery on " + targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ".";
          if (calendarReminderWrap) calendarReminderWrap.style.display = "block";
        }
      });
    }

    if (downloadCalendarBtn && deliveryDateInput) {
      downloadCalendarBtn.addEventListener("click", () => {
        const rawDate = deliveryDateInput.value;
        if (!rawDate) return;
        const [year, month, day] = rawDate.split("-");
        const icsDateStr = `${year}${month}${day}`;
        const title = `Namomót-an Floral Gift: ${product.name}`;
        const description = `Milestone gift reminder for ${product.name} handcrafted by Namomót-an Atelier in Sorsogon City. Facebook: https://www.facebook.com/profile.php?id=61573737929854`;
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Namomot-an Flowers//Gifting Reminder//EN",
          "BEGIN:VEVENT",
          `UID:namomotan-${Date.now()}@namomotan.com`,
          `DTSTAMP:${icsDateStr}T080000Z`,
          `DTSTART;VALUE=DATE:${icsDateStr}`,
          `SUMMARY:${title}`,
          `DESCRIPTION:${description}`,
          "LOCATION:Talisay, Sorsogon City",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Namomotan-Gift-${rawDate}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof window.showAtelierToast === "function") {
          window.showAtelierToast("📅 Milestone saved to calendar!");
        }
      });
    }

    const fbBtn = document.getElementById("inquire-fb-btn");
    if (fbBtn) {
      fbBtn.href = "https://www.facebook.com/profile.php?id=61573737929854";
    }

    const siteInquireBtn = document.getElementById("inquire-site-btn");
    if (siteInquireBtn) {
      siteInquireBtn.href = "contact.html";
    }

    const relatedGrid = document.getElementById("related-products-grid");
    if (relatedGrid) {
      const related = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
      const displayRelated = related.length > 0 ? related : PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

      relatedGrid.innerHTML = displayRelated.map(p => `
        <article class="product-card">
          <div class="product-card-img">
            <a href="product.html?product=${encodeURIComponent(p.slug)}" aria-label="View ${p.name}">
              <img src="${p.image}" alt="${p.name} by Namomót-an" loading="lazy">
            </a>
            <span class="product-card-price">${p.priceDisplay || "₱350"}</span>
          </div>
          <div class="product-card-body">
            <span class="product-card-cat">${p.category.replace("-", " ")}</span>
            <h3 class="product-card-title">
              <a href="product.html?product=${encodeURIComponent(p.slug)}">${p.name}</a>
            </h3>
          </div>
        </article>
      `).join("");
    }
  }

  const customizerSection = document.getElementById("customizer-section");
  if (customizerSection) {
    let basePrice = 150;
    let addPrice = 0;
    let wrapPrice = 0;
    let selectedStyleName = "Single Stem Keepsake";
    let selectedMaterialName = "Chenille Fuzzy Wire";
    let selectedPaletteName = "Blush & Pastel Pink";
    let selectedWrappingName = "Artisan Kraft Paper";

    const priceDisplay = document.getElementById("customizer-price-display");
    const styleText = document.getElementById("spec-style-text");
    const materialText = document.getElementById("spec-material-text");
    const paletteText = document.getElementById("spec-palette-text");
    const wrappingText = document.getElementById("spec-wrapping-text");
    const customizerOrderBtn = document.getElementById("customizer-order-btn");
    const customizerAddBagBtn = document.getElementById("customizer-add-bag-btn");

    const badgeStyle = document.getElementById("canvas-badge-style");
    const badgeMaterial = document.getElementById("canvas-badge-material");
    const svgPetalCenter = document.getElementById("visualizer-petal-center");
    const svgWrap = document.getElementById("visualizer-svg-wrap");

    const paletteColorMap = {
      "pastel-pink": { center: "#F47BAB", outer: "#F8A5C6" },
      "sage-green": { center: "#9DA324", outer: "#C4D05C" },
      "warm-sunflower": { center: "#F59E0B", outer: "#FCD34D" },
      "royal-lavender": { center: "#9333EA", outer: "#C084FC" }
    };

    const updateCustomizerTotal = () => {
      const total = basePrice + addPrice + wrapPrice;
      if (priceDisplay) priceDisplay.textContent = "₱" + total;
      if (styleText) styleText.textContent = selectedStyleName;
      if (materialText) materialText.textContent = selectedMaterialName;
      if (paletteText) paletteText.textContent = selectedPaletteName;
      if (wrappingText) wrappingText.textContent = selectedWrappingName;

      if (badgeStyle) badgeStyle.textContent = selectedStyleName.split(" ")[0];
      if (badgeMaterial) badgeMaterial.textContent = selectedMaterialName.split(" ")[0];
    };

    customizerSection.querySelectorAll(".customizer-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        const parent = btn.parentElement;
        parent.querySelectorAll(".customizer-opt").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const group = parent.getAttribute("data-group");
        if (group === "style") {
          basePrice = parseInt(btn.getAttribute("data-base"), 10) || 150;
          selectedStyleName = btn.getAttribute("data-name");
          const styleCode = btn.getAttribute("data-style");
          if (svgWrap) {
            if (styleCode === "single") svgWrap.style.transform = "scale(0.85)";
            else if (styleCode === "trio") svgWrap.style.transform = "scale(1)";
            else if (styleCode === "signature") svgWrap.style.transform = "scale(1.15)";
            else if (styleCode === "grand") svgWrap.style.transform = "scale(1.3)";
          }
        } else if (group === "material") {
          addPrice = parseInt(btn.getAttribute("data-add"), 10) || 0;
          selectedMaterialName = btn.getAttribute("data-name");
        } else if (group === "palette") {
          selectedPaletteName = btn.getAttribute("data-name");
          const palCode = btn.getAttribute("data-palette");
          const colors = paletteColorMap[palCode] || { center: "#F47BAB", outer: "#F8A5C6" };
          if (svgPetalCenter) svgPetalCenter.setAttribute("fill", colors.center);
          for (let i = 1; i <= 5; i++) {
            const petalEl = document.getElementById(`visualizer-p${i}`);
            if (petalEl) petalEl.setAttribute("fill", colors.outer);
          }
        } else if (group === "wrapping") {
          wrapPrice = parseInt(btn.getAttribute("data-wrapadd"), 10) || 0;
          selectedWrappingName = btn.getAttribute("data-name");
        }
        updateCustomizerTotal();
      });
    });

    if (customizerAddBagBtn) {
      customizerAddBagBtn.addEventListener("click", () => {
        const total = basePrice + addPrice + wrapPrice;
        if (typeof window.addToCart === "function") {
          window.addToCart({
            id: `custom-${Date.now()}`,
            name: `${selectedStyleName} (Custom)`,
            price: total,
            image: "images/products/fuzzy-flower.jpg",
            slug: "customizer",
            addons: [selectedMaterialName, selectedPaletteName, selectedWrappingName]
          });
        }
      });
    }

    if (customizerOrderBtn) {
      customizerOrderBtn.addEventListener("click", () => {
        const total = basePrice + addPrice + wrapPrice;
        const customItem = `${selectedStyleName} (${selectedMaterialName}, ${selectedPaletteName}, ${selectedWrappingName})`;
        triggerOrderModal(customItem, "₱" + total);
      });
    }

    updateCustomizerTotal();
  }

  const modalBackdrop = document.getElementById("order-modal-backdrop");
  const modalClose = document.getElementById("order-modal-close");
  const modalItem = document.getElementById("order-modal-item");
  const modalPrice = document.getElementById("order-modal-price");
  const modalText = document.getElementById("order-message-text");
  const copyBtn = document.getElementById("copy-order-msg-btn");

  const recipientInput = document.getElementById("order-recipient-name");
  const barangaySelect = document.getElementById("order-barangay");
  const dateInput = document.getElementById("order-target-date");
  const cardMsgInput = document.getElementById("order-card-message");
  const senderInput = document.getElementById("order-sender-name");
  const tmplChips = document.querySelectorAll(".card-tmpl-chip");

  let activeItemLabel = "Handcrafted Flower Arrangement";
  let activePriceLabel = "₱350";

  const refreshOrderDraft = () => {
    const recipient = recipientInput && recipientInput.value.trim() ? recipientInput.value.trim() : "Special Someone";
    const barangay = barangaySelect ? barangaySelect.value : "Talisay, Sorsogon City";
    const dateVal = dateInput && dateInput.value ? dateInput.value : "Flexible / To be confirmed";
    const cardMsg = cardMsgInput && cardMsgInput.value.trim() ? cardMsgInput.value.trim() : "(No dedicated handwritten card requested)";
    const sender = senderInput && senderInput.value.trim() ? senderInput.value.trim() : "";

    let draft = `Hi Namomót-an! I would like to place an order from your online catalog:\n\n`;
    draft += `🌸 Item / Creation: ${activeItemLabel}\n`;
    draft += `💰 Total Estimate: ${activePriceLabel}\n`;
    draft += `👤 Recipient: ${recipient}\n`;
    draft += `📍 Delivery Location: ${barangay}\n`;
    draft += `📅 Target Date: ${dateVal}\n`;
    draft += `💌 Dedication Card Note:\n"${cardMsg}"\n`;
    if (sender) {
      draft += `\n✍️ Sender Details: ${sender}\n`;
    }
    draft += `\nPlease confirm workshop availability and payment details. Thank you!`;

    if (modalText) modalText.value = draft;
  };

  [recipientInput, barangaySelect, dateInput, cardMsgInput, senderInput].forEach(elem => {
    if (elem) elem.addEventListener("input", refreshOrderDraft);
    if (elem) elem.addEventListener("change", refreshOrderDraft);
  });

  tmplChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const text = chip.getAttribute("data-text");
      if (cardMsgInput) {
        cardMsgInput.value = text;
        refreshOrderDraft();
      }
    });
  });

  function triggerOrderModal(itemName, itemPrice) {
    if (!modalBackdrop) {
      window.open("https://www.facebook.com/profile.php?id=61573737929854", "_blank");
      return;
    }

    activeItemLabel = itemName || "Handcrafted Bouquet";
    activePriceLabel = itemPrice || "₱350";

    if (modalItem) modalItem.textContent = activeItemLabel;
    if (modalPrice) modalPrice.textContent = activePriceLabel;

    if (dateInput && !dateInput.value) {
      const today = new Date();
      today.setDate(today.getDate() + 2);
      dateInput.value = today.toISOString().split("T")[0];
    }

    refreshOrderDraft();

    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  window.triggerOrderModal = triggerOrderModal;

  window.triggerMultiOrderModal = function(items, totalAmount) {
    const itemSummary = items.map(i => {
      const addons = i.addons && i.addons.length ? ` (+ ${i.addons.join(", ")})` : "";
      return `${i.name}${addons} x${i.qty || 1}`;
    }).join("; ");
    triggerOrderModal(itemSummary, `₱${totalAmount}`);
  };

  if (modalClose && modalBackdrop) {
    modalClose.addEventListener("click", () => {
      modalBackdrop.classList.remove("open");
      modalBackdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });

    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove("open");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    });
  }

  if (copyBtn && modalText) {
    copyBtn.addEventListener("click", () => {
      modalText.select();
      navigator.clipboard.writeText(modalText.value).then(() => {
        copyBtn.textContent = "COPIED TO CLIPBOARD!";
        if (typeof window.showAtelierToast === "function") {
          window.showAtelierToast("📋 Order draft copied! Ready to paste in Messenger.");
        }
        setTimeout(() => {
          copyBtn.textContent = "COPY ORDER DRAFT";
        }, 2500);
      }).catch(() => {
        document.execCommand("copy");
        copyBtn.textContent = "COPIED!";
        setTimeout(() => {
          copyBtn.textContent = "COPY ORDER DRAFT";
        }, 2500);
      });
    });
  }

  const indexInquireBtns = document.querySelectorAll(".favorites-section .product-card-actions .btn-primary");
  indexInquireBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".product-card");
      const title = card ? card.querySelector(".product-card-title").textContent.trim() : "Handmade Bouquet";
      const price = card ? card.querySelector(".product-card-price").textContent.trim() : "₱350";
      triggerOrderModal(title, price);
    });
  });
});