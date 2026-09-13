document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRODUCTS === "undefined") return;

  const productGrid = document.getElementById("products-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (productGrid) {
    const renderProducts = (category = "all") => {
      const filtered = category === "all"
        ? PRODUCTS
        : PRODUCTS.filter(p => p.categories && p.categories.includes(category));

      if (filtered.length === 0) {
        productGrid.innerHTML = `
          <div class="no-products-msg" style="grid-column:1/-1;text-align:center;padding:3rem 1.5rem;">
            <p style="font-size:1.125rem;color:var(--color-muted);margin-bottom:1.5rem;">Flowers will be added here soon.</p>
            <button class="btn btn-secondary" onclick="document.querySelector('[data-category=all]').click()">View All Flowers</button>
          </div>
        `;
        return;
      }

      productGrid.innerHTML = filtered.map(p => `
        <article class="product-card">
          <div class="product-card-img">
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
              <a href="https://www.facebook.com/profile.php?id=61573737929854" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn--sm">Inquire</a>
            </div>
          </div>
        </article>
      `).join("");
    };

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get("category") || "all";

    renderProducts(initialCategory);

    filterBtns.forEach(btn => {
      const cat = btn.getAttribute("data-category");
      if (cat === initialCategory) {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(cat);
        const newUrl = cat === "all" ? window.location.pathname : `${window.location.pathname}?category=${cat}`;
        window.history.replaceState(null, "", newUrl);
      });
    });
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
    if (priceEl) priceEl.textContent = product.priceDisplay || "Inquire for price";

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
});