// Load and populate product data when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('product-data.json');
        const data = await response.json();
        populateProductTables(data);
    } catch (error) {
        console.error('Error loading product data:', error);
        // Fallback: populate with hardcoded data if JSON fails to load
        populateProductTablesManually();
    }
});

// Function to populate product tables from JSON data
function populateProductTables(data) {
    data.product_data.forEach(category => {
        const tableId = getCategoryTableId(category.category_bg);
        const tableBody = document.getElementById(tableId);
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            category.items.forEach((item, index) => {
                const row = createProductRow(item, index);
                tableBody.appendChild(row);
            });
        }
    });
}

// Function to get table ID based on category name
function getCategoryTableId(categoryName) {
    switch(categoryName) {
        case 'ПВЦ Пана':
            return 'pvc-panels-table';
        case 'ПВЦ Ламели':
            return 'pvc-lamels-table';
        case 'Самозалепващо фолио':
            return 'folio-table';
        case 'Лепила':
            return 'glue-table';
        case 'Алуминиеви лайсни':
            return 'aluminum-strips-table';
        default:
            return '';
    }
}

// Function to create a product row
function createProductRow(item, index) {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';

    // Create tds with data-labels for mobile
    const codeTd = document.createElement('td');
    codeTd.className = "px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm md:text-base font-mono text-gray-900";
    codeTd.setAttribute('data-label', 'Код');
    codeTd.textContent = item.code;

    const nameTd = document.createElement('td');
    nameTd.className = "px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm md:text-base font-medium text-gray-900";
    nameTd.setAttribute('data-label', 'Име на продукта');
    nameTd.textContent = item.name_bg;

    const imageTd = document.createElement('td');
    imageTd.className = "px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center";
    imageTd.setAttribute('data-label', 'Изображение');
    imageTd.innerHTML = `<img 
        src="images/product-${item.code}.jpeg" 
        data-jpg="images/product-${item.code}.jpg" 
        alt="${item.name_bg}" 
        class="w-20 h-16 object-contain mx-auto rounded cursor-pointer product-image-placeholder" 
        data-index="${index}" data-code="${item.code}"
        onerror="if(this.src.endsWith('.jpeg')) this.src=this.getAttribute('data-jpg'); else this.onerror=null; this.outerHTML='<div class=\'w-20 h-16 mx-auto rounded flex items-center justify-center text-xs text-gray-400\'>Изображение</div>';"
    >`;

    const sizeTd = document.createElement('td');
    sizeTd.className = "px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-xs sm:text-sm md:text-base text-center text-gray-700 font-mono";
    sizeTd.setAttribute('data-label', 'Размери (Ш/В/Д)');
    sizeTd.textContent = item.size_description_bg;

    const priceTd = document.createElement('td');
    priceTd.className = "px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center";
    priceTd.setAttribute('data-label', 'Цена');
    // Format price with two decimals and add currency
    let priceDisplay = (typeof item.price !== 'undefined' && item.price !== null) ? Number(item.price).toFixed(2) + ' лв.' : '—';
    priceTd.innerHTML = `<div class="bg-yellow-50 border border-yellow-200 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base text-yellow-700">
        ${priceDisplay}
    </div>`;

    row.appendChild(codeTd);
    row.appendChild(nameTd);
    row.appendChild(imageTd);
    row.appendChild(sizeTd);
    row.appendChild(priceTd);

    return row;
}

// --- Image Modal/Lightbox Logic ---

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const closeBtn = document.getElementById('image-modal-close');
    const nextBtn = document.getElementById('image-modal-next');
    const prevBtn = document.getElementById('image-modal-prev');
    let currentIndex = 0;
    let currentImages = [];

    // Collect all image placeholders
    function getAllPlaceholders() {
        return Array.from(document.querySelectorAll('.product-image-placeholder'));
    }

    function showModal(index) {
        currentImages = getAllPlaceholders();
        currentIndex = index;
        const code = currentImages[currentIndex].getAttribute('data-code');
        // Try .jpeg first, fallback to .jpg if not found
        const jpegSrc = `images/product-${code}.jpeg`;
        const jpgSrc = `images/product-${code}.jpg`;
        modalImg.onerror = function () {
            if (modalImg.src.endsWith('.jpeg')) {
                modalImg.src = jpgSrc;
            }
        };
        modalImg.src = jpegSrc;
        modal.classList.remove('hidden');
    }

    function hideModal() {
        modal.classList.add('hidden');
        modalImg.src = '';
    }

    function showNext() {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        showModal(currentIndex);
    }

    function showPrev() {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showModal(currentIndex);
    }

    // Click handlers
    document.body.addEventListener('click', function (e) {
        // Handle lamel gallery images and demo-gallery-img
        if (e.target.classList && (e.target.classList.contains('lamel-gallery-img') || e.target.classList.contains('demo-gallery-img'))) {
            const src = e.target.getAttribute('src');
            modalImg.onerror = null;
            modalImg.src = src;
            modal.classList.remove('hidden');
            return;
        }
        if (e.target.closest('.demo-image-placeholder')) {
            const placeholder = e.target.closest('.demo-image-placeholder');
            const code = placeholder.getAttribute('data-code');
            const demoSrc = `images/demo-${code}.png`;
            modalImg.onerror = null;
            modalImg.src = demoSrc;
            modal.classList.remove('hidden');
            return;
        }
        if (e.target.closest('.product-image-placeholder')) {
            const placeholder = e.target.closest('.product-image-placeholder');
            const placeholders = getAllPlaceholders();
            const idx = placeholders.indexOf(placeholder);
            showModal(idx);
        }
    });
    closeBtn.addEventListener('click', hideModal);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
    // Close modal on ESC
    document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') hideModal();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });
    // Close modal on overlay click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) hideModal();
    });
});

