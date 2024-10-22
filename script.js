(function () {
  const toggleButton = document.querySelector(".toggle-button");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav ul li a");
  const productData = document.getElementById("product-data");
  const sub_total_price_element = document.querySelector(
    ".cart-totals .sub-total-price"
  );
  const total_price_element = document.querySelector(
    ".cart-totals .total-price"
  );
  const loader = document.getElementById("loader");
  let sub_totalPrice;

  let products;

  // Fetching data from API and setting it into localStorage...
  const fetchDataAPI = async () => {
    try {
      const response = await fetch(
        "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Issue in data fetching...");
      }
      localStorage.setItem("products", JSON.stringify(data?.items));
      return data?.items;
    } catch (error) {
      console.log(error);
    }
  };

  // Fetching data from localStoage or from API...
  const fetchData = async () => {
    try {
      const productsData = JSON.parse(localStorage.getItem("products"));
      // Check if productsData exists and is not empty
      if (productsData && productsData.length > 0) {
        return productsData; // Return products from localStorage
      } else {
        const productsFromAPI = await fetchDataAPI(); // Fetch from API if localStorage is empty
        return productsFromAPI;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Format the amount as Indian currency
  const quantityFormatting = (amount) => {
    // console.log(amount);
    return new Intl.NumberFormat("en-IN", {
      // style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const priceCal = (productId) => {
    JSON.parse(localStorage.getItem("products")).forEach((prod) => {
      if (prod.id == productId) {
        sub_totalPrice = +prod?.quantity * +prod?.presentment_price;
      }
    });
    return sub_totalPrice;
  };

  const cartTotalCalc = () => {
    const products = JSON.parse(localStorage.getItem("products"));

    let subTotal = 0;

    products.forEach((prod) => {
      subTotal += prod.quantity * prod.presentment_price;
    });

    sub_total_price_element.innerText = `Rs. ${subTotal}`;
    total_price_element.innerText = `Rs. ${subTotal}`;
  };

  // Function to render products in the table
  const renderProducts = (products) => {
    products.forEach((product, index) => {
      const inputId = `quantityInput-${product?.id}`;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="product-cell">
          <img
            src="${product?.image || "images/Asgaard sofa 5.png"}"
            alt="Asgaard sofa"
            class="product-image"
          />
          ${product?.product_title}
        </td>
        <td>Rs. ${quantityFormatting(product?.presentment_price)}</td>
        <td>
          <button class="decrement-btn btn" data-input-id="${inputId}">-</button>
          <input type="number" id="${inputId}" value="${
        product.quantity
      }" min="1" class="quantity-input" />
          <button class="increment-btn btn" data-input-id="${inputId}">+</button>
        </td>
        <td>Rs. ${quantityFormatting(priceCal(product?.id))}</td>
        <td>
          <span class="remove-icon">
            <i class="fa-solid fa-trash" id="${inputId}" data-trash-id="${inputId}"></i>
          </span>
        </td>
      `;

      productData.appendChild(tr);
    });
  };

  // Event delegation to handle increment and decrement buttons
  productData.addEventListener("click", (e) => {
    if (e.target.classList.contains("increment-btn")) {
      const inputId = e.target.getAttribute("data-input-id");
      incrementQuantity(inputId);
    } else if (e.target.classList.contains("decrement-btn")) {
      const inputId = e.target.getAttribute("data-input-id");
      decrementQuantity(inputId);
    } else if (e.target.classList.contains("fa-trash")) {
      const inputId = e.target.getAttribute("data-trash-id");
      removeBtnHandler(inputId);
    }
  });

  // Increment the quantity
  const incrementQuantity = (inputId) => {
    const inputField = document.getElementById(inputId);
    let currentValue = parseInt(inputField.value, 10);
    inputField.value = currentValue + 1;
    const products = JSON.parse(localStorage.getItem("products"));
    const productId = inputId.split("-")[1];
    const updatedProducts = products.map((product) => {
      if (product?.id == productId) {
        return { ...product, quantity: product?.quantity + 1 };
      } else {
        return product;
      }
    });

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    priceCal(productId);
    // Update subtotal price in the UI
    const subtotalCell = inputField
      .closest("tr")
      .querySelector("td:nth-child(4)");
    subtotalCell.innerHTML = quantityFormatting(priceCal(productId)); // Update the displayed subtotal
    cartTotalCalc();

    // sub_total_price_element.innerText = `Rs. ${sub_totalPrice}`;
    // total_price_element.innerText = `Rs. ${sub_totalPrice}`;
  };

  // Decrement the quantity
  const decrementQuantity = (inputId) => {
    const inputField = document.getElementById(inputId);
    let currentValue = parseInt(inputField.value, 10);

    if (currentValue > 1) {
      inputField.value = currentValue - 1;
      const products = JSON.parse(localStorage.getItem("products"));
      const productId = inputId.split("-")[1];
      const updatedProducts = products.map((product) => {
        if (product?.id == productId) {
          return { ...product, quantity: product?.quantity - 1 };
        } else {
          return product;
        }
      });

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      priceCal(productId);
      const subtotalCell = inputField
        .closest("tr")
        .querySelector("td:nth-child(4)");
      subtotalCell.innerHTML = quantityFormatting(priceCal(productId)); // Update the displayed subtotal
      cartTotalCalc();
      // sub_total_price_element.innerText = `Rs. ${sub_totalPrice}`;
      // total_price_element.innerText = `Rs. ${sub_totalPrice}`;
    }
  };

  // Remove the product from the cart...
  const removeBtnHandler = (inputId) => {
    const product = document.getElementById(inputId);
    const products = JSON.parse(localStorage.getItem("products"));
    const productId = inputId.split("-")[1];

    const userConfirmed = confirm("Do you want to proceed?");
    if (userConfirmed) {
      const updatedProducts = products.filter((prod) => {
        if (prod?.id != productId) {
          return prod;
        }
      });

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      product.parentNode.parentNode.remove();
    } else {
      return;
    }
  };

  // DOM loaded event
  document.addEventListener("DOMContentLoaded", async () => {
    products = await fetchData();

    // Render products once the data is fetched
    renderProducts(products);

    cartTotalCalc();

    // Toggle navigation menu
    toggleButton.addEventListener("click", () => {
      nav.classList.toggle("active");
    });

    // Close navigation when a link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
      });
    });
  });
})();
