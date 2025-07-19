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
        const knownPacks = [
            {
                name: 'cartoon-formula-1',
                displayName: 'Cartoon Formula 1',
                description: 'Bunte und verspielte Formula 1 Rennwagen im Cartoon-Stil. Perfekt für Arcade-Rennspiele mit dynamischen Fahrzeugen.',
                files: ['racecar.png'],
                previewImage: 'assets/packs/cartoon-formula-1/racecar.png',
                category: 'Fahrzeuge',
                fileCount: 1,
                tags: ['Racing', 'Cartoon', 'Vehicles']
            },
            {
                name: 'realistic_cyberpunk',
                displayName: 'Realistic Cyberpunk',
                description: 'Umfangreiche Cyberpunk-Assets mit realistischem Design. Enthält Charaktere, Gebäude und Fahrzeuge für futuristische Welten.',
                files: ['foodtruck.png', 'techshop.png', 'bus.png', 'bar.png', 'cyborg_1.png', 'school.png'],
                previewImage: 'assets/packs/realistic_cyberpunk/cyborg_1.png',
                category: 'Sci-Fi',
                fileCount: 6,
                tags: ['Cyberpunk', 'Futuristic', 'Characters', 'Buildings']
            }
        ];

        // Enhance pack data by checking file availability
        for (let pack of knownPacks) {
            try {
                // Try to load the preview image to verify pack availability
                if (pack.previewImage) {
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = pack.previewImage;
                    });
                }
                pack.available = true;
            } catch (error) {
                // If preview image fails, try alternative preview
                if (pack.files.length > 0) {
                    try {
                        const altImg = new Image();
                        await new Promise((resolve, reject) => {
                            altImg.onload = resolve;
                            altImg.onerror = reject;
                            altImg.src = `assets/packs/${pack.name}/${pack.files[0]}`;
                        });
                        pack.previewImage = `assets/packs/${pack.name}/${pack.files[0]}`;
                        pack.available = true;
                    } catch (altError) {
                        pack.available = true; // Still include pack but without preview
                        pack.previewImage = null;
                    }
                } else {
                    pack.available = true;
                }
            }
        }

        return knownPacks.filter(pack => pack.available !== false);
    }

    // Create asset pack card element
    createAssetCard(pack) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        
        const hasPreview = pack.previewImage && pack.previewImage !== null;
        const tags = pack.tags || [];
        
        card.innerHTML = `
            <div class="asset-image-container">
                ${hasPreview ? 
                    `<img src="${pack.previewImage}" alt="${pack.displayName}" class="asset-image" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=&quot;asset-image-placeholder&quot;>🎮</div>'">` :
                    `<div class="asset-image asset-image-placeholder">🎮</div>`
                }
                <div class="asset-overlay">
                    <span class="asset-category-badge">${pack.category}</span>
                </div>
            </div>
            <div class="asset-content">
                <h3 class="asset-title">${pack.displayName}</h3>
                <p class="asset-description">${pack.description}</p>
                ${tags.length > 0 ? `
                    <div class="asset-tags">
                        ${tags.map(tag => `<span class="asset-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="asset-meta">
                    <span class="asset-count">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>
                        ${pack.fileCount} Dateien
                    </span>
                    <span class="asset-size">Kostenlos</span>
                </div>
                <button class="asset-download" onclick="gameAsset.downloadPack('${pack.name}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Pack herunterladen
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

// Add some CSS for enhanced styling
const style = document.createElement('style');
style.textContent = `
    .asset-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4rem;
        background: linear-gradient(135deg, var(--background-gray) 0%, #f3f4f6 100%);
        color: var(--text-secondary);
        width: 100%;
        height: 100%;
        transition: all 0.3s ease;
    }
    
    .asset-card:hover .asset-image-placeholder {
        background: linear-gradient(135deg, #e5e7eb 0%, var(--background-gray) 100%);
        transform: scale(1.05);
    }
    
    .message {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.75rem;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .info-message {
        background: rgba(59, 130, 246, 0.9);
        color: white;
    }
    
    .error-message {
        background: rgba(239, 68, 68, 0.9);
        color: white;
    }
    
    .success-message {
        background: rgba(16, 185, 129, 0.9);
        color: white;
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
    
    /* Enhanced navigation styling */
    .nav-menu {
        align-items: center;
    }
    
    .nav-link {
        position: relative;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
    }
    
    .nav-link:hover {
        background: rgba(37, 99, 235, 0.1);
        color: var(--primary-color);
    }
    
    .nav-link:active {
        background: rgba(37, 99, 235, 0.15);
    }
    
    /* Improved button styles */
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    .btn:hover::before {
        left: 100%;
    }
    
    /* Enhanced loading animation */
    .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(37, 99, 235, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Subtle animations for feature cards */
    .feature-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);