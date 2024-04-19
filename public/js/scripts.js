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
    const loginLogoutLink = document.getElementById('loginLogoutLink');

    // Check if the user is logged in (you need to implement this logic)
    const isLoggedIn = true; // Change this to your actual logic

    if (isLoggedIn) {
        // If the user is logged in, display the "Logout" link
        loginLogoutLink.innerHTML = '<a class="nav-link" href="/logout">Logout</a>';
    } else {
        // If the user is not logged in, display the "Login" link
        loginLogoutLink.innerHTML = '<a class="nav-link" href="webpages/login.html">Login</a>';
    }
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
