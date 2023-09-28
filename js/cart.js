// Initialize the cart as an empty array
let cart = [];

// Function to update the cart button text
function updateCartButton() {
    const cartButton = document.querySelector('.cart-button');
    cartButton.textContent = `Cart (${cart.length})`;
}

// Function to handle adding items to the cart
function addToCart(item) {
    cart.push(item);
    updateCartButton();
}

// Event listener for the "Add to Cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        addToCart(index);
        // Update the counter next to the button
        const tailCounters = document.querySelectorAll('.tail-counter');
        tailCounters[index].textContent = cart.filter(item => item === index).length;
    });
});