// Fallback function to populate tables manually if JSON loading fails
function populateProductTablesManually() {
    // ПВЦ Пана products
    const pvcPanels = [
        { code: 'AKIM-PVCP-001', name: 'ПВЦ Пано Вариация 1', size: '1220/2440/3 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCP-002', name: 'ПВЦ Пано Вариация 2', size: '1220/2440/3 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCP-003', name: 'ПВЦ Пано Вариация 3', size: '1220/2440/3 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCP-004', name: 'ПВЦ Пано Вариация 4', size: '1220/2440/3 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCP-005', name: 'ПВЦ Пано Вариация 5', size: '1220/2440/3 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCP-006', name: 'ПВЦ Пано Вариация 6', size: '1220/2440/3 мм (Ш/В/Д)' }
    ];

    // ПВЦ Ламели products
    const pvcLamels = [
        { code: 'AKIM-PVCL1-001', name: 'ПВЦ Ламел 155мм Вариация 1', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL1-002', name: 'ПВЦ Ламел 155мм Вариация 2', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL1-003', name: 'ПВЦ Ламел 155мм Вариация 3', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL1-004', name: 'ПВЦ Ламел 155мм Вариация 4', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL1-005', name: 'ПВЦ Ламел 155мм Вариация 5', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL1-006', name: 'ПВЦ Ламел 155мм Вариация 6', size: '155/2970/17 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-001', name: 'ПВЦ Ламел 165мм Вариация 1', size: '165/2970/20 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-002', name: 'ПВЦ Ламел 165мм Вариация 2', size: '165/2970/20 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-003', name: 'ПВЦ Ламел 165мм Вариация 3', size: '165/2970/20 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-004', name: 'ПВЦ Ламел 165мм Вариация 4', size: '165/2970/20 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-005', name: 'ПВЦ Ламел 165мм Вариация 5', size: '165/2970/20 мм (Ш/В/Д)' },
        { code: 'AKIM-PVCL2-006', name: 'ПВЦ Ламел 165мм Вариация 6', size: '165/2970/20 мм (Ш/В/Д)' }
    ];

    // Самозалепващо фолио products - updated to 5 variants
    const folio = [
        { code: 'AKIM-FOLI-001', name: 'Самозалепващо фолио Вариация 1', size: '1200/3000/2 мм (Ш/В/Д)' },
        { code: 'AKIM-FOLI-002', name: 'Самозалепващо фолио Вариация 2', size: '1200/3000/2 мм (Ш/В/Д)' },
        { code: 'AKIM-FOLI-003', name: 'Самозалепващо фолио Вариация 3', size: '1200/3000/2 мм (Ш/В/Д)' },
        { code: 'AKIM-FOLI-004', name: 'Самозалепващо фолио Вариация 4', size: '1200/3000/2 мм (Ш/В/Д)' },
        { code: 'AKIM-FOLI-005', name: 'Самозалепващо фолио Вариация 5', size: '1200/3000/2 мм (Ш/В/Д)' }
    ];

    // Лепила products
    const glue = [
        { code: 'AKIM-GLUE-001', name: 'Моментно лепило Moment One for all', size: '390 гр' }
    ];

    // Алуминиеви лайсни products - new category
    const aluminumStrips = [
        { code: 'AKIMAL-W', name: 'Алуминиева лайсна - Бяла', size: '~0/~0/3000 мм (Ш/В/Д)' },
        { code: 'AKIMAL-B', name: 'Алуминиева лайсна - Черна', size: '~0/~0/3000 мм (Ш/В/Д)' }
    ];

    // Fill tables manually
    fillTableManually('pvc-panels-table', pvcPanels);
    fillTableManually('pvc-lamels-table', pvcLamels);
    fillTableManually('folio-table', folio);
    fillTableManually('glue-table', glue);
    fillTableManually('aluminum-strips-table', aluminumStrips);
}

// Helper function to fill table manually
function fillTableManually(tableId, products) {
    const tableBody = document.getElementById(tableId);
    if (tableBody) {
        tableBody.innerHTML = '';
        
        products.forEach((product, index) => {
            const row = createProductRow({
                code: product.code,
                name_bg: product.name,
                size_description_bg: product.size
            }, index);
            tableBody.appendChild(row);
        });
    }
}

// Function to show demonstration sections
function showDemo(demoType) {
    const demoId = demoType + '-demo';
    let demoSection = document.getElementById(demoId);
    
    // For ПВЦ Пана and Самозалепващо фолио, show the first demo page
    if (!demoSection) {
        demoSection = document.getElementById(demoId + '-1');
    }
    
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Print optimization function
function optimizeForPrint() {
    document.querySelectorAll('.no-print').forEach(element => {
        element.style.display = 'none';
    });
}

// Add print event listeners
window.addEventListener('beforeprint', optimizeForPrint);
window.addEventListener('afterprint', function() {
    document.querySelectorAll('.no-print').forEach(element => {
        element.style.display = '';
    });
});

