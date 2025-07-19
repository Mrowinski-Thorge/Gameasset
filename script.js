// Game Asset Collection JavaScript
class GameAssetCollection {
    constructor() {
        this.assets = [];
        this.filteredAssets = [];
        this.config = null;
        this.init();
    }

    async init() {
        console.log('Initializing Game Asset Collection...');
        try {
            await this.loadConfig();
            console.log('Config loaded:', this.config);
            this.setupEventListeners();
            await this.loadAssets();
            console.log('Assets loaded:', this.assets);
            this.renderAssets();
            this.updateStats();
            console.log('Initialization complete');
        } catch (error) {
            console.error('Failed to initialize Game Asset Collection:', error);
            this.showError();
        }
    }

    async loadConfig() {
        console.log('Loading configuration...');
        try {
            // For GitHub Pages, we'll load the config from the YAML file via fetch
            const response = await fetch('assets-config.yaml');
            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }
            const yamlText = await response.text();
            console.log('YAML text loaded, length:', yamlText.length);
            this.config = this.parseYAML(yamlText);
            console.log('Config parsed successfully');
        } catch (error) {
            console.warn('Could not load assets-config.yaml, using fallback data:', error);
            this.config = this.getFallbackConfig();
        }
    }

    parseYAML(yamlText) {
        // Simple YAML parser for our specific format
        console.log('Parsing YAML...');
        const lines = yamlText.split('\n');
        let config = { asset_packs: [], website: {}, categories: [], styles: [] };
        let currentPack = null;
        let currentSection = null;
        let currentArrayKey = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const originalLine = line;
            line = line.replace(/\r$/, ''); // Remove carriage return
            
            if (!line.trim() || line.trim().startsWith('#')) continue;

            // Detect main sections
            if (line.match(/^asset_packs:/)) {
                currentSection = 'asset_packs';
                continue;
            } else if (line.match(/^website:/)) {
                currentSection = 'website';
                continue;
            } else if (line.match(/^categories:/)) {
                currentSection = 'categories';
                continue;
            } else if (line.match(/^styles:/)) {
                currentSection = 'styles';
                continue;
            }

            // Parse asset packs
            if (currentSection === 'asset_packs') {
                if (line.match(/^  - id:/)) {
                    // Save previous pack if exists
                    if (currentPack) {
                        config.asset_packs.push(currentPack);
                    }
                    // Start new pack
                    const id = line.replace(/^  - id:\s*/, '').replace(/['"]/g, '');
                    currentPack = { id: id, tags: [], files: [] };
                    currentArrayKey = null;
                } else if (currentPack && line.match(/^    \w+:/)) {
                    const match = line.match(/^    (\w+):\s*(.*)/);
                    if (match) {
                        const key = match[1];
                        let value = match[2].replace(/['"]/g, '').trim();
                        
                        if (key === 'tags' || key === 'files') {
                            currentPack[key] = [];
                            currentArrayKey = key;
                        } else {
                            currentPack[key] = value;
                            currentArrayKey = null;
                        }
                    }
                } else if (currentPack && currentArrayKey && line.match(/^      -/)) {
                    const value = line.replace(/^      -\s*/, '').replace(/['"]/g, '').trim();
                    if (value) {
                        currentPack[currentArrayKey].push(value);
                    }
                }
            }
            
            // Parse website section
            else if (currentSection === 'website' && line.match(/^  \w+:/)) {
                const match = line.match(/^  (\w+):\s*(.*)/);
                if (match) {
                    const key = match[1];
                    const value = match[2].replace(/['"]/g, '').trim();
                    config.website[key] = value;
                }
            }
            
            // Parse categories and styles
            else if ((currentSection === 'categories' || currentSection === 'styles') && line.match(/^  -/)) {
                const value = line.replace(/^  -\s*/, '').replace(/['"]/g, '').trim();
                if (value) {
                    config[currentSection].push(value);
                }
            }
        }

        // Don't forget the last pack
        if (currentPack) {
            config.asset_packs.push(currentPack);
        }

        console.log('Parsed config:', config);
        return config;
    }

    getFallbackConfig() {
        return {
            asset_packs: [
                {
                    id: 'cartoon-formula-1',
                    name: 'Cartoon Formula 1',
                    description: 'Colorful cartoon-style Formula 1 racing assets perfect for arcade racing games',
                    category: 'Vehicles',
                    style: 'Cartoon',
                    tags: ['racing', 'car', 'formula1', 'cartoon', 'colorful'],
                    preview_image: 'assets/packs/cartoon-formula-1/racecar.png',
                    folder_path: 'assets/packs/cartoon-formula-1',
                    files: ['racecar.png'],
                    file_count: 1,
                    total_size: '1.4MB',
                    license: 'Free for commercial use',
                    created_date: '2025-01-19'
                },
                {
                    id: 'realistic-cyberpunk',
                    name: 'Realistic Cyberpunk Collection',
                    description: 'High-quality realistic cyberpunk-themed assets including vehicles, characters, and buildings',
                    category: 'Cyberpunk',
                    style: 'Realistic',
                    tags: ['cyberpunk', 'futuristic', 'realistic', 'vehicles', 'characters', 'buildings'],
                    preview_image: 'assets/packs/realistic_cyberpunk/cyborg_1.png',
                    folder_path: 'assets/packs/realistic_cyberpunk',
                    files: ['bus.png', 'cyborg_1.png', 'foodtruck.png', 'school.png', 'techshop.png'],
                    file_count: 5,
                    total_size: '8.6MB',
                    license: 'Free for commercial use',
                    created_date: '2025-01-19'
                }
            ],
            website: {
                title: 'Game Asset Collection',
                subtitle: 'Free Game Assets for Developers',
                gpt_link: 'https://chatgpt.com/g/g-687994dccfac8191836246ad2682ea59-game-asset-lab'
            },
            categories: ['Vehicles', 'Characters', 'Buildings', 'Cyberpunk'],
            styles: ['Cartoon', 'Realistic', 'Pixel Art', 'Low Poly']
        };
    }

    async loadAssets() {
        console.log('Loading assets...');
        if (!this.config || !this.config.asset_packs || this.config.asset_packs.length === 0) {
            console.warn('No asset configuration found, using fallback');
            this.config = this.getFallbackConfig();
        }

        this.assets = this.config.asset_packs;
        this.filteredAssets = [...this.assets];
        console.log('Assets loaded:', this.assets.length, 'packs');
        
        // Populate filter dropdowns
        this.populateFilters();
    }

    populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const styleFilter = document.getElementById('styleFilter');

        if (this.config.categories) {
            this.config.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }

        if (this.config.styles) {
            this.config.styles.forEach(style => {
                const option = document.createElement('option');
                option.value = style;
                option.textContent = style;
                styleFilter.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Filter event listeners
        const categoryFilter = document.getElementById('categoryFilter');
        const styleFilter = document.getElementById('styleFilter');
        const searchFilter = document.getElementById('searchFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterAssets());
        }

        if (styleFilter) {
            styleFilter.addEventListener('change', () => this.filterAssets());
        }

        if (searchFilter) {
            searchFilter.addEventListener('input', this.debounce(() => this.filterAssets(), 300));
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    filterAssets() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const styleFilter = document.getElementById('styleFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredAssets = this.assets.filter(asset => {
            const matchesCategory = !categoryFilter || asset.category === categoryFilter;
            const matchesStyle = !styleFilter || asset.style === styleFilter;
            const matchesSearch = !searchFilter || 
                asset.name.toLowerCase().includes(searchFilter) ||
                asset.description.toLowerCase().includes(searchFilter) ||
                asset.tags.some(tag => tag.toLowerCase().includes(searchFilter));

            return matchesCategory && matchesStyle && matchesSearch;
        });

        this.renderAssets();
    }

    renderAssets() {
        const assetsGrid = document.getElementById('assetsGrid');
        if (!assetsGrid) return;

        if (this.filteredAssets.length === 0) {
            assetsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No assets found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        assetsGrid.innerHTML = this.filteredAssets.map(asset => this.renderAssetCard(asset)).join('');
    }

    renderAssetCard(asset) {
        const tags = asset.tags ? asset.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        const files = asset.files || [];
        
        return `
            <div class="asset-card" data-id="${asset.id}">
                <div class="asset-preview">
                    <img src="${asset.preview_image}" 
                         alt="${asset.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjRDFEMUQ2Ii8+CjxwYXRoIGQ9Ik0xNDEuMjUgOTMuNzVMMTU4Ljc1IDExMS4yNUwxNDEuMjUgMTI4Ljc1VjkzLjc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'"
                         loading="lazy">
                </div>
                <div class="asset-info">
                    <h3>${asset.name}</h3>
                    <p class="asset-description">${asset.description}</p>
                    <div class="asset-tags">${tags}</div>
                    <div class="asset-meta">
                        <span><i class="fas fa-folder"></i> ${asset.file_count} file(s)</span>
                        <span><i class="fas fa-hdd"></i> ${asset.total_size}</span>
                    </div>
                    <div class="asset-actions">
                        <button class="btn btn-primary btn-small" onclick="gameAssets.downloadAsset('${asset.id}')">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="gameAssets.previewAsset('${asset.id}')">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async downloadAsset(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        try {
            // Create a simple download mechanism
            if (asset.files && asset.files.length === 1) {
                // Single file download
                const fileUrl = `${asset.folder_path}/${asset.files[0]}`;
                this.downloadFile(fileUrl, asset.files[0]);
            } else {
                // Multiple files - show download modal or create zip
                this.showDownloadModal(asset);
            }
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('Download failed. Please try again.', 'error');
        }
    }

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Downloading ${filename}...`, 'success');
    }

    showDownloadModal(asset) {
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-download"></i> Download ${asset.name}</h3>
                    <button class="modal-close" onclick="this.closest('.download-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Select files to download:</p>
                    <div class="file-list">
                        ${asset.files.map(file => `
                            <div class="file-item">
                                <input type="checkbox" id="file-${file}" checked>
                                <label for="file-${file}">
                                    <i class="fas fa-file"></i>
                                    ${file}
                                </label>
                                <button class="btn-small btn-secondary" onclick="gameAssets.downloadFile('${asset.folder_path}/${file}', '${file}')">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="gameAssets.downloadSelected('${asset.id}')">
                        <i class="fas fa-download"></i>
                        Download Selected
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.download-modal').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    downloadSelected(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        const modal = document.querySelector('.download-modal');
        const checkedBoxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        
        checkedBoxes.forEach(checkbox => {
            const fileId = checkbox.id.replace('file-', '');
            this.downloadFile(`${asset.folder_path}/${fileId}`, fileId);
        });

        modal.remove();
    }

    previewAsset(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-eye"></i> ${asset.name} Preview</h3>
                    <button class="modal-close" onclick="this.closest('.preview-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="preview-grid">
                        ${asset.files.map(file => `
                            <div class="preview-item">
                                <img src="${asset.folder_path}/${file}" 
                                     alt="${file}"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div class="preview-fallback" style="display: none;">
                                    <i class="fas fa-file"></i>
                                    <span>${file}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="asset-details">
                        <h4>Asset Details</h4>
                        <p><strong>Category:</strong> ${asset.category}</p>
                        <p><strong>Style:</strong> ${asset.style}</p>
                        <p><strong>Files:</strong> ${asset.file_count}</p>
                        <p><strong>Total Size:</strong> ${asset.total_size}</p>
                        <p><strong>License:</strong> ${asset.license}</p>
                        <div class="asset-tags">${asset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="gameAssets.downloadAsset('${asset.id}'); this.closest('.preview-modal').remove();">
                        <i class="fas fa-download"></i>
                        Download Asset
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError() {
        const assetsGrid = document.getElementById('assetsGrid');
        if (assetsGrid) {
            assetsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load assets</h3>
                    <p>Please check your internet connection and try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            `;
        }
    }

    updateStats() {
        const assetCountEl = document.getElementById('assetCount');
        if (assetCountEl && this.assets) {
            assetCountEl.textContent = this.assets.length;
        }
    }
}

// Additional CSS for modals and notifications (injected via JavaScript)
const additionalCSS = `
.download-modal,
.preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-lg);
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.modal-large {
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
}

.modal-close:hover {
    color: var(--text-primary);
}

.modal-body {
    padding: 1.5rem;
    max-height: 50vh;
    overflow-y: auto;
}

.modal-actions {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
}

.file-item label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.preview-item {
    aspect-ratio: 1;
    background: var(--gray-100);
    border-radius: var(--border-radius);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.asset-details h4 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.asset-details p {
    margin-bottom: 0.5rem;
    font-size: var(--font-size-sm);
}

.notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 3000;
    transform: translateX(100%);
    opacity: 0;
    transition: all var(--transition-base);
    max-width: 300px;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-success i {
    color: var(--success-color);
}

.notification-error {
    border-left: 4px solid #ef4444;
}

.notification-error i {
    color: #ef4444;
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification-info i {
    color: var(--primary-color);
}

.no-results,
.error-message {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    grid-column: 1 / -1;
}

.no-results i,
.error-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-light);
}

.error-message i {
    color: #ef4444;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .notification {
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
    
    .modal-actions {
        flex-direction: column;
    }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
let gameAssets;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing Game Asset Collection...');
    gameAssets = new GameAssetCollection();
    window.gameAssets = gameAssets;
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOMContentLoaded hasn't fired yet
} else {
    // DOMContentLoaded has already fired
    console.log('DOM already loaded, initializing immediately...');
    gameAssets = new GameAssetCollection();
    window.gameAssets = gameAssets;
}