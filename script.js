// GameAsset Website JavaScript
class GameAssetWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupHeroAnimations();
        this.loadAssetPacks();
        this.setupSmoothScrolling();
    }

    // Navigation functionality
    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    // Setup hero section animations
    setupHeroAnimations() {
        const floatingContainer = document.querySelector('.floating-assets');
        if (!floatingContainer) return;

        // Asset icons for animation
        const assetIcons = [
            '🎮', '⚔️', '🏰', '🧙‍♂️', '🐉', '💎', 
            '🏹', '🛡️', '👑', '🗡️', '🧪', '📜',
            '🎯', '🔮', '⭐', '🎨', '🎲', '🎪'
        ];

        // Create floating asset elements
        for (let i = 0; i < 6; i++) {
            const asset = document.createElement('div');
            asset.className = 'floating-asset';
            asset.textContent = assetIcons[i % assetIcons.length];
            asset.style.animationDelay = `${i * 0.5}s`;
            floatingContainer.appendChild(asset);
        }

        // Add mouse interaction
        floatingContainer.addEventListener('mousemove', (e) => {
            const rect = floatingContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            document.querySelectorAll('.floating-asset').forEach((asset, index) => {
                const xOffset = (x - 0.5) * 20;
                const yOffset = (y - 0.5) * 20;
                asset.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${xOffset * 0.5}deg)`;
            });
        });

        floatingContainer.addEventListener('mouseleave', () => {
            document.querySelectorAll('.floating-asset').forEach(asset => {
                asset.style.transform = '';
            });
        });
    }

    // Load and display asset packs
    async loadAssetPacks() {
        const assetGrid = document.getElementById('asset-packs');
        if (!assetGrid) return;

        try {
            // Show loading spinner
            assetGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

            // Get asset packs from the assets/packs directory
            const assetPacks = await this.detectAssetPacks();
            
            if (assetPacks.length === 0) {
                assetGrid.innerHTML = '<p class="error-message">Keine Asset-Packs gefunden.</p>';
                return;
            }

            // Clear loading and render asset packs
            assetGrid.innerHTML = '';
            assetPacks.forEach(pack => {
                const card = this.createAssetCard(pack);
                assetGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Fehler beim Laden der Asset-Packs:', error);
            assetGrid.innerHTML = '<p class="error-message">Fehler beim Laden der Asset-Packs. Bitte versuchen Sie es später erneut.</p>';
        }
    }

    // Detect asset packs from the file system
    async detectAssetPacks() {
        // Enhanced asset detection with actual file discovery
        const knownPacks = [
            {
                name: 'cartoon-formula-1',
                displayName: 'Cartoon Formula 1',
                description: 'Bunte und verspielte Formula 1 Rennwagen im Cartoon-Stil. Perfekt für Arcade-Rennspiele.',
                category: 'Fahrzeuge'
            },
            {
                name: 'realistic_cyberpunk',
                displayName: 'Realistic Cyberpunk',
                description: 'Futuristische Cyberpunk-Assets mit realistischem Design. Ideal für Science-Fiction Spiele.',
                category: 'Sci-Fi'
            }
        ];

        // Dynamically detect files for each pack
        for (let pack of knownPacks) {
            try {
                pack.files = await this.getPackFiles(pack.name);
                pack.fileCount = pack.files.length;
                pack.previewImage = await this.getPreviewImage(pack.name, pack.files);
                pack.available = pack.files.length > 0;
            } catch (error) {
                console.log(`Could not detect files for pack ${pack.name}:`, error);
                pack.files = [];
                pack.fileCount = 0;
                pack.previewImage = null;
                pack.available = false;
            }
        }

        return knownPacks.filter(pack => pack.available);
    }

    // Get files for a specific pack
    async getPackFiles(packName) {
        // Known files for each pack (since we can't easily list directory contents in static hosting)
        const packFiles = {
            'cartoon-formula-1': ['racecar.png'],
            'realistic_cyberpunk': ['foodtruck.png', 'techshop.png', 'bus.png', 'bar.png', 'cyborg_1.png', 'school.png']
        };

        const files = packFiles[packName] || [];
        
        // Verify files exist by trying to fetch them
        const verifiedFiles = [];
        for (const file of files) {
            try {
                const response = await fetch(`assets/packs/${packName}/${file}`, { method: 'HEAD' });
                if (response.ok) {
                    verifiedFiles.push(file);
                }
            } catch (error) {
                // File doesn't exist, skip it
                console.log(`File ${file} not found in pack ${packName}`);
            }
        }

        return verifiedFiles;
    }

    // Get preview image for a pack
    async getPreviewImage(packName, files) {
        if (files.length === 0) return null;
        
        // Try the first image file as preview
        const imageFiles = files.filter(file => 
            file.toLowerCase().endsWith('.png') || 
            file.toLowerCase().endsWith('.jpg') || 
            file.toLowerCase().endsWith('.jpeg') ||
            file.toLowerCase().endsWith('.webp')
        );
        
        if (imageFiles.length > 0) {
            const previewPath = `assets/packs/${packName}/${imageFiles[0]}`;
            try {
                const response = await fetch(previewPath, { method: 'HEAD' });
                if (response.ok) {
                    return previewPath;
                }
            } catch (error) {
                // Preview image doesn't exist
            }
        }
        
        return null;
    }

    // Create asset pack card element
    createAssetCard(pack) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        
        const hasPreview = pack.previewImage && pack.previewImage !== null;
        
        card.innerHTML = `
            <div class="asset-image-container">
                ${hasPreview ? 
                    `<img src="${pack.previewImage}" alt="${pack.displayName}" class="asset-image" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=&quot;asset-image-placeholder&quot;>🎮</div>'">` :
                    `<div class="asset-image asset-image-placeholder">🎮</div>`
                }
            </div>
            <div class="asset-content">
                <h3 class="asset-title">${pack.displayName}</h3>
                <p class="asset-description">${pack.description}</p>
                <div class="asset-meta">
                    <span class="asset-category">${pack.category}</span>
                    <span class="asset-count">${pack.fileCount} Dateien</span>
                </div>
                <button class="asset-download" onclick="gameAsset.downloadPack('${pack.name}')">
                    📦 Pack herunterladen
                </button>
            </div>
        `;

        return card;
    }

    // Download asset pack as ZIP (simplified version without external dependencies)
    async downloadPack(packName) {
        try {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '⏳ Wird vorbereitet...';
            button.disabled = true;

            // Get pack files
            const files = await this.getPackFiles(packName);
            
            if (files.length === 0) {
                throw new Error('Keine Dateien in diesem Pack gefunden');
            }

            // For multiple files, create a simple download approach
            if (files.length === 1) {
                // Single file - direct download
                const filename = files[0];
                button.textContent = `⏳ Lade ${filename}...`;
                
                const response = await fetch(`assets/packs/${packName}/${filename}`);
                if (!response.ok) {
                    throw new Error(`Could not fetch ${filename}`);
                }
                
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // Multiple files - download all individually
                for (let i = 0; i < files.length; i++) {
                    const filename = files[i];
                    button.textContent = `⏳ Lade ${filename} (${i+1}/${files.length})...`;
                    
                    try {
                        const response = await fetch(`assets/packs/${packName}/${filename}`);
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            // Small delay between downloads
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } catch (error) {
                        console.error(`Error downloading ${filename}:`, error);
                    }
                }
            }
            
            button.textContent = '✅ Download gestartet!';
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Download-Fehler:', error);
            const button = event.target;
            button.textContent = '❌ Fehler beim Download';
            setTimeout(() => {
                button.textContent = '📦 Pack herunterladen';
                button.disabled = false;
            }, 2000);
        }
    }

    // Setup smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Utility method to show messages
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameAsset = new GameAssetWebsite();
});

// Add some CSS for the image placeholder
const style = document.createElement('style');
style.textContent = `
    .asset-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4rem;
        background: var(--background-gray);
        color: var(--text-secondary);
    }
    
    .asset-image-container {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .message {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);