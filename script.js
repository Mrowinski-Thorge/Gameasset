// NeoBuilder - The Smart No-Code Studio
// Advanced drag-and-drop website builder with live preview

class NeoBuilder {
    constructor() {
        this.selectedElement = null;
        this.currentViewport = 'desktop';
        this.isDarkMode = false;
        this.project = {
            name: 'Unbenanntes Projekt',
            elements: [],
            styles: {},
            settings: {}
        };
        
        this.init();
    }

    async init() {
        try {
            // Show loading overlay
            this.showLoading();
            
            // Initialize core components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved project if exists
            this.loadProject();
            
            // Hide loading overlay
            this.hideLoading();
            
            // Show welcome toast
            this.showToast('Willkommen bei NeoBuilder!', 'success');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Fehler beim Laden der Anwendung', 'error');
        }
    }

    async initializeComponents() {
        // Initialize drag and drop
        this.initializeDragAndDrop();
        
        // Initialize preview iframe
        this.initializePreview();
        
        // Initialize viewport controls
        this.initializeViewportControls();
        
        // Initialize theme toggle
        this.initializeThemeToggle();
        
        // Initialize properties panel
        this.initializePropertiesPanel();
        
        // Initialize animation panel
        this.initializeAnimationPanel();
        
        // Initialize context menu
        this.initializeContextMenu();
        
        // Initialize export functionality
        this.initializeExport();
    }

