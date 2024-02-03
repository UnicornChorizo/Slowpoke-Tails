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
