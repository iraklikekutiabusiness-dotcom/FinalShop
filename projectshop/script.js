// "email": "m81nw2kfcb@olipii.com",
//   "password": "Password1!"


const API_BASE = "https://shopapi.stepacademy.ge/api";
const API_KEY = "7314be17-7c09-4ef0-9b82-887b8485d325";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjI2NzIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJtODFudzJrZmNiQG9saXBpaS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiSXJha2xpIEtla3V0aWEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiUm9sZSI6IlVzZXIiLCJleHAiOjE3OTA2NzAyNzAsImlzcyI6ImNodmVuIiwiYXVkIjoiaXNpbmkifQ.-kh95sKeUxrTEP8fLgDsUP6Qk3TX0GhAvqRgYt0W20U";

const productsContainer = document.getElementById("products");
const newArrivalsContainer = document.getElementById("new-arrivals-products");
const categoriesContainer = document.getElementById("categories");
const dropdownContainer = document.getElementById("nav-categories-dropdown");
const searchInput = document.getElementById("searchInput");
const categoryToggle = document.getElementById("categories-toggle");

let products = [];
let categories = [];
let selectedCategoryId = null;

function getItems(data) {
    return data.data?.items || data.items || data.data || data || [];
}

function escapeHTML(value) {
    const element = document.createElement("span");
    element.textContent = value ?? "";
    return element.innerHTML;
}

async function getData(url) {
    const response = await fetch(url, {
        headers: {
            "X-API-Key":"7314be17-7c09-4ef0-9b82-887b8485d325",
            "Content-Type": "application/json"
            
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }

    return response.json();
}

async function loadProducts() {
    try {
        const data = await getData(`${API_BASE}/products?Take=100&Page=1`);
        products = getItems(data);

        if (!Array.isArray(products)) {
            products = [];
        }

        showProducts();
    } catch (error) {
        productsContainer.innerHTML =
            "<p>Products could not be loaded. Please refresh the page.</p>";
        newArrivalsContainer.innerHTML =
            "<p>New arrivals could not be loaded.</p>";
    }
}

async function loadCategories() {
    try {
        const data = await getData(`${API_BASE}/categories`);
        categories = getItems(data);

        if (!Array.isArray(categories)) {
            categories = [];
        }

        showCategories();
        showDropdownCategories();
    } catch (error) {
        categoriesContainer.innerHTML =
            "<p>Categories could not be loaded.</p>";
    }
}



function getVisibleProducts() {
    const searchText = searchInput.value.trim().toLowerCase();

    return products.filter(product => {
        const categoryId = String(
            product.categoryId ?? product.category?.id ?? ""
        );

        const matchesCategory =
            selectedCategoryId === null ||
            categoryId === selectedCategoryId;

        const productText =
            `${product.name || ""} ${product.brand || ""}`.toLowerCase();

        return matchesCategory && productText.includes(searchText);
    });
}

function showProducts() {
    const visibleProducts = getVisibleProducts();
    const featured = visibleProducts.slice(0, 4);

    const newest = [...visibleProducts]
        .sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        .slice(0, 4);

    productsContainer.innerHTML = makeProductCards(featured);
    newArrivalsContainer.innerHTML = makeProductCards(newest);
}

function makeProductCards(items) {
    if (items.length === 0) {
        return "<p>No products found.</p>";
    }

    return items.map(item => {
        const name = escapeHTML(item.name || "Tech product");
        const brand = escapeHTML(item.brand || "STEP TECH");
        const image = escapeHTML(
            item.imageUrl ||
            "https://placehold.co/500x400/f3f4f6/64748b?text=STEP+TECH"
        );

        const rating = Number(item.rating || 0);
        const price = Number(item.price || 0).toLocaleString();

        return `
            <article class="product-card">
                <div class="product-img-wrapper">
                    <img src="${image}" alt="${name}" loading="lazy"
                         onerror="this.src='https://placehold.co/500x400/f3f4f6/64748b?text=STEP+TECH'">
                </div>

                <span class="product-brand">${brand}</span>
                <h3 class="product-title">${name}</h3>

                <div class="product-rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-num">
                        ${rating ? rating.toFixed(1) : "New"}
                    </span>
                </div>

                <strong class="product-price">USD ${price}</strong>

                <button class="btn-add-cart"
                        data-product-id="${escapeHTML(item.id)}">
                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                </button>
            </article>`;
    }).join("");
}

function showCategories() {
    if (categories.length === 0) {
        categoriesContainer.innerHTML = "<p>No categories found.</p>";
        return;
    }

    categoriesContainer.innerHTML = categories.slice(0, 4).map(category => {
        const id = escapeHTML(category.id);
        const name = escapeHTML(category.name || "Category");
        const image = escapeHTML(
            category.imageUrl ||
            "https://placehold.co/120x120/f3f4f6/64748b?text=Tech"
        );
        const count = Number(category.productCount || 0);

        return `
            <button class="category-card" data-category-id="${id}">
                <span class="category-img-wrapper">
                    <img src="${image}" alt="" loading="lazy">
                </span>

                <span class="category-info">
                    <h3>${name}</h3>
                    <p>${count} products</p>
                </span>

                <i class="fa-solid fa-arrow-right cat-arrow"></i>
            </button>`;
    }).join("");
}

function showDropdownCategories() {
    dropdownContainer.innerHTML = categories.map(category => `
        <a href="#featured"
           class="nav-dropdown-item"
           data-category-id="${escapeHTML(category.id)}">
            <span>${escapeHTML(category.name || "Category")}</span>
            <span class="nav-dropdown-count">
                ${Number(category.productCount || 0)}
            </span>
        </a>
    `).join("");
}

async function addToCart(button) {
    const productId = Number(button.dataset.productId);
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/cart/add-to-cart`, {
            method: "POST",
            headers: {
                "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325",
                "Content-Type": "application/json",
                Authorization: `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (!response.ok) {
            throw new Error("The item could not be added.");
        }

        button.innerHTML =
            '<i class="fa-solid fa-check"></i> Added!';
    } catch (error) {
        button.innerHTML =
            '<i class="fa-solid fa-circle-exclamation"></i> Try Again';
    }

    window.setTimeout(() => {
        button.disabled = false;
        button.innerHTML =
            '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';
    }, 2000);
}

searchInput.addEventListener("input", showProducts);

productsContainer.addEventListener("click", event => {
    const button = event.target.closest(".btn-add-cart");

    if (button) {
        addToCart(button);
    }
});

newArrivalsContainer.addEventListener("click", event => {
    const button = event.target.closest(".btn-add-cart");

    if (button) {
        addToCart(button);
    }
});

categoriesContainer.addEventListener("click", event => {
    const card = event.target.closest("[data-category-id]");

    if (!card) {
        return;
    }

    selectedCategoryId = card.dataset.categoryId;
    showProducts();

    document.getElementById("featured").scrollIntoView({
        behavior: "smooth"
    });
});

dropdownContainer.addEventListener("click", event => {
    const link = event.target.closest("[data-category-id]");

    if (!link) {
        return;
    }

    event.preventDefault();
    selectedCategoryId = link.dataset.categoryId;
    showProducts();
    dropdownContainer.classList.remove("open");

    document.getElementById("featured").scrollIntoView({
        behavior: "smooth"
    });
});

categoryToggle.addEventListener("click", event => {
    event.preventDefault();
    dropdownContainer.classList.toggle("open");
});

document.addEventListener("click", event => {
    if (!event.target.closest(".nav-dropdown")) {
        dropdownContainer.classList.remove("open");
    }
});

Promise.all([
    loadProducts(),
    loadCategories()
]);