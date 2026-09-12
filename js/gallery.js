document.addEventListener("DOMContentLoaded", () => {
  const galleryGrid = document.getElementById("gallery-grid");
  const filterBtns = document.querySelectorAll(".gallery-filter-btn");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  const GALLERY_ITEMS = [
    { id: 1, title: "Fuzzy Wire Flower Craft", category: "bouquets", img: "images/products/rose-bouquet.jpg" },
    { id: 2, title: "Ribbon Satin Roses in Bloom", category: "bouquets", img: "images/products/sunflower-bouquet.jpg" },
    { id: 3, title: "Handcrafted Floral Studio Setup", category: "shop", img: "images/hero/hero-main.jpg" },
    { id: 4, title: "Custom Graduation Bouquet", category: "events", img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80" },
    { id: 5, title: "Anniversary Pastel Arrangement", category: "arrangements", img: "https://images.unsplash.com/photo-1487530811015-780780adfe38?w=800&q=80" },
    { id: 6, title: "Celebration Floral Gift", category: "arrangements", img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80" },
    { id: 7, title: "Handmade Bridal Florals", category: "events", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" },
    { id: 8, title: "Everlasting Floral Keepsake", category: "bouquets", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" }
  ];

  let currentCategory = "all";
  let activeIndex = 0;
  let activeItems = [...GALLERY_ITEMS];

  const renderGallery = (category = "all") => {
    if (!galleryGrid) return;
    currentCategory = category;
    activeItems = category === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter(item => item.category === category);

    galleryGrid.innerHTML = activeItems.map((item, idx) => `
      <div class="gallery-item" data-index="${idx}" role="button" tabindex="0" aria-label="Enlarge image: ${item.title}">
        <img src="${item.img}" alt="${item.title} - Namomót-an Handmade Flowers" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-title">${item.title}</span>
        </div>
      </div>
    `).join("");

    galleryGrid.querySelectorAll(".gallery-item").forEach(itemEl => {
      const idx = parseInt(itemEl.getAttribute("data-index"), 10);
      itemEl.addEventListener("click", () => openLightbox(idx));
      itemEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });
  };

  const openLightbox = (idx) => {
    if (!lightbox || !lightboxImg) return;
    activeIndex = idx;
    const current = activeItems[activeIndex];
    lightboxImg.src = current.img;
    lightboxImg.alt = current.title;
    if (lightboxCaption) lightboxCaption.textContent = current.title;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const showNext = () => {
    activeIndex = (activeIndex + 1) % activeItems.length;
    openLightbox(activeIndex);
  };

  const showPrev = () => {
    activeIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
    openLightbox(activeIndex);
  };

  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGallery(btn.getAttribute("data-category"));
      });
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", showNext);
  if (prevBtn) prevBtn.addEventListener("click", showPrev);

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    }, { passive: true });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  renderGallery("all");
});