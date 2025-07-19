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
        // In a real GitHub Pages environment, we would use GitHub API
        // For now, we'll use a static list based on known packs
        const knownPacks = [
            {
                name: 'cartoon-formula-1',
                displayName: 'Cartoon Formula 1',
                description: 'Bunte und verspielte Formula 1 Rennwagen im Cartoon-Stil. Perfekt für Arcade-Rennspiele.',
                files: ['racecar.png'],
                previewImage: 'assets/packs/cartoon-formula-1/racecar.png',
                category: 'Fahrzeuge',
                fileCount: 1
            },
            {
                name: 'realistic_cyberpunk',
                displayName: 'Realistic Cyberpunk',
                description: 'Futuristische Cyberpunk-Assets mit realistischem Design. Ideal für Science-Fiction Spiele.',
                files: [],
                previewImage: null,
                category: 'Sci-Fi',
                fileCount: 0
            }
        ];

        // Try to get actual file listings (this would work with GitHub API in production)
        for (let pack of knownPacks) {
            try {
                const response = await fetch(`assets/packs/${pack.name}/`);
                if (response.ok) {
                    // In a real implementation, parse directory listing or use GitHub API
                    pack.available = true;
                }
            } catch (error) {
                pack.available = true; // Assume available for demo
            }
        }

        return knownPacks.filter(pack => pack.available !== false);
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

    // Download asset pack as ZIP
    async downloadPack(packName) {
        try {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '⏳ Wird vorbereitet...';
            button.disabled = true;

            // In a real implementation, this would create a ZIP file
            // For now, we'll simulate the download process
            
            await this.simulatePackDownload(packName);
            
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

    // Simulate pack download (in production, this would create actual ZIP files)
    async simulatePackDownload(packName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real implementation, we would:
                // 1. Fetch all files in the pack directory
                // 2. Create a ZIP file using JSZip library
                // 3. Trigger download
                
                console.log(`Download simuliert für Pack: ${packName}`);
                
                // Create a simple text file as demonstration
                const content = `Asset Pack: ${packName}\nHeruntergeladen am: ${new Date().toLocaleString('de-DE')}\n\nDies ist eine Demo-Datei. In der echten Implementierung würden hier die Asset-Dateien als ZIP-Paket heruntergeladen.`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${packName}-demo.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                resolve();
            }, 1500);
        });
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