const API_URL = "https://shopapi.stepacademy.ge/api/products?Take=100&Page=1";
const CATEGORIES_URL = "https://shopapi.stepacademy.ge/api/categories";
const CART_URL = "https://shopapi.stepacademy.ge/api/cart?Take=100&Page=1";
const API_KEY = "7314be17-7c09-4ef0-9b82-887b8485d325";


let products = [];
let categories = [];

let currentPage = 1;
let itemsPerPage = 8;

let selectedCategoryId = null;
let selectedMinRating = null;
let minPriceValue = null;
let maxPriceValue = null;
let brandSearchText = "";
let inStockOnlyValue = false;
let searchText = "";
let currentSort = "default";

const fallbackProducts = [
    { id: "1", name: "MacBook Pro 14-inch M3 Pro", categoryId: "c1", category: { name: "Laptops" }, brand: "Apple", price: 5499, rating: 2.7, stock: 5, imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" },
    { id: "2", name: "MacBook Air 15-inch M2", categoryId: "c1", category: { name: "Laptops" }, brand: "Apple", price: 3799, rating: 3.0, stock: 3, imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500" },
    { id: "3", name: "Dell XPS 15 9530", categoryId: "c1", category: { name: "Laptops" }, brand: "Dell", price: 4799, rating: 0.0, stock: 2, imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500" },
    { id: "4", name: "ASUS ROG Zephyrus G14", categoryId: "c1", category: { name: "Laptops" }, brand: "ASUS", price: 4199, rating: 4.5, stock: 4, imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500" },
    { id: "5", name: "Lenovo ThinkPad X1 Carbon Gen 11", categoryId: "c1", category: { name: "Laptops" }, brand: "Lenovo", price: 4999, rating: 4.0, stock: 0, imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500" },
    { id: "6", name: "HP Spectre x360 14", categoryId: "c1", category: { name: "Laptops" }, brand: "HP", price: 3999, rating: 5.0, stock: 6, imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500" },
    { id: "7", name: "iPhone 15 Pro", categoryId: "c2", category: { name: "Smartphones" }, brand: "Apple", price: 2999, rating: 0.0, stock: 8, imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500" },
    { id: "8", name: "iPhone 15", categoryId: "c2", category: { name: "Smartphones" }, brand: "Apple", price: 2399, rating: 0.0, stock: 10, imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500" }
];

const fallbackCategories = [
    { id: "c1", name: "Laptops" },
    { id: "c2", name: "Smartphones" },
    { id: "c3", name: "Monitors" },
    { id: "c4", name: "Keyboards & Mice" },
    { id: "c5", name: "Headphones & Audio" },
    { id: "c6", name: "Graphics Cards" },
    { id: "c7", name: "Storage" },
    { id: "c8", name: "Networking" }
];



async function getProducts() {
    try {
        const response = await fetch(API_URL, { headers: { "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325" } });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        products = data.data?.items || data.items || data.data || [];
        if (!products.length) products = fallbackProducts;
    } catch (e) {
        console.log("Using fallback products dataset.");
        products = fallbackProducts;
    }
}

async function getCategories() {
    try {
        const response = await fetch(CATEGORIES_URL, { headers: { "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325" } });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        categories = data.data?.items || data.items || data.data || [];
        if (!categories.length) categories = fallbackCategories;
    } catch (e) {
        console.log("Using fallback categories dataset.");
        categories = fallbackCategories;
    }
}

const ITEMS_POST_URL = "https://shopapi.stepacademy.ge/api/products";

async function postItem(item) {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325"
        
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(ITEMS_POST_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(item)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            errorText || `Could not create item (${response.status})`
        );
    }

    const result = await response.json();

    
    const createdItems =
        result?.data?.items ||
        result?.items ||
        (result?.data ? [result.data] : [result]);

    if (Array.isArray(createdItems) && createdItems.length > 0) {
        products.unshift(...createdItems);
        currentPage = 1;
        renderCategories();
        updateUI();
    }

    return result;
}
   


async function addToCart(productId, buttonElement) {
    const originalText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Adding...`;

    const token = localStorage.getItem("token") || localStorage.getItem("userToken");

    const headers = {
        "Content-Type": "application/json",
        "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjI2NzIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJtODFudzJrZmNiQG9saXBpaS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiSXJha2xpIEtla3V0aWEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiUm9sZSI6IlVzZXIiLCJleHAiOjE3OTA2NzAyNzAsImlzcyI6ImNodmVuIiwiYXVkIjoiaXNpbmkifQ.-kh95sKeUxrTEP8fLgDsUP6Qk3TX0GhAvqRgYt0W20U"}`;
    }

    try {
        const response = await fetch(CART_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (response.ok) {
            buttonElement.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
            buttonElement.style.backgroundColor = "#10b981";
            buttonElement.style.color = "#ffffff";
            saveToLocalCart(productId);
        } else {
            saveToLocalCart(productId);
            buttonElement.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
            buttonElement.style.backgroundColor = "#10b981";
            buttonElement.style.color = "#ffffff";
        }
    } catch (error) {
        console.warn("API Add to Cart request failed, storing locally:", error);
        saveToLocalCart(productId);
        buttonElement.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
        buttonElement.style.backgroundColor = "#10b981";
        buttonElement.style.color = "#ffffff";
    }

    setTimeout(() => {
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalText;
        buttonElement.style.backgroundColor = "";
        buttonElement.style.color = "";
    }, 1800);
}

function saveToLocalCart(productId) {
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = localCart.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
        localCart[existingIndex].quantity += 1;
    } else {
        localCart.push({ productId: productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(localCart));
}



function renderCategories() {
    const navDropdown = document.getElementById("nav-categories-dropdown");
    navDropdown.innerHTML = `<a href="#" class="nav-cat-item" data-id="">All Products</a>`;
    
    const sidebarList = document.getElementById("sidebarCategoryList");
    sidebarList.innerHTML = `
        <label class="category-item ${selectedCategoryId === null ? 'active' : ''}">
            <span><input type="radio" name="sidebarCategory" value="" ${selectedCategoryId === null ? 'checked' : ''}> All Categories</span>
        </label>
    `;

    categories.forEach(cat => {
        const catId = String(cat.id || cat.categoryId);
        const catName = cat.name || "Category";
        const count = products.filter(p => getProductCatId(p) === catId).length;

        const navLink = document.createElement("a");
        navLink.href = "#";
        navLink.textContent = `${catName} (${count})`;
        navLink.onclick = (e) => {
            e.preventDefault();
            selectCategory(catId);
        };
        navDropdown.appendChild(navLink);

        const item = document.createElement("label");
        item.className = `category-item ${selectedCategoryId === catId ? 'active' : ''}`;
        item.innerHTML = `
            <span>
                <input type="radio" name="sidebarCategory" value="${catId}" ${selectedCategoryId === catId ? 'checked' : ''}>
                ${catName}
            </span>
            <span class="category-count-badge">${count}</span>
        `;
        sidebarList.appendChild(item);
    });

    document.querySelectorAll('input[name="sidebarCategory"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectCategory(e.target.value || null);
        });
    });
}

function getProductCatId(product) {
    if (product.categoryId !== undefined) return String(product.categoryId);
    if (product.category?.id !== undefined) return String(product.category.id);
    return null;
}

function selectCategory(id) {
    selectedCategoryId = id;
    currentPage = 1;
    renderCategories();
    updateUI();
}



function getFilteredProducts() {
    return products.filter(product => {
        if (selectedCategoryId !== null && getProductCatId(product) !== selectedCategoryId) return false;

        const rating = product.rating || 0;
        if (selectedMinRating !== null && rating < selectedMinRating) return false;

        const price = product.price || 0;
        if (minPriceValue !== null && price < minPriceValue) return false;
        if (maxPriceValue !== null && price > maxPriceValue) return false;

        if (brandSearchText.trim() !== "") {
            const brand = (product.brand || "").toLowerCase();
            if (!brand.includes(brandSearchText.toLowerCase())) return false;
        }

        if (inStockOnlyValue && (!product.stock || product.stock <= 0)) return false;

        if (searchText.trim() !== "") {
            const name = (product.name || "").toLowerCase();
            if (!name.includes(searchText.toLowerCase())) return false;
        }

        return true;
    }).sort((a, b) => {
        if (currentSort === "price-asc") return (a.price || 0) - (b.price || 0);
        if (currentSort === "price-desc") return (b.price || 0) - (a.price || 0);
        if (currentSort === "rating-desc") return (b.rating || 0) - (a.rating || 0);
        if (currentSort === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0;
    });
}



function showProducts(filteredProducts) {
    const container = document.getElementById("productContainer");
    document.getElementById("productCountText").textContent = `${filteredProducts.length} products`;

    container.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    if (productsToShow.length === 0) {
        container.innerHTML = `<div class="loading">No products match your criteria.</div>`;
        return;
    }

    productsToShow.forEach(product => {
        const card = document.createElement("div");
        card.className = "card";

        const ratingVal = (product.rating || 0).toFixed(1);
        const categoryName = product.category?.name || "Laptops";
        const brandName = product.brand || "";

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}" alt="${product.name}">
            </div>
            <div class="card-body">
                <div class="card-category">${categoryName} ${brandName ? `<span class="brand-span">- ${brandName}</span>` : ''}</div>
                <h3 class="card-title">${product.name}</h3>
                
                <div class="card-rating">
                    <span class="stars">${renderStars(product.rating || 0)}</span>
                    <span class="rating-value">${ratingVal}</span>
                </div>

                <div class="card-price">USD ${product.price?.toLocaleString()}</div>

                <button class="btn-add-cart" data-id="${product.id}">
                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                </button>
            </div>
        `;

        const btn = card.querySelector(".btn-add-cart");
        btn.addEventListener("click", () => addToCart(product.id, btn));

        container.appendChild(card);
    });
}

function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ? "★" : "☆";
    }
    return stars;
}

function showPagination(filteredProducts) {
    const pagination = document.getElementById("paginationContainer");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "&lt;";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; updateUI(); };
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.onclick = () => { currentPage = i; updateUI(); };
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "&gt;";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; updateUI(); };
    pagination.appendChild(nextBtn);

    const select = document.createElement("select");
    select.className = "page-size-select";
    select.innerHTML = `
        <option value="8" ${itemsPerPage === 8 ? 'selected' : ''}>8 / page</option>
        <option value="12" ${itemsPerPage === 12 ? 'selected' : ''}>12 / page</option>
        <option value="16" ${itemsPerPage === 16 ? 'selected' : ''}>16 / page</option>
    `;
    select.onchange = (e) => {
        itemsPerPage = Number(e.target.value);
        currentPage = 1;
        updateUI();
    };
    pagination.appendChild(select);
}

function updateUI() {
    const filtered = getFilteredProducts();
    showProducts(filtered);
    showPagination(filtered);
}



function setupEventListeners() {
    document.getElementById("categories-toggle").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("navDropdown").classList.toggle("active");
    });

    document.querySelectorAll(".rating-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rating = Number(btn.getAttribute("data-rating"));
            if (selectedMinRating === rating) {
                selectedMinRating = null;
                btn.classList.remove("active");
            } else {
                document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
                selectedMinRating = rating;
                btn.classList.add("active");
            }
            currentPage = 1;
            updateUI();
        });
    });

    document.getElementById("minPrice").addEventListener("input", (e) => {
        minPriceValue = e.target.value !== "" ? Number(e.target.value) : null;
        currentPage = 1;
        updateUI();
    });

    document.getElementById("maxPrice").addEventListener("input", (e) => {
        maxPriceValue = e.target.value !== "" ? Number(e.target.value) : null;
        currentPage = 1;
        updateUI();
    });

    document.getElementById("brandSearchInput").addEventListener("input", (e) => {
        brandSearchText = e.target.value;
        currentPage = 1;
        updateUI();
    });

    document.getElementById("inStockOnly").addEventListener("change", (e) => {
        inStockOnlyValue = e.target.checked;
        currentPage = 1;
        updateUI();
    });

    const handleSearch = (e) => {
        searchText = e.target.value;
        currentPage = 1;
        updateUI();
    };
    document.getElementById("mainSearchInput").addEventListener("input", handleSearch);
    document.getElementById("headerSearchInput").addEventListener("input", handleSearch);

    document.getElementById("sortSelect").addEventListener("change", (e) => {
        currentSort = e.target.value;
        updateUI();
    });

    document.getElementById("clearFiltersBtn").addEventListener("click", () => {
        selectedCategoryId = null;
        selectedMinRating = null;
        minPriceValue = null;
        maxPriceValue = null;
        brandSearchText = "";
        inStockOnlyValue = false;
        searchText = "";
        currentSort = "default";

        document.getElementById("minPrice").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("brandSearchInput").value = "";
        document.getElementById("inStockOnly").checked = false;
        document.getElementById("mainSearchInput").value = "";
        document.getElementById("headerSearchInput").value = "";
        document.getElementById("sortSelect").value = "default";
        document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));

        currentPage = 1;
        renderCategories();
        updateUI();
    });
}



async function init() {
    await Promise.all([getProducts(), getCategories()]);
    renderCategories();
    setupEventListeners();
    updateUI();
}

init();