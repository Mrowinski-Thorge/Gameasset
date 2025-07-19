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

        // Enhanced asset icons for animation
        const assetIcons = [
            '🎮', '⚔️', '🏰', '🧙‍♂️', '🐉', '💎', 
            '🏹', '🛡️', '👑', '🗡️', '🧪', '📜',
            '🎯', '🔮', '⭐', '🎨', '🎲', '🎪',
            '🚗', '🚀', '🌟', '💰', '🔥', '❄️'
        ];

        // Create more floating asset elements with varied sizes
        for (let i = 0; i < 8; i++) {
            const asset = document.createElement('div');
            asset.className = 'floating-asset';
            asset.textContent = assetIcons[i % assetIcons.length];
            
            // Vary the animation timing and size
            asset.style.animationDelay = `${i * 0.7}s`;
            asset.style.animationDuration = `${4 + Math.random() * 4}s`;
            
            // Add size variation
            if (i % 3 === 0) {
                asset.classList.add('large-asset');
            } else if (i % 3 === 1) {
                asset.classList.add('small-asset');
            }
            
            floatingContainer.appendChild(asset);
        }

        // Enhanced mouse interaction with more natural movement
        floatingContainer.addEventListener('mousemove', (e) => {
            const rect = floatingContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            document.querySelectorAll('.floating-asset').forEach((asset, index) => {
                const factor = 0.3 + (index % 3) * 0.2; // Vary the movement factor
                const xOffset = (x - 0.5) * 30 * factor;
                const yOffset = (y - 0.5) * 30 * factor;
                const rotation = (x - 0.5) * 15 * factor;
                
                asset.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`;
            });
        });

        // Reset animation on mouse leave
        floatingContainer.addEventListener('mouseleave', () => {
            document.querySelectorAll('.floating-asset').forEach(asset => {
                asset.style.transform = '';
            });
        });

        // Add periodic sparkle effect
        setInterval(() => {
            this.addSparkleEffect(floatingContainer);
        }, 3000);
    }

    // Add sparkle effect to hero section
    addSparkleEffect(container) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.textContent = '✨';
        
        // Random position
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        
        container.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
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
        // Try to dynamically detect from GitHub API first, fallback to static list
        try {
            const dynamicPacks = await this.detectPacksFromGitHub();
            if (dynamicPacks.length > 0) {
                return dynamicPacks;
            }
        } catch (error) {
            console.warn('GitHub API detection failed, using static configuration:', error);
        }

        // Fallback to static asset pack definitions
        const assetPacks = [
            {
                name: 'cartoon-formula-1',
                displayName: 'Cartoon Formula 1',
                description: 'Bunte und verspielte Formula 1 Rennwagen im Cartoon-Stil. Perfekt für Arcade-Rennspiele und familienfreundliche Racing-Games.',
                files: ['racecar.png'],
                previewImage: 'assets/packs/cartoon-formula-1/racecar.png',
                category: 'Fahrzeuge',
                fileCount: 1,
                tags: ['Rennwagen', 'Cartoon', 'Arcade', 'Racing']
            },
            {
                name: 'realistic_cyberpunk',
                displayName: 'Realistic Cyberpunk',
                description: 'Umfassende Sammlung futuristischer Cyberpunk-Assets mit realistischem Design. Enthält Gebäude, Charaktere und Fahrzeuge für dystopische Zukunftswelten.',
                files: ['bar.png', 'bus.png', 'cyborg_1.png', 'foodtruck.png', 'school.png', 'techshop.png'],
                previewImage: 'assets/packs/realistic_cyberpunk/cyborg_1.png',
                category: 'Sci-Fi',
                fileCount: 6,
                tags: ['Cyberpunk', 'Futuristisch', 'Realistisch', 'Charaktere', 'Gebäude']
            }
        ];

        // Verify that asset files actually exist
        for (let pack of assetPacks) {
            try {
                // Test if the preview image exists
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = pack.previewImage;
                });
                pack.available = true;
                pack.previewImageValid = true;
            } catch (error) {
                // If preview image fails, try to use first available file or fallback
                console.warn(`Preview image not found for ${pack.name}:`, error);
                pack.available = true;
                pack.previewImageValid = false;
                
                // Try to find an alternative preview image from the files list
                if (pack.files.length > 0) {
                    pack.previewImage = `assets/packs/${pack.name}/${pack.files[0]}`;
                }
            }
        }

        return assetPacks.filter(pack => pack.available);
    }

    // Detect asset packs using GitHub API (for production)
    async detectPacksFromGitHub() {
        // This would be used in production to automatically detect new asset packs
        // For now, return empty array to use fallback
        return [];
        
        /* Example implementation for GitHub Pages:
        const repo = 'Mrowinski-Thorge/Gameasset';
        const path = 'assets/packs';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) return [];
            
            const contents = await response.json();
            const packs = [];
            
            for (const item of contents) {
                if (item.type === 'dir') {
                    const packData = await this.analyzePackDirectory(repo, item.path);
                    if (packData) {
                        packs.push(packData);
                    }
                }
            }
            
            return packs;
        } catch (error) {
            console.error('GitHub API error:', error);
            return [];
        }
        */
    }

    // Create asset pack card element
    createAssetCard(pack) {
        const card = document.createElement('div');
        card.className = 'asset-card';
        
        const hasPreview = pack.previewImage && pack.previewImageValid !== false;
        const tagsHtml = pack.tags ? pack.tags.map(tag => `<span class="asset-tag">${tag}</span>`).join('') : '';
        
        card.innerHTML = `
            <div class="asset-image-container">
                ${hasPreview ? 
                    `<img src="${pack.previewImage}" alt="${pack.displayName}" class="asset-image" 
                         onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=&quot;asset-image-placeholder&quot;>${this.getPackIcon(pack.category)}</div>'">` :
                    `<div class="asset-image asset-image-placeholder">${this.getPackIcon(pack.category)}</div>`
                }
            </div>
            <div class="asset-content">
                <h3 class="asset-title">${pack.displayName}</h3>
                <p class="asset-description">${pack.description}</p>
                <div class="asset-tags">
                    ${tagsHtml}
                </div>
                <div class="asset-meta">
                    <span class="asset-category">${pack.category}</span>
                    <span class="asset-count">${pack.fileCount} ${pack.fileCount === 1 ? 'Datei' : 'Dateien'}</span>
                </div>
                <button class="asset-download" onclick="gameAsset.downloadPack('${pack.name}')">
                    📦 Pack herunterladen
                </button>
            </div>
        `;

        return card;
    }

    // Get appropriate icon for pack category
    getPackIcon(category) {
        const icons = {
            'Fahrzeuge': '🚗',
            'Sci-Fi': '🚀',
            'Fantasy': '🧙‍♂️',
            'Modern': '🏢',
            'Medieval': '🏰',
            'UI': '🎮',
            'Characters': '👥',
            'Default': '🎨'
        };
        return icons[category] || icons['Default'];
    }

    // Download asset pack as ZIP
    async downloadPack(packName) {
        try {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '⏳ Wird vorbereitet...';
            button.disabled = true;

            // Find the pack data
            const assetPacks = await this.detectAssetPacks();
            const pack = assetPacks.find(p => p.name === packName);
            
            if (!pack) {
                throw new Error('Asset-Pack nicht gefunden');
            }

            // Create ZIP file with actual assets
            await this.createAssetZip(pack);
            
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

    // Create ZIP file with actual asset files
    async createAssetZip(pack) {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            console.warn('JSZip not available, using fallback download');
            return this.fallbackPackDownload(pack);
        }

        const zip = new JSZip();
        const packFolder = zip.folder(pack.name);
        
        // Add a README file
        const readmeContent = `${pack.displayName}
${'='.repeat(pack.displayName.length)}

${pack.description}

Kategorie: ${pack.category}
Anzahl Dateien: ${pack.fileCount}
${pack.tags ? `Tags: ${pack.tags.join(', ')}` : ''}

Heruntergeladen am: ${new Date().toLocaleString('de-DE')}

Lizenz: Siehe AGB auf der Website für Nutzungsbedingungen.

---
GameAsset - Ihre Quelle für hochwertige Spiel-Assets
Website: https://gameasset.de
`;
        packFolder.file('README.txt', readmeContent);
        
        // Add asset files to ZIP
        let successCount = 0;
        for (const fileName of pack.files) {
            try {
                const response = await fetch(`assets/packs/${pack.name}/${fileName}`);
                if (response.ok) {
                    const blob = await response.blob();
                    packFolder.file(fileName, blob);
                    successCount++;
                } else {
                    console.warn(`Could not fetch ${fileName}`);
                }
            } catch (error) {
                console.warn(`Error fetching ${fileName}:`, error);
            }
        }
        
        if (successCount === 0) {
            throw new Error('Keine Asset-Dateien konnten geladen werden');
        }

        // Generate and download ZIP
        const content = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(content);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pack.name}-assets.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`ZIP created successfully with ${successCount} files`);
    }

    // Fallback download when JSZip is not available
    async fallbackPackDownload(pack) {
        // Download individual files or create a simple text file with instructions
        if (pack.files.length === 1) {
            // For single file packs, download the file directly
            try {
                const fileName = pack.files[0];
                const response = await fetch(`assets/packs/${pack.name}/${fileName}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log(`Single file downloaded: ${fileName}`);
                    return;
                }
            } catch (error) {
                console.warn('Direct download failed:', error);
            }
        }
        
        // Fallback: create instruction file
        const content = `Asset Pack Download: ${pack.displayName}
${'='.repeat(pack.displayName.length + 20)}

Dieses Pack enthält folgende Dateien:
${pack.files.map(f => `- ${f}`).join('\n')}

Da die automatische ZIP-Erstellung nicht verfügbar ist, 
besuchen Sie bitte die Website direkt und laden Sie die 
Dateien einzeln aus dem Ordner assets/packs/${pack.name}/ herunter.

Alternativ können Sie das komplette Repository von GitHub klonen:
git clone https://github.com/Mrowinski-Thorge/Gameasset.git

Pack-Informationen:
- Name: ${pack.displayName}
- Kategorie: ${pack.category}
- Beschreibung: ${pack.description}
${pack.tags ? `- Tags: ${pack.tags.join(', ')}` : ''}

Heruntergeladen am: ${new Date().toLocaleString('de-DE')}
`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pack.name}-download-info.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Fallback download info created');
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