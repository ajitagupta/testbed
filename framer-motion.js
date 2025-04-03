// First, add the Framer Motion script in your HTML head section
// <script src="https://cdnjs.cloudflare.com/ajax/libs/framer-motion/10.16.4/framer-motion.js"></script>

// Initialize Framer Motion animations
document.addEventListener('DOMContentLoaded', function() {
    // Setup for hero section animation
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Add animation classes
        heroContent.classList.add('fm-animate');
        
        // Add staggered animation for each child
        Array.from(heroContent.children).forEach((child, index) => {
            child.classList.add('fm-stagger');
            child.style.transitionDelay = `${index * 0.15}s`;
        });
    }
    
    // Setup for feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.classList.add('fm-animate-card');
        card.style.transitionDelay = `${index * 0.1}s`;
        
        // Add pulse animation to feature icons
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            icon.classList.add('fm-pulse');
        }
    });
    
    // Ensure feature cards are initially displayed by setting their opacity to 1
    setTimeout(() => {
        featureCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 300);
    
    // Setup for property cards animation
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card) => {
        card.classList.add('fm-property-card');
        
        // Add hover effect for buttons
        const buttons = card.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.add('fm-button');
        });
        
        // Image transition enhancement
        const imageSlider = card.querySelector('.image-slider');
        if (imageSlider) {
            imageSlider.classList.add('fm-image-slider');
        }
    });
    
    // Price ribbon animation
    const priceRibbons = document.querySelectorAll('.price-ribbon');
    priceRibbons.forEach(ribbon => {
        ribbon.classList.add('fm-ribbon');
    });
    
    // Setup scroll animations for sections
    const sections = [
        '.ai-features-section',
        '.properties-section',
        '.about-section',
        '.blog-section'
    ];
    
    // Initialize intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fm-visible');
                
                // If this is a feature section, ensure all cards are visible
                if (entry.target.classList.contains('ai-features-section')) {
                    const cards = entry.target.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    // Observe all main sections
    sections.forEach(section => {
        const elements = document.querySelectorAll(section);
        elements.forEach(el => {
            el.classList.add('fm-section');
            observer.observe(el);
        });
    });
    
    // Blog card animations
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach((card, index) => {
        card.classList.add('fm-blog-card');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Ensure blog cards become visible when the blog section enters viewport
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        const blogObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                blogCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100 + (index * 150));
                });
                blogObserver.unobserve(blogSection);
            }
        }, { threshold: 0.15 });
        
        blogObserver.observe(blogSection);
    }
    
    // Fallback to ensure blog cards are visible even without scrolling
    setTimeout(() => {
        blogCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 1000 + (index * 150));
        });
    }, 2000);
    
    // Navigation menu animation enhancement
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.classList.add('fm-menu-toggle');
    }
    
});

// Add these styles to your existing CSS
const styles = `
/* Framer Motion Animation Classes */
.fm-animate {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s forwards;
}

.fm-stagger {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fm-animate-card {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    will-change: opacity, transform;
}

.fm-section {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.fm-visible {
    opacity: 1;
    transform: translateY(0);
}

.fm-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.fm-property-card {
    transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.fm-property-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.fm-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.fm-button:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
}

.fm-button:hover:after {
    animation: ripple 0.6s ease-out;
}

@keyframes ripple {
    0% {
        transform: scale(0, 0);
        opacity: 1;
    }
    20% {
        transform: scale(25, 25);
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: scale(40, 40);
    }
}

.fm-ribbon {
    animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
    0% {
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
    }
    50% {
        box-shadow: 0 3px 15px rgba(217, 45, 42, 0.7);
    }
    100% {
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
    }
}

.fm-blog-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.5s ease;
    will-change: opacity, transform;
}

.fm-blog-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.fm-image-slider {
    position: relative;
}

.fm-image-slider .property-image {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fm-image-slider .property-image.active {
    transform: scale(1);
}

.fm-menu-toggle span {
    transition: all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

/* Apply animation to mobile menu */
body.menu-open .mobile-menu {
    transition: right 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* Enhanced overlay animation */
body.menu-open .menu-overlay {
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);