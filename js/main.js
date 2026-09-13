document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileNav = document.getElementById("mobile-nav");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      mobileNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    const mobileLinks = mobileNav.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    }, { passive: true });
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".site-nav a, .mobile-nav-links a");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  const fadeElements = document.querySelectorAll(".fade-in");
  if (fadeElements.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add("visible"));
  }

  window.showAtelierToast = function(msg) {
    let toast = document.getElementById("atelier-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "atelier-toast";
      toast.className = "toast-msg";
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  };

  const CART_KEY = "namomotan_cart";
  const WISHLIST_KEY = "namomotan_wishlist";

  window.getCartItems = function() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch(e) {
      return [];
    }
  };

  window.saveCartItems = function(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.updateCartBadges();
    window.renderCartDrawer();
  };

  window.addToCart = function(item) {
    const items = window.getCartItems();
    const existingIndex = items.findIndex(i => i.id === item.id && (i.addons || []).sort().join(",") === (item.addons || []).sort().join(","));
    if (existingIndex > -1) {
      items[existingIndex].qty = (items[existingIndex].qty || 1) + (item.qty || 1);
    } else {
      items.push({
        id: item.id || Date.now(),
        name: item.name,
        price: item.price,
        image: item.image || "images/products/rose-bouquet.jpg",
        addons: item.addons || [],
        qty: item.qty || 1,
        slug: item.slug || ""
      });
    }
    window.saveCartItems(items);
    window.showAtelierToast(`🌸 Added "${item.name}" to Bag`);
    window.openCartDrawer();
  };

  window.updateCartBadges = function() {
    const items = window.getCartItems();
    const totalQty = items.reduce((sum, i) => sum + (i.qty || 1), 0);
    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = totalQty > 0 ? totalQty : "";
      badge.setAttribute("data-count", totalQty);
    });
  };

  window.getWishlist = function() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch(e) {
      return [];
    }
  };

  window.saveWishlist = function(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.updateWishlistBadges();
    window.renderWishlistDrawer();
    window.syncWishlistButtons();
  };

  window.toggleWishlist = function(prod) {
    let list = window.getWishlist();
    const exists = list.some(item => item.id === prod.id);
    if (exists) {
      list = list.filter(item => item.id !== prod.id);
      window.showAtelierToast(`Removed from Wishlist`);
    } else {
      list.push({
        id: prod.id,
        name: prod.name,
        price: prod.priceDisplay || `₱${prod.price}`,
        image: prod.image,
        slug: prod.slug
      });
      window.showAtelierToast(`💖 Saved to Wishlist`);
    }
    window.saveWishlist(list);
  };

  window.updateWishlistBadges = function() {
    const list = window.getWishlist();
    document.querySelectorAll(".wishlist-count-badge").forEach(badge => {
      badge.textContent = list.length > 0 ? list.length : "";
      badge.setAttribute("data-count", list.length);
    });
  };

  window.syncWishlistButtons = function() {
    const list = window.getWishlist();
    document.querySelectorAll(".product-wishlist-toggle").forEach(btn => {
      const pid = parseInt(btn.getAttribute("data-id"), 10);
      const isSaved = list.some(item => item.id === pid);
      btn.classList.toggle("active", isSaved);
      btn.setAttribute("aria-label", isSaved ? "Remove from wishlist" : "Add to wishlist");
    });
  };

  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartDrawer = document.getElementById("cart-drawer");
  const wishlistBackdrop = document.getElementById("wishlist-backdrop");
  const wishlistDrawer = document.getElementById("wishlist-drawer");

  window.openCartDrawer = function() {
    if (cartBackdrop && cartDrawer) {
      cartBackdrop.classList.add("open");
      cartDrawer.classList.add("open");
      document.body.style.overflow = "hidden";
      window.renderCartDrawer();
    }
  };

  window.closeCartDrawer = function() {
    if (cartBackdrop && cartDrawer) {
      cartBackdrop.classList.remove("open");
      cartDrawer.classList.remove("open");
      document.body.style.overflow = "";
    }
  };

  window.openWishlistDrawer = function() {
    if (wishlistBackdrop && wishlistDrawer) {
      wishlistBackdrop.classList.add("open");
      wishlistDrawer.classList.add("open");
      document.body.style.overflow = "hidden";
      window.renderWishlistDrawer();
    }
  };

  window.closeWishlistDrawer = function() {
    if (wishlistBackdrop && wishlistDrawer) {
      wishlistBackdrop.classList.remove("open");
      wishlistDrawer.classList.remove("open");
      document.body.style.overflow = "";
    }
  };

  document.querySelectorAll(".cart-open-trigger").forEach(btn => {
    btn.addEventListener("click", () => window.openCartDrawer());
  });
  document.querySelectorAll(".wishlist-open-trigger").forEach(btn => {
    btn.addEventListener("click", () => window.openWishlistDrawer());
  });
  if (cartBackdrop) cartBackdrop.addEventListener("click", window.closeCartDrawer);
  if (wishlistBackdrop) wishlistBackdrop.addEventListener("click", window.closeWishlistDrawer);
  const cartCloseBtn = document.getElementById("cart-close-btn");
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", window.closeCartDrawer);
  const wishlistCloseBtn = document.getElementById("wishlist-close-btn");
  if (wishlistCloseBtn) wishlistCloseBtn.addEventListener("click", window.closeWishlistDrawer);

  window.renderCartDrawer = function() {
    const body = document.getElementById("cart-drawer-body");
    const subtotalEl = document.getElementById("cart-subtotal-val");
    const totalEl = document.getElementById("cart-total-val");
    const checkoutBtn = document.getElementById("cart-checkout-btn");
    if (!body) return;

    const items = window.getCartItems();
    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h4 class="cart-empty-title">Your Bag is Empty</h4>
          <p class="cart-empty-desc">Discover our handcrafted blooms and create an unforgettable moment.</p>
          <a href="products.html" class="btn btn-primary btn--sm" onclick="window.closeCartDrawer()">Explore Flowers</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = "₱0";
      if (totalEl) totalEl.textContent = "₱0";
      if (checkoutBtn) checkoutBtn.style.display = "none";
      return;
    }

    let subtotal = 0;
    body.innerHTML = items.map((item, idx) => {
      const priceNum = typeof item.price === "number" ? item.price : parseInt(String(item.price).replace(/[^0-9]/g, ""), 10) || 0;
      const rowTotal = priceNum * (item.qty || 1);
      subtotal += rowTotal;
      const addonsHtml = item.addons && item.addons.length > 0 ? `<div class="cart-item-meta">+ ${item.addons.join(", ")}</div>` : "";
      return `
        <div class="cart-item-row" data-idx="${idx}">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">₱${priceNum}</div>
            ${addonsHtml}
            <div class="cart-item-controls">
              <button type="button" class="qty-btn qty-minus" data-idx="${idx}">-</button>
              <span class="qty-num">${item.qty || 1}</span>
              <button type="button" class="qty-btn qty-plus" data-idx="${idx}">+</button>
            </div>
          </div>
          <button type="button" class="cart-item-remove" data-idx="${idx}" aria-label="Remove item">&times;</button>
        </div>
      `;
    }).join("");

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal}`;
    if (totalEl) totalEl.textContent = `₱${subtotal}`;
    if (checkoutBtn) {
      checkoutBtn.style.display = "inline-flex";
      checkoutBtn.onclick = () => {
        window.closeCartDrawer();
        if (typeof window.triggerMultiOrderModal === "function") {
          window.triggerMultiOrderModal(items, subtotal);
        } else if (typeof window.triggerOrderModal === "function") {
          const names = items.map(i => `${i.name} (x${i.qty || 1})`).join(", ");
          window.triggerOrderModal(names, `₱${subtotal}`);
        }
      };
    }

    body.querySelectorAll(".qty-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        const curItems = window.getCartItems();
        if (curItems[idx]) {
          curItems[idx].qty = (curItems[idx].qty || 1) - 1;
          if (curItems[idx].qty <= 0) {
            curItems.splice(idx, 1);
          }
          window.saveCartItems(curItems);
        }
      });
    });

    body.querySelectorAll(".qty-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        const curItems = window.getCartItems();
        if (curItems[idx]) {
          curItems[idx].qty = (curItems[idx].qty || 1) + 1;
          window.saveCartItems(curItems);
        }
      });
    });

    body.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        const curItems = window.getCartItems();
        curItems.splice(idx, 1);
        window.saveCartItems(curItems);
      });
    });
  };

  window.renderWishlistDrawer = function() {
    const body = document.getElementById("wishlist-drawer-body");
    const shareWrap = document.getElementById("wishlist-share-container");
    if (!body) return;

    const list = window.getWishlist();
    if (list.length === 0) {
      body.innerHTML = `
        <div class="wishlist-empty">
          <div class="wishlist-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h4 class="wishlist-empty-title">Your Wishlist is Empty</h4>
          <p class="wishlist-empty-desc">Tap the heart icon on any bouquet to save and share your favorite hints.</p>
          <a href="products.html" class="btn btn-secondary btn--sm" onclick="window.closeWishlistDrawer()">Browse Creations</a>
        </div>
      `;
      if (shareWrap) shareWrap.style.display = "none";
      return;
    }

    if (shareWrap) shareWrap.style.display = "block";

    body.innerHTML = list.map((item, idx) => `
      <div class="wishlist-item-row">
        <div class="wishlist-item-thumb">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="wishlist-item-info">
          <h4 class="wishlist-item-title"><a href="product.html?product=${encodeURIComponent(item.slug)}">${item.name}</a></h4>
          <div class="wishlist-item-price">${item.price}</div>
          <button type="button" class="btn btn-primary btn--sm wishlist-add-cart-btn" data-id="${item.id}" style="margin-top:0.35rem;padding:0.35rem 0.75rem;">Add to Bag</button>
        </div>
        <button type="button" class="wishlist-item-remove" data-id="${item.id}" aria-label="Remove item">&times;</button>
      </div>
    `).join("");

    body.querySelectorAll(".wishlist-add-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"), 10);
        const prod = list.find(it => it.id === id);
        if (prod) {
          const numPrice = parseInt(String(prod.price).replace(/[^0-9]/g, ""), 10) || 350;
          window.addToCart({
            id: prod.id,
            name: prod.name,
            price: numPrice,
            image: prod.image,
            slug: prod.slug
          });
        }
      });
    });

    body.querySelectorAll(".wishlist-item-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"), 10);
        let curList = window.getWishlist();
        curList = curList.filter(it => it.id !== id);
        window.saveWishlist(curList);
      });
    });

    const copyHintBtn = document.getElementById("copy-wishlist-hint-btn");
    if (copyHintBtn) {
      copyHintBtn.onclick = () => {
        const ids = list.map(i => i.id).join(",");
        const shareUrl = `${window.location.origin}${window.location.pathname}?wishlist=${ids}`;
        const hintText = `Look at what I saved from Namomót-an Flowers in Sorsogon: ${list.map(i => i.name).join(", ")}! 🌸 Check here: ${shareUrl}`;
        navigator.clipboard.writeText(hintText).then(() => {
          window.showAtelierToast("Copied hint to clipboard!");
        }).catch(() => {
          window.showAtelierToast("Copied wishlist link!");
        });
      };
    }
  };

  const urlQuery = new URLSearchParams(window.location.search);
  const sharedWishlist = urlQuery.get("wishlist");
  if (sharedWishlist && typeof PRODUCTS !== "undefined") {
    const targetIds = sharedWishlist.split(",").map(s => parseInt(s.trim(), 10));
    const saved = window.getWishlist();
    targetIds.forEach(id => {
      const found = PRODUCTS.find(p => p.id === id);
      if (found && !saved.some(s => s.id === id)) {
        saved.push({
          id: found.id,
          name: found.name,
          price: found.priceDisplay || `₱${found.price}`,
          image: found.image,
          slug: found.slug
        });
      }
    });
    window.saveWishlist(saved);
  }

  window.updateCartBadges();
  window.updateWishlistBadges();
  window.syncWishlistButtons();
});