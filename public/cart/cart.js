document.addEventListener('DOMContentLoaded', async function () {
    const cartItemsContainer = document.getElementById('cart-items');

    try {
        const response = await fetch('/api/cart');
        const cartDetails = await response.json();

        await Promise.all(cartDetails.map(item => createCartItem(item, cartItemsContainer)));

        updateCartSummary(cartDetails);

    } catch (err) {
        console.error('Failed to load cart:', err);
    }
});

function createCartItem(item, container) {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item d-flex justify-content-between align-items-center my-2';
    cartItemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="item-image" style="width: 100px;">
            <span class="item-name-cart">${item.name}</span>
            <span class="item-price">$${item.price.toFixed(2)}</span>
            <input type="number" class="form-control item-quantity" value="${item.quantity}" style="width: 60px;">
            <button class="btn btn-primary" onclick="updateCartItem(${item.id})">Update</button>
            <button class="btn btn-danger" onclick="removeCartItem(${item.id})">Remove</button>
            <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
    container.appendChild(cartItemDiv);
}

function updateCartSummary(cartDetails) {
    const subtotal = cartDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0675;
    const total = subtotal + tax + deliveryFee;

    document.querySelector('.cart-summary').innerHTML = `
            <div class="d-flex justify-content-between"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="d-flex justify-content-between"><span>Tax (6.75%)</span><span>$${tax.toFixed(2)}</span></div>
            <div class="d-flex justify-content-between font-weight-bold"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        `;
}
async function addItemToCart(productId) {
    const quantity = document.querySelector(`input.item-quantity[data-id='${productId}']`).value;
    try {
        await fetch(`/api/cart/${productId}/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productId, quantity})
        });
        location.reload(); // Reload the page to update the cart
    } catch (err) {
        console.error('Error adding item to cart:', err);
    }
}

async function updateCartItem(productId) {
    const quantity = document.querySelector(`input.item-quantity[data-id='${productId}']`).value;
    try {
        await fetch(`/api/cart/${productId}/update`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productId, quantity})
        });
        location.reload(); // Reload the page to update the cart
    } catch (err) {
        console.error('Error updating cart item:', err);
    }
}

async function removeCartItem(productId) {
    try {
        await fetch(`/api/cart/${productId}/remove`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        });
        location.reload(); // Reload the page to update the cart
    } catch (err) {
        console.error('Error removing cart item:', err);
    }
}