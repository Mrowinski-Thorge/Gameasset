// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com/repos';
const REPO_OWNER = 'Mrowinski-Thorge';
const REPO_NAME = 'Gameasset';
const ASSETS_PATH = 'assets/packs';

// Asset type icons mapping
const ASSET_ICONS = {
    'cartoon': '🏎️',
    'formula': '🏁',
    'car': '🚗',
    'cyberpunk': '🤖',
    'realistic': '🏙️',
    'tech': '💻',
    'sci-fi': '🚀',
    'fantasy': '🏰',
    'medieval': '⚔️',
    'modern': '🏢',
    'default': '📦'
};

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getAssetIcon(assetName) {
    const name = assetName.toLowerCase();
    for (const [key, icon] of Object.entries(ASSET_ICONS)) {
        if (name.includes(key)) {
            return icon;
        }
    }
    return ASSET_ICONS.default;
}

function generateAssetDescription(assetName, fileCount) {
    const name = assetName.toLowerCase();
    let description = `Ein hochwertiges Asset-Paket mit ${fileCount} Datei${fileCount > 1 ? 'en' : ''}.`;
    
    if (name.includes('cartoon')) {
        description += ' Perfekt für Cartoon-Stil Spiele und fröhliche Projekte.';
    } else if (name.includes('cyberpunk') || name.includes('realistic')) {
        description += ' Ideal für futuristische und realistische Spielwelten.';
    } else if (name.includes('formula') || name.includes('car')) {
        description += ' Großartig für Rennspiele und Fahrzeug-basierte Projekte.';
    } else {
        description += ' Vielseitig einsetzbar für verschiedene Spielgenres.';
    }
    
    return description;
}

// GitHub API functions
async function fetchGitHubAPI(endpoint) {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/${REPO_OWNER}/${REPO_NAME}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GitHub API fetch error:', error);
        throw error;
    }
}

async function getAssetPacks() {
    try {
        // Get contents of assets/packs directory
        const packsData = await fetchGitHubAPI(`contents/${ASSETS_PATH}`);
        
        const assetPacks = [];
        
        for (const item of packsData) {
            if (item.type === 'file' && item.name.endsWith('.zip')) {
                // Direct ZIP file
                assetPacks.push({
                    name: item.name.replace('.zip', ''),
                    downloadUrl: item.download_url,
                    size: item.size,
                    type: 'zip'
                });
            } else if (item.type === 'dir') {
                // Directory - check if corresponding ZIP exists
                const zipName = `${item.name}.zip`;
                const zipExists = packsData.some(file => file.name === zipName);
                
                if (zipExists) {
                    // Get file count from directory
                    try {
                        const dirContents = await fetchGitHubAPI(`contents/${ASSETS_PATH}/${item.name}`);
                        const fileCount = dirContents.filter(file => file.type === 'file').length;
                        const zipFile = packsData.find(file => file.name === zipName);
                        
                        assetPacks.push({
                            name: item.name,
                            downloadUrl: zipFile.download_url,
                            size: zipFile.size,
                            fileCount: fileCount,
                            type: 'zip'
                        });
                    } catch (error) {
                        console.warn(`Could not fetch directory contents for ${item.name}:`, error);
                        // Fallback: add without file count
                        const zipFile = packsData.find(file => file.name === zipName);
                        if (zipFile) {
                            assetPacks.push({
                                name: item.name,
                                downloadUrl: zipFile.download_url,
                                size: zipFile.size,
                                fileCount: 1,
                                type: 'zip'
                            });
                        }
                    }
                }
            }
        }
        
        return assetPacks;
    } catch (error) {
        console.error('Error fetching asset packs:', error);
        throw error;
    }
}

// UI functions
function createAssetCard(asset) {
    const card = document.createElement('div');
    card.className = 'asset-card';
    
    const icon = getAssetIcon(asset.name);
    const description = generateAssetDescription(asset.name, asset.fileCount || 1);
    const formattedSize = formatFileSize(asset.size);
    
    card.innerHTML = `
        <span class="asset-icon">${icon}</span>
        <h3 class="asset-title">${asset.name.replace(/[-_]/g, ' ')}</h3>
        <p class="asset-description">${description}</p>
        <div class="asset-meta">
            <span class="asset-size">${formattedSize}</span>
            <span class="asset-count">📁 ${asset.fileCount || 1} Datei${(asset.fileCount || 1) > 1 ? 'en' : ''}</span>
        </div>
        <a href="${asset.downloadUrl}" class="download-button" download="${asset.name}.zip">
            <span>📥</span>
            Herunterladen
        </a>
    `;
    
    return card;
}

function showError(message) {
    const assetsGrid = document.getElementById('assetsGrid');
    assetsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.8);">
            <span style="font-size: 3rem; margin-bottom: 1rem; display: block;">😞</span>
            <h3 style="margin-bottom: 1rem;">Fehler beim Laden der Assets</h3>
            <p>${message}</p>
            <button onclick="loadAssets()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 5px; color: white; cursor: pointer;">
                Erneut versuchen
            </button>
        </div>
    `;
}

function showEmptyState() {
    const assetsGrid = document.getElementById('assetsGrid');
    assetsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.8);">
            <span style="font-size: 3rem; margin-bottom: 1rem; display: block;">📦</span>
            <h3 style="margin-bottom: 1rem;">Noch keine Assets verfügbar</h3>
            <p>Derzeit sind keine Asset-Pakete zum Download verfügbar.<br>Schauen Sie bald wieder vorbei!</p>
        </div>
    `;
}

// Main loading function
async function loadAssets() {
    const loading = document.getElementById('loading');
    const assetsGrid = document.getElementById('assetsGrid');
    
    // Show loading state
    loading.classList.remove('hidden');
    assetsGrid.innerHTML = '';
    
    try {
        const assetPacks = await getAssetPacks();
        
        // Hide loading
        loading.classList.add('hidden');
        
        if (assetPacks.length === 0) {
            showEmptyState();
            return;
        }
        
        // Create and add asset cards
        assetPacks.forEach((asset, index) => {
            const card = createAssetCard(asset);
            // Add staggered animation delay
            card.style.animationDelay = `${index * 0.1}s`;
            assetsGrid.appendChild(card);
        });
        
        console.log(`Loaded ${assetPacks.length} asset pack(s)`);
        
    } catch (error) {
        loading.classList.add('hidden');
        showError('Die Asset-Pakete konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        console.error('Failed to load assets:', error);
    }
}

// Download tracking (optional)
function trackDownload(assetName) {
    console.log(`Download started: ${assetName}`);
    // You could send analytics data here if needed
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Game Asset Lab website loaded');
    
    // Add download tracking to future download buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.download-button')) {
            const assetCard = e.target.closest('.asset-card');
            const assetName = assetCard.querySelector('.asset-title').textContent;
            trackDownload(assetName);
        }
    });
    
    // Load assets
    loadAssets();
});

// Add smooth scrolling for anchor links
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

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation when they come into view
document.addEventListener('DOMContentLoaded', function() {
    const animationElements = document.querySelectorAll('.asset-card, .cta-content');
    animationElements.forEach(el => observer.observe(el));
});