    initializeDragAndDrop() {
        const elementItems = document.querySelectorAll('.element-item');
        
        elementItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const elementType = e.target.dataset.element;
                e.dataTransfer.setData('text/plain', elementType);
                e.target.classList.add('drag-ghost');
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('drag-ghost');
            });
        });
    }

    initializePreview() {
        const iframe = document.getElementById('preview-iframe');
        
        // Setup drop zone in iframe
        iframe.addEventListener('load', () => {
            const iframeDoc = iframe.contentDocument;
            const dropZone = iframeDoc.getElementById('drop-zone');
            
            if (dropZone) {
                this.setupIframeDropZone(dropZone, iframeDoc);
            }
        });
        
        // Setup preview actions
        document.getElementById('preview-refresh').addEventListener('click', () => {
            this.refreshPreview();
        });
        
        document.getElementById('preview-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    setupIframeDropZone(dropZone, iframeDoc) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const elementType = e.dataTransfer.getData('text/plain');
            this.createElement(elementType, e.clientX, e.clientY, iframeDoc);
        });
        
        // Setup element selection
        dropZone.addEventListener('click', (e) => {
            if (e.target !== dropZone) {
                this.selectElement(e.target);
            } else {
                this.deselectElement();
            }
        });
        
        // Setup context menu
        dropZone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target !== dropZone) {
                this.showContextMenu(e.clientX, e.clientY, e.target);
            }
        });
    }

    createElement(type, x, y, iframeDoc) {
        const element = this.generateElement(type);
        const dropZone = iframeDoc.getElementById('drop-zone');
        
        // If this is the first element, clear the drop zone placeholder
        if (dropZone.textContent.includes('Ziehen Sie Elemente')) {
            dropZone.innerHTML = '';
            dropZone.style.minHeight = 'auto';
            dropZone.style.display = 'block';
            dropZone.style.border = 'none';
            dropZone.style.background = 'transparent';
        }
        
        dropZone.appendChild(element);
        this.selectElement(element);
        
        // Save to project
        this.saveElementToProject(element, type);
        
        this.showToast(`${this.getElementDisplayName(type)} hinzugefügt`, 'success');
    }

    generateElement(type) {
        const element = document.createElement('div');
        element.className = 'nb-element';
        element.dataset.elementType = type;
        element.dataset.elementId = this.generateElementId();
        
        // Apply default styles
        this.applyDefaultStyles(element, type);
        
        // Generate content based on type
        switch (type) {
            case 'text':
                element.innerHTML = '<p>Beispieltext. Klicken Sie hier zum Bearbeiten.</p>';
                break;
            case 'heading':
                element.innerHTML = '<h2>Überschrift</h2>';
                break;
            case 'button':
                element.innerHTML = '<button class="nb-button">Button</button>';
                break;
            case 'container':
                element.innerHTML = '<div class="nb-container">Container</div>';
                break;
            case 'section':
                element.innerHTML = '<section class="nb-section">Section</section>';
                break;
            case 'grid':
                element.innerHTML = '<div class="nb-grid"><div>Spalte 1</div><div>Spalte 2</div></div>';
                break;
            case 'image':
                element.innerHTML = '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\' viewBox=\'0 0 200 150\'%3E%3Crect width=\'200\' height=\'150\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236b7280\'%3EBild%3C/text%3E%3C/svg%3E" alt="Placeholder">';
                break;
            case 'link':
                element.innerHTML = '<a href="#" class="nb-link">Link</a>';
                break;
            case 'input':
                element.innerHTML = '<input type="text" placeholder="Text eingeben" class="nb-input">';
                break;
            case 'textarea':
                element.innerHTML = '<textarea placeholder="Text eingeben" class="nb-textarea"></textarea>';
                break;
            case 'select':
                element.innerHTML = '<select class="nb-select"><option>Option 1</option><option>Option 2</option></select>';
                break;
            default:
                element.innerHTML = '<div>Element</div>';
        }
        
        return element;
    }

    applyDefaultStyles(element, type) {
        const styles = {
            text: {
                margin: '16px 0',
                padding: '8px',
                fontSize: '16px',
                lineHeight: '1.5'
            },
            heading: {
                margin: '24px 0 16px',
                padding: '8px',
                fontSize: '32px',
                fontWeight: '600'
            },
            button: {
                margin: '8px',
                padding: '12px 24px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
            },
            container: {
                margin: '16px 0',
                padding: '24px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
            },
            section: {
                margin: '32px 0',
                padding: '48px 24px',
                backgroundColor: '#ffffff'
            },
            grid: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                margin: '16px 0',
                padding: '16px'
            },
            image: {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px'
            },
            link: {
                color: '#007AFF',
                textDecoration: 'none',
                padding: '4px'
            },
            input: {
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
            },
            textarea: {
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
            },
            select: {
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
            }
        };
        
        const elementStyles = styles[type] || {};
        Object.assign(element.style, elementStyles);
    }

    initializeViewportControls() {
        const viewportBtns = document.querySelectorAll('.viewport-btn');
        
        viewportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewport = btn.dataset.viewport;
                this.switchViewport(viewport);
            });
        });
    }

    switchViewport(viewport) {
        this.currentViewport = viewport;
        
        // Update active button
        document.querySelectorAll('.viewport-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewport === viewport);
        });
        
        // Update iframe class
        const iframe = document.getElementById('preview-iframe');
        iframe.className = `preview-iframe ${viewport}-view`;
        
        this.showToast(`Ansicht gewechselt zu ${this.getViewportDisplayName(viewport)}`, 'info');
    }

    initializeThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        
        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showToast(`${this.isDarkMode ? 'Dunkles' : 'Helles'} Design aktiviert`, 'info');
    }

    initializePropertiesPanel() {
        // Properties panel will be populated when elements are selected
    }

    selectElement(element) {
        // Remove previous selection
        this.deselectElement();
        
        // Add selection to new element
        element.classList.add('element-selected');
        this.selectedElement = element;
        
        // Update properties panel
        this.updatePropertiesPanel(element);
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('element-selected');
            this.selectedElement = null;
        }
        
        // Reset properties panel
        this.resetPropertiesPanel();
    }

    updatePropertiesPanel(element) {
        const propertiesContent = document.getElementById('properties-content');
        const elementType = element.dataset.elementType;
        
        propertiesContent.innerHTML = `
            <div class="property-group">
                <h4>Element</h4>
                <div class="property-row">
                    <span class="property-label">Typ</span>
                    <span class="property-value">${this.getElementDisplayName(elementType)}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">ID</span>
                    <span class="property-value">${element.dataset.elementId}</span>
                </div>
            </div>
            
            <div class="property-group">
                <h4>Layout</h4>
                <div class="property-row">
                    <label class="property-label">Breite</label>
                    <input type="text" class="property-input" data-property="width" 
                           value="${element.style.width || 'auto'}" placeholder="auto">
                </div>
                <div class="property-row">
                    <label class="property-label">Höhe</label>
                    <input type="text" class="property-input" data-property="height" 
                           value="${element.style.height || 'auto'}" placeholder="auto">
                </div>
                <div class="property-row">
                    <label class="property-label">Margin</label>
                    <input type="text" class="property-input" data-property="margin" 
                           value="${element.style.margin || '0'}" placeholder="0">
                </div>
                <div class="property-row">
                    <label class="property-label">Padding</label>
                    <input type="text" class="property-input" data-property="padding" 
                           value="${element.style.padding || '0'}" placeholder="0">
                </div>
            </div>
            
            <div class="property-group">
                <h4>Stil</h4>
                <div class="property-row">
                    <label class="property-label">Hintergrund</label>
                    <input type="color" class="color-picker" data-property="backgroundColor" 
                           value="${this.rgbToHex(element.style.backgroundColor) || '#ffffff'}">
                </div>
                <div class="property-row">
                    <label class="property-label">Textfarbe</label>
                    <input type="color" class="color-picker" data-property="color" 
                           value="${this.rgbToHex(element.style.color) || '#000000'}">
                </div>
                <div class="property-row">
                    <label class="property-label">Schriftgröße</label>
                    <input type="text" class="property-input" data-property="fontSize" 
                           value="${element.style.fontSize || '16px'}" placeholder="16px">
                </div>
                <div class="property-row">
                    <label class="property-label">Rahmen</label>
                    <input type="text" class="property-input" data-property="border" 
                           value="${element.style.border || 'none'}" placeholder="none">
                </div>
                <div class="property-row">
                    <label class="property-label">Radius</label>
                    <input type="text" class="property-input" data-property="borderRadius" 
                           value="${element.style.borderRadius || '0'}" placeholder="0">
                </div>
            </div>
            
            <div class="property-group">
                <h4>Aktionen</h4>
                <button class="btn-export" onclick="neoBuilder.duplicateElement()" style="width: 100%; margin-bottom: 8px;">
                    <i class="fas fa-copy"></i> Duplizieren
                </button>
                <button class="btn-export" onclick="neoBuilder.deleteElement()" style="width: 100%; background: var(--danger-color);">
                    <i class="fas fa-trash"></i> Löschen
                </button>
            </div>
        `;
        
        // Setup property change listeners
        this.setupPropertyListeners();
    }

    setupPropertyListeners() {
        const propertyInputs = document.querySelectorAll('.property-input, .color-picker');
        
        propertyInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const property = e.target.dataset.property;
                const value = e.target.value;
                
                if (this.selectedElement && property) {
                    this.selectedElement.style[property] = value;
                    this.saveProject();
                }
            });
        });
    }

    resetPropertiesPanel() {
        const propertiesContent = document.getElementById('properties-content');
        propertiesContent.innerHTML = `
            <div class="no-selection">
                <div class="no-selection-icon">
                    <i class="fas fa-mouse-pointer"></i>
                </div>
                <p>Wählen Sie ein Element aus, um die Eigenschaften zu bearbeiten</p>
            </div>
        `;
    }

    initializeAnimationPanel() {
        const animationPanel = document.getElementById('animation-panel');
        const closeBtn = document.getElementById('close-animation-panel');
        
        closeBtn.addEventListener('click', () => {
            animationPanel.classList.remove('show');
        });
        
        // Setup animation buttons
        const animationBtns = document.querySelectorAll('.animation-btn');
        animationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const animation = btn.dataset.animation;
                this.applyAnimation(animation);
                
                // Update active state
                animationBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Setup range inputs
        const durationInput = document.getElementById('animation-duration');
        const delayInput = document.getElementById('animation-delay');
        const durationValue = document.getElementById('duration-value');
        const delayValue = document.getElementById('delay-value');
        
        durationInput.addEventListener('input', (e) => {
            durationValue.textContent = e.target.value + 'ms';
        });
        
        delayInput.addEventListener('input', (e) => {
            delayValue.textContent = e.target.value + 'ms';
        });
    }

    initializeContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        
        // Hide context menu when clicking elsewhere
        document.addEventListener('click', () => {
            contextMenu.classList.remove('show');
        });
        
        // Setup context menu actions
        const contextItems = document.querySelectorAll('.context-menu-item');
        contextItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextAction(action);
                contextMenu.classList.remove('show');
            });
        });
    }

    showContextMenu(x, y, element) {
        const contextMenu = document.getElementById('context-menu');
        
        // Position context menu
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('show');
        
        // Store reference to target element
        this.contextMenuTarget = element;
    }

    handleContextAction(action) {
        if (!this.contextMenuTarget) return;
        
        switch (action) {
            case 'edit':
                this.selectElement(this.contextMenuTarget);
                break;
            case 'duplicate':
                this.duplicateElement(this.contextMenuTarget);
                break;
            case 'delete':
                this.deleteElement(this.contextMenuTarget);
                break;
            case 'animate':
                this.selectElement(this.contextMenuTarget);
                this.showAnimationPanel();
                break;
        }
    }

    initializeExport() {
        const exportBtn = document.getElementById('export-project');
        
        exportBtn.addEventListener('click', () => {
            this.exportProject();
        });
    }

    async exportProject() {
        try {
            this.showToast('Export wird vorbereitet...', 'info');
            
            const iframe = document.getElementById('preview-iframe');
            const iframeDoc = iframe.contentDocument;
            
            // Generate complete HTML
            const html = this.generateExportHTML(iframeDoc);
            
            // Create ZIP file
            if (typeof JSZip !== 'undefined') {
                await this.createExportZip(html);
            } else {
                // Fallback: download HTML file directly
                this.downloadFile('index.html', html, 'text/html');
            }
            
            this.showToast('Export erfolgreich!', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Fehler beim Export', 'error');
        }
    }

    generateExportHTML(iframeDoc) {
        const dropZone = iframeDoc.getElementById('drop-zone');
        const content = dropZone.innerHTML;
        
        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.project.name}</title>
    <style>
        /* NeoBuilder Generated Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
            line-height: 1.6;
            color: #1D1D1F;
        }
        
        .nb-element {
            transition: all 0.3s ease;
        }
        
        .nb-button {
            display: inline-block;
            padding: 12px 24px;
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .nb-button:hover {
            background: #0051D5;
            transform: translateY(-2px);
        }
        
        .nb-container {
            padding: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        
        .nb-section {
            padding: 48px 24px;
            background: #ffffff;
        }
        
        .nb-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        
        .nb-link {
            color: #007AFF;
            text-decoration: none;
        }
        
        .nb-link:hover {
            text-decoration: underline;
        }
        
        .nb-input, .nb-textarea, .nb-select {
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
        }
        
        .nb-textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        img {
            max-width: 100%;
            height: auto;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .nb-grid {
                grid-template-columns: 1fr;
            }
            
            .nb-section {
                padding: 24px 16px;
            }
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from { 
                opacity: 0;
                transform: translateX(-30px);
            }
            to { 
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes zoomIn {
            from { 
                opacity: 0;
                transform: scale(0.8);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
    </style>
</head>
<body>
    ${content}
    
    <script>
        // Generated by NeoBuilder - The Smart No-Code Studio
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Website erstellt mit NeoBuilder - The Smart No-Code Studio');
            
            // Add scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                    }
                });
            }, observerOptions);
            
            // Observe all elements
            document.querySelectorAll('.nb-element').forEach(el => {
                observer.observe(el);
            });
        });
    </script>
</body>
</html>`;
    }

    async createExportZip(html) {
        const zip = new JSZip();
        
        // Add main HTML file
        zip.file('index.html', html);
        
        // Add README
        const readme = `# ${this.project.name}

Dieses Projekt wurde mit NeoBuilder erstellt - The Smart No-Code Studio.

## Installation

1. Entpacken Sie diese Datei
2. Öffnen Sie index.html in Ihrem Browser
3. Ihre Website ist bereit!

## Features

- Responsive Design
- Moderne CSS-Animationen
- Cross-Browser-Kompatibilität
- SEO-optimiert

---
Erstellt mit ❤️ von NeoBuilder
`;
        
        zip.file('README.md', readme);
        
        // Generate and download ZIP
        const content = await zip.generateAsync({type: 'blob'});
        this.downloadFile(`${this.project.name.replace(/\s+/g, '-')}.zip`, content, 'application/zip');
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility methods
    generateElementId() {
        return 'el_' + Math.random().toString(36).substr(2, 9);
    }

    getElementDisplayName(type) {
        const names = {
            text: 'Text',
            heading: 'Überschrift',
            button: 'Button',
            container: 'Container',
            section: 'Sektion',
            grid: 'Grid',
            image: 'Bild',
            link: 'Link',
            input: 'Eingabefeld',
            textarea: 'Textbereich',
            select: 'Auswahlliste'
        };
        return names[type] || type;
    }

    getViewportDisplayName(viewport) {
        const names = {
            desktop: 'Desktop',
            tablet: 'Tablet',
            mobile: 'Mobile'
        };
        return names[viewport] || viewport;
    }

    rgbToHex(rgb) {
        if (!rgb) return '#000000';
        
        const result = rgb.match(/\d+/g);
        if (!result) return rgb;
        
        return '#' + result.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    duplicateElement(element = this.selectedElement) {
        if (!element) return;
        
        const clone = element.cloneNode(true);
        clone.dataset.elementId = this.generateElementId();
        
        element.parentNode.insertBefore(clone, element.nextSibling);
        this.selectElement(clone);
        
        this.showToast('Element dupliziert', 'success');
    }

    deleteElement(element = this.selectedElement) {
        if (!element) return;
        
        if (confirm('Möchten Sie dieses Element wirklich löschen?')) {
            element.remove();
            this.deselectElement();
            this.showToast('Element gelöscht', 'success');
        }
    }

    showAnimationPanel() {
        const panel = document.getElementById('animation-panel');
        panel.classList.add('show');
    }

    applyAnimation(animation) {
        if (!this.selectedElement) return;
        
        const duration = document.getElementById('animation-duration').value;
        const delay = document.getElementById('animation-delay').value;
        
        this.selectedElement.style.animation = `${animation} ${duration}ms ease ${delay}ms forwards`;
        
        this.showToast(`Animation ${animation} angewendet`, 'success');
    }

    refreshPreview() {
        const iframe = document.getElementById('preview-iframe');
        iframe.src = iframe.src;
        this.showToast('Vorschau aktualisiert', 'info');
    }

    toggleFullscreen() {
        const container = document.querySelector('.preview-container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    saveProject() {
        try {
            localStorage.setItem('neobuilder_project', JSON.stringify(this.project));
        } catch (error) {
            console.warn('Could not save project:', error);
        }
    }

    loadProject() {
        try {
            const saved = localStorage.getItem('neobuilder_project');
            if (saved) {
                this.project = JSON.parse(saved);
                document.getElementById('project-name').textContent = this.project.name;
            }
        } catch (error) {
            console.warn('Could not load project:', error);
        }
    }

    saveElementToProject(element, type) {
        this.project.elements.push({
            id: element.dataset.elementId,
            type: type,
            styles: element.style.cssText,
            content: element.innerHTML
        });
        this.saveProject();
    }

    setupEventListeners() {
        // Save project button
        document.getElementById('save-project').addEventListener('click', () => {
            this.saveProject();
            this.showToast('Projekt gespeichert', 'success');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveProject();
                        this.showToast('Projekt gespeichert', 'success');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.duplicateElement();
                        break;
                    case 'z':
                        e.preventDefault();
                        // TODO: Implement undo
                        break;
                }
            }
            
            if (e.key === 'Delete' && this.selectedElement) {
                this.deleteElement();
            }
        });
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('hide');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hide');
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInToast 0.3s ease reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Manual close
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
    }
}

// Initialize NeoBuilder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.neoBuilder = new NeoBuilder();
});