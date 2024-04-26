//Featured Items Script
const featuredImages = document.querySelectorAll('.featured-image');

// Add event listeners for hover and click
featuredImages.forEach((image) => {
    image.addEventListener('mouseenter', () => {
        // Increase the size by 10% on hover
        image.style.transform = 'scale(1.1)';
    });

    image.addEventListener('mouseleave', () => {
        // Restore the original size on mouse leave
        image.style.transform = 'scale(1)';
    });

    image.addEventListener('click', (event) => {
        // Prevent the default link behavior
        event.preventDefault();

        // Get the href attribute of the link
        const link = image.parentElement.getAttribute('href');

        // Navigate to the specified page
        window.location.href = link;
    });
});

document.getElementById('cartButton').addEventListener('click', function() {
    document.getElementById('cartPopup').style.display = 'block';
});

document.addEventListener('click', function(e) {
    if (!document.getElementById('cartPopup').contains(e.target) && e.target !== document.getElementById('cartButton')) {
        document.getElementById('cartPopup').style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch authentication status from the server
    function checkAuthentication() {
        fetch('/check-authentication')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update navbar based on authentication status
                const isLoggedIn = data.isLoggedIn;
                updateNavbar(isLoggedIn);
            })
            .catch(error => {
                console.error('Error checking authentication:', error);
            });
    }

    // Function to update navbar links based on authentication status
    function updateNavbar(isLoggedIn) {
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');

        if (isLoggedIn) {
            // User is logged in, display logout link and hide login link
            loginLink.style.display = 'none';
            logoutLink.style.display = 'block';
        } else {
            // User is not logged in, display login link and hide logout link
            loginLink.style.display = 'block';
            logoutLink.style.display = 'none';
        }
    }

    // Check authentication status when the page loads
    checkAuthentication();
});

const prevButton = document.getElementById('prevSlide');
const nextButton = document.getElementById('nextSlide');
const slides = document.querySelectorAll('.banner-slides img');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.style.display = 'block';
        } else {
            slide.style.display = 'none';
        }
    });
}

prevButton.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
});

nextButton.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
});

// Show the first slide initially
showSlide(currentSlide);


// Add event listener to the registration form
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Send an AJAX request to the server to register the user
    fetch('/register', {
        method: 'POST',
        body: new FormData(this),
    })
        .then(response => {
            if (response.ok) {
                // Registration successful, display a popup message
                alert('Registration successful');
                // Redirect to the login page or do any other action as needed
            } else {
                // Handle registration failure
                alert('Registration failed');
            }
        })
        .catch(error => {
            console.error('Error registering user:', error);
            alert('An error occurred while registering the user');
        });
});

// Endpoint to handle requests for product details based on product ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    // Find the product with the matching ID
    const product = products.find(product => product.id === productId);

    if (!product) {
        // If product is not found, return a 404 error
        return res.status(404).json({ error: 'Product not found' });
    }

    // If product is found, return the product details
    res.json(product);
});
