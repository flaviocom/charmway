console.log("script.js carregado!");
const products = [
    { id: 0, name: "Complement hidratante para cabelos", catalogPrice: 53.9, weight: 0.17 },
    { id: 1, name: "Condicionador completive especial", catalogPrice: 53.9, weight: 0.31 },
    { id: 2, name: "Óleo de tratamento para cabelos", catalogPrice: 60.9, weight: 0.15 },
    { id: 3, name: "Shampoo especial aditivado", catalogPrice: 54.9, weight: 0.34 },
    { id: 4, name: "Shampoo para cabelos normais", catalogPrice: 53.9, weight: 0.35 },
    { id: 5, name: "Shampoo para cabelos oleosos", catalogPrice: 54.9, weight: 0.335 },
    { id: 6, name: "Shampoo para cabelos secos e danificados", catalogPrice: 53.9, weight: 0.325 },
    { id: 7, name: "Creme colágeno", catalogPrice: 69.9, weight: 0.075 },
    { id: 8, name: "Creme hidratante facial", catalogPrice: 54.9, weight: 0.075 },
    { id: 9, name: "Creme para limpeza facial", catalogPrice: 48.9, weight: 0.075 },
    { id: 10, name: "Gel facial esfoliante", catalogPrice: 48.9, weight: 0.08 },
    { id: 11, name: "Loção tônica facial", catalogPrice: 51.9, weight: 0.175 },
    { id: 12, name: "Óleo vitaminado para a pele facial", catalogPrice: 48.9, weight: 0.026 },
    { id: 13, name: "Máscara facial SPArgila amarela peel off", catalogPrice: 69.9, weight: 0.095 },
    { id: 14, name: "Creme para mãos e unhas", catalogPrice: 51.9, weight: 0.07 },
    { id: 15, name: "Creme para massagem corporal", catalogPrice: 69.9, weight: 0.176 },
    { id: 16, name: "Creme para os pés", catalogPrice: 51.9, weight: 0.075 },
    { id: 17, name: "Creme para os seios", catalogPrice: 51.9, weight: 0.076 },
    { id: 18, name: "Creme peeling", catalogPrice: 52.9, weight: 0.07 },
    { id: 19, name: "Lipo gel - Redutor de medidas", catalogPrice: 79.9, weight: 0.28 },
    { id: 20, name: "Loção cremosa camomila", catalogPrice: 58.9, weight: 0.282 },
    { id: 21, name: "Loção cremosa pepino", catalogPrice: 58.9, weight: 0.283 },
    { id: 22, name: "Óleo de tratamento cosmético para o corpo", catalogPrice: 69.9, weight: 0.152 },
    { id: 23, name: "Vela vegetal para massagem", catalogPrice: 65.9, weight: 0.109 },
    { id: 24, name: "Banho de ervas", catalogPrice: 58.9, weight: 0.18 },
    { id: 25, name: "Sabonete íntimo natural", catalogPrice: 69.9, weight: 0.228 },
    { id: 26, name: "Desodorante antiperspirante", catalogPrice: 51.9, weight: 0.075 },
    { id: 27, name: "Desodorante I", catalogPrice: 84.9, weight: 0.251 },
    { id: 28, name: "Desodorante II", catalogPrice: 84.9, weight: 0.249 },
    { id: 29, name: "Desodorante III", catalogPrice: 84.9, weight: 0.251 },
    { id: 30, name: "Desodorante IV", catalogPrice: 84.9, weight: 0.252 },
    { id: 31, name: "Desodorante V", catalogPrice: 84.9, weight: 0.247 },
    { id: 32, name: "Gel refrescante pós Barba", catalogPrice: 74.9, weight: 0.15 },
    { id: 33, name: "Catálogo", catalogPrice: 24.00, applyGeneralDiscount: false, weight: 0.094 },
    { id: 34, name: "Talão de consumidor", catalogPrice: 7.00, applyGeneralDiscount: false, weight: 0.07 }
];

// Configurações globais
const STORAGE_KEY = 'pedido-vendas-data';

// Estado da aplicação
let orderState = {
    resellerName: '',
    address: '',
    phone: '',
    attendanceBy: '',
    orderDate: '', // Vazio inicialmente
    creditPaid: 0,
    freight: 0,
    transportOption: '', // Nova propriedade para transporte
    installments: 1,
    generalDiscount: 0,
    paymentDays: [], // Vazio inicialmente
    notes: '',
    paymentMethods: {
        pix: {
            enabled: false,
            details: ''
        },
        transfer: {
            enabled: false,
            details: ''
        },
        boleto: {
            enabled: false
        },
        credit: {
            enabled: false,
            installments: 1
        }
    },
    products: products.map(product => ({
        ...product,
        quantity: 0,
        individualDiscount: null,
        lot: ''
    })),
    additionalProducts: [],
    packaging: []
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log("initializeApp: Iniciando...");
    loadSavedData();
    setCurrentDate(); // Chamado após loadSavedData para garantir que a data seja definida
    renderProductsTable();
    renderPackagingTable();
    setupEventListeners();
    updateSummary();
    updatePaymentDates();
    renderPaymentDaysInputs();
    updateInstallmentsText(); // MELHORIA 5: Atualizar texto singular/plural
    
    // Inicializar visibilidade do campo de parcelas do cartão de crédito
    const creditCheckbox = document.getElementById('payment-credit');
    if (creditCheckbox) {
        toggleCreditInstallmentsField(creditCheckbox.checked);
    }
    
    console.log("initializeApp: Finalizado.");
}

// Função para mostrar/ocultar campo de parcelas do cartão de crédito
function toggleCreditInstallmentsField(show) {
    const creditDetails = document.querySelector('.credit-card-details');
    if (creditDetails) {
        creditDetails.style.display = show ? 'flex' : 'none';
    }
}

// Função para definir data atual de Brasília
function setCurrentDate() {
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement && !orderDateElement.value) {
        // Obter data atual no fuso horário de Brasília (UTC-3)
        const now = new Date();
        const brasiliaOffset = -3 * 60; // UTC-3 em minutos
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
        
        // Formatar para YYYY-MM-DD
        const year = brasiliaTime.getFullYear();
        const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
        const day = String(brasiliaTime.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        orderDateElement.value = formattedDate;
        orderState.orderDate = formattedDate;
    }
    updatePaymentDates();
}

// MELHORIA 6: Função para renderizar campos de prazo com 3 dígitos
function renderPaymentDaysInputs() {
    const container = document.getElementById('payment-days-container');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 0; i < orderState.installments; i++) {
        const dayItem = document.createElement('div');
        dayItem.className = 'payment-day-item';
        
        // CORREÇÃO: Adicionar data dinâmica sem parênteses
        const orderDateElement = document.getElementById('order-date');
        const orderDate = orderDateElement ? new Date(orderDateElement.value) : new Date();
        const days = orderState.paymentDays[i] || 0;
        const paymentDate = new Date(orderDate.getTime() + (days + 1) * 24 * 60 * 60 * 1000);
        const formattedDate = days > 0 ? paymentDate.toLocaleDateString('pt-BR') : '(definir prazo)';
        
        dayItem.innerHTML = `\n            <label class=\"payment-day-label\">Prazo ${i + 1}ª Parcela</label>\n            <div style=\"display: flex; align-items: center; gap: 8px;\">\n                <input type=\"number\" \n                       id=\"payment-days-${i}\" \n                       value=\"${orderState.paymentDays[i] || ''}\" \n                       min=\"1\" \n                       max=\"999\"\n                       step=\"1\" \n                       data-installment-index=\"${i}\" \n                       class=\"payment-day-input payment-days-input\"\n                       placeholder=\"dias\"\n                       style=\"width: 60px;\">\n                <span class=\"payment-date-display\" id=\"payment-date-${i}\" style=\"font-size: 12px; color: #666;\">${formattedDate}</span>\n            </div>\n        `;
        container.appendChild(dayItem);
    }
}

// MELHORIA 5: Função para atualizar texto singular/plural
function updateInstallmentsText() {
    // Atualizar texto do Boleto
    const boletoLabel = document.getElementById('boleto-installments-label');
    const installmentsInput = document.getElementById('installments');
    if (boletoLabel && installmentsInput) {
        const count = parseInt(installmentsInput.value) || 1;
        boletoLabel.textContent = count === 1 ? 'Parcela' : 'Parcelas';
    }
    
    // Atualizar texto do Cartão de Crédito
    const creditLabel = document.getElementById('payment-installments-label');
    const creditInput = document.getElementById('payment-credit-installments');
    if (creditLabel && creditInput) {
        const count = parseInt(creditInput.value) || 1;
        creditLabel.textContent = count === 1 ? 'Parcela' : 'Parcelas';
    }
}

function updatePaymentDates() {
    const orderDateElement = document.getElementById('order-date');
    let orderDate;
    
    if (orderDateElement && orderDateElement.value) {
        // Corrigir a interpretação da data
        const dateValue = orderDateElement.value;
        // Se o valor está no formato incorreto, tentar corrigir
        if (dateValue.includes('-') && dateValue.length > 10) {
            // Formato incorreto detectado, usar data atual como fallback
            orderDate = new Date();
        } else {
            orderDate = new Date(dateValue + 'T00:00:00');
        }
    } else {
        orderDate = new Date();
    }
    
    const installmentsDetails = document.getElementById('installments-details');
    if (!installmentsDetails) return;
    
    installmentsDetails.innerHTML = '';

    const settlementValue = calculateSettlementValue();
    const installmentValue = settlementValue / orderState.installments;

    for (let i = 0; i < orderState.installments; i++) {
        const days = orderState.paymentDays[i] || 0;
        // Corrigir o cálculo: não adicionar +1 dia extra
        const paymentDate = new Date(orderDate.getTime() + days * 24 * 60 * 60 * 1000);
        const installmentItem = document.createElement('div');
        installmentItem.className = 'installment-item';
        
        if (orderState.installments === 1) {
            installmentItem.innerHTML = `<strong class=\"highlight-settlement-date\">Acerto até dia:</strong> <span class=\"highlight-settlement-date\">${paymentDate.toLocaleDateString('pt-BR')}</span>`;
        } else {
            installmentItem.innerHTML = `<strong>${i + 1}ª Parcela ${formatCurrency(installmentValue)} - <span class=\"highlight-settlement-date\">(Acerto até dia):</span></strong> <span class=\"highlight-settlement-date\">${paymentDate.toLocaleDateString('pt-BR')}</span>`;
        }
        
        installmentsDetails.appendChild(installmentItem);
    }
}

function loadSavedData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            orderState = {
                ...orderState,
                ...parsedData,
                products: orderState.products.map((p, i) => ({
                    ...p,
                    ...(parsedData.products && parsedData.products[i] ? parsedData.products[i] : {}),
                    individualDiscount: (parsedData.products && parsedData.products[i] && parsedData.products[i].individualDiscount !== undefined) ? parsedData.products[i].individualDiscount : null
                })),
                additionalProducts: parsedData.additionalProducts || [],
                packaging: parsedData.packaging || []
            };

            // Carregar dados nos campos, mas não sobrescrever a data se ela já foi definida
            document.getElementById('reseller-name').value = orderState.resellerName || '';
            document.getElementById('address').value = orderState.address || '';
            document.getElementById('phone').value = orderState.phone || '';
            document.getElementById('attendance-by').value = orderState.attendanceBy || '';
            
            // Só carregar a data salva se o campo ainda estiver vazio
            const orderDateElement = document.getElementById('order-date');
            if (orderDateElement && !orderDateElement.value && orderState.orderDate) {
                orderDateElement.value = orderState.orderDate;
            }
            
            document.getElementById('credit-paid').value = orderState.creditPaid || 0;
            document.getElementById('general-discount').value = orderState.generalDiscount || 0;
            document.getElementById('freight').value = orderState.freight || 0;
            document.getElementById('transport-select').value = orderState.transportOption || '';
            document.getElementById('installments').value = orderState.installments || 1;
            document.getElementById('notes').value = orderState.notes || '';
            
            // Carregar formas de pagamento
            if (orderState.paymentMethods) {
                document.getElementById('payment-pix').checked = orderState.paymentMethods.pix.enabled;
                document.getElementById('payment-pix-details').value = orderState.paymentMethods.pix.details;
                document.getElementById('payment-transfer').checked = orderState.paymentMethods.transfer.enabled;
                document.getElementById('payment-transfer-details').value = orderState.paymentMethods.transfer.details;
                document.getElementById('payment-boleto').checked = orderState.paymentMethods.boleto.enabled;
                document.getElementById('payment-credit').checked = orderState.paymentMethods.credit.enabled;
                document.getElementById('payment-credit-installments').value = orderState.paymentMethods.credit.installments;
            }
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orderState));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function renderProductsTable(productsToDisplay = orderState.products) {
    const tbody = document.getElementById("products-tbody");
    if (!tbody) {
        console.error("renderProductsTable: Elemento products-tbody não encontrado");
        return;
    }
    
    tbody.innerHTML = "";
    
    // CORREÇÃO: Sempre mostrar colunas de desconto (sempre true)
    const hasAnyDiscount = true;
    
    productsToDisplay.forEach((product, index) => {
        const row = createProductRow(product, index, false, hasAnyDiscount);
        tbody.appendChild(row);
    });

    orderState.additionalProducts.forEach((product, index) => {
        const row = createAdditionalProductRow(product, index, hasAnyDiscount);
        tbody.appendChild(row);
    });

    const addRow = document.createElement('tr');
    const colSpan = 7; // Agora são 7 colunas incluindo a coluna Lote
    addRow.innerHTML = `\n        <td colspan=\"${colSpan}\" style=\"text-align: right;\">\n            <button id=\"add-new-product-btn\" class=\"btn btn-secondary\">+ Adicionar outro item</button>\n        </td>\n    `;
    tbody.appendChild(addRow);

    updateTableHeader(hasAnyDiscount);
}

function checkIfHasAnyDiscount() {
    if (orderState.generalDiscount > 0) return true;
    
    for (let product of orderState.products) {
        if (product.individualDiscount !== null && product.individualDiscount > 0) return true;
    }
    
    for (let product of orderState.additionalProducts) {
        if (product.individualDiscount !== null && product.individualDiscount > 0) return true;
    }
    
    return false;
}

function updateTableHeader(hasAnyDiscount) {
    const thead = document.querySelector('.products-table thead tr');
    if (!thead) return;
    
    // CORREÇÃO: Sempre mostrar todas as colunas incluindo Lote
    thead.innerHTML = `\n        <th>Produto</th>\n        <th>Quantidade</th>\n        <th>Preço<br>Catálogo</th>\n        <th>Desconto<br>(%)</th>\n        <th>Preço c/<br>Desconto</th>\n        <th>Total<br>Item</th>\n        <th>Lote</th>\n    `;
}

function createProductRow(product, index, isCustom = false, hasAnyDiscount = true) {
    const row = document.createElement("tr");
    row.className = product.quantity > 0 ? "has-quantity" : "";
    
    let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : orderState.generalDiscount;
    if (product.applyGeneralDiscount === false) {
        effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
    }

    const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
    const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

    const discountColumn = hasAnyDiscount ? `\n        <td>\n            <input type=\"number\" \n                   value=\"${product.individualDiscount !== null ? product.individualDiscount : (product.applyGeneralDiscount !== false ? orderState.generalDiscount : '')}\" \n                   min=\"0\" \n                   max=\"100\"\n                   step=\"0.1\"\n                   placeholder=\"${product.applyGeneralDiscount === false ? "0.0" : orderState.generalDiscount.toFixed(1)}\"\n                   data-product-id=\"${product.id}\"\n                   class=\"discount-input ${product.individualDiscount !== null ? "highlight-discount" : ""}\">\n        </td>\n        <td class=\"price discounted-price\">${formatCurrency(discountedPrice)}</td>\n    ` : '';
    
    row.innerHTML = `\n        <td class=\"product-name\">${product.name}</td>\n        <td>\n            <input type=\"number\" \n                   value=\"${product.quantity}\" \n                   min=\"0\" \n                   step=\"1\" \n                   data-product-id=\"${product.id}\"\n                   class=\"quantity-input\">\n        </td>\n        <td class=\"price\">${formatCurrency(product.catalogPrice)}</td>\n        ${discountColumn}\n        <td class=\"price total-price\">${formatCurrency(totalPrice)}</td>\n        <td>\n            <input type=\"text\" \n                   value=\"${product.lot || ''}\" \n                   maxlength=\"6\" \n                   data-product-index=\"${index}\" \n                   class=\"lot-input\">\n        </td>\n    `;
    return row;
}

function createAdditionalProductRow(product, index, hasAnyDiscount = true) {
    const row = document.createElement('tr');
    row.className = `additional-product-row ${product.quantity > 0 ? 'has-quantity' : ''}`;
    
    let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
    const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
    const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

    const discountColumn = hasAnyDiscount ? `\n        <td>\n            <input type=\"number\" class=\"additional-product-discount-input ${product.individualDiscount !== null ? 'highlight-discount' : ''}\" \n                   data-index=\"${index}\" \n                   value=\"${product.individualDiscount !== null ? product.individualDiscount : ''}\" \n                   min=\"0\" max=\"100\" step=\"0.1\" placeholder=\"0.0\">\n        </td>\n        <td class=\"price discounted-price\">${formatCurrency(discountedPrice)}</td>\n    ` : '';

    row.innerHTML = `\n        <td><input type=\"text\" class=\"additional-product-name-input\" data-index=\"${index}\" value=\"${product.name}\" placeholder=\"Nome do Produto\"></td>\n        <td><input type=\"number\" class=\"additional-product-quantity-input\" data-index=\"${index}\" value=\"${product.quantity}\" min=\"0\" step=\"1\" placeholder=\"0\"></td>\n        <td><input type=\"number\" class=\"additional-product-price-input\" data-index=\"${index}\" value=\"${product.catalogPrice}\" min=\"0\" step=\"0.01\" placeholder=\"0.00\"></td>\n        ${discountColumn}\n        <td class=\"price total-price\">${formatCurrency(totalPrice)}</td>\n        <td>\n            <input type=\"text\" \n                   value=\"${product.lot || ''}\" \n                   maxlength=\"6\" \n                   data-additional-index=\"${index}\" \n                   class=\"lot-input\">\n        </td>\n    `;
    return row;
}

function setupEventListeners() {
    // Event listener para data do pedido
    document.getElementById('order-date').addEventListener('change', function(e) {
        orderState.orderDate = e.target.value;
        updatePaymentDates();
        saveData();
    });

    // Event listeners para campos básicos
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.dataset.productId);
            const quantity = parseInt(e.target.value) || 0;
            
            // Encontrar o produto pelo ID
            const product = orderState.products.find(p => p.id === productId);
            if (product) {
                product.quantity = quantity;
                updateProductRowCalculations(e.target.closest('tr'), product);
                updateSummary();
                updatePaymentDates();
                saveData();
            }
        }
                if (e.target.classList.contains('discount-input')) {
            const productId = parseInt(e.target.dataset.productId);
            const discount = e.target.value === '' ? null : parseFloat(e.target.value);
            
            // Encontrar o produto pelo ID
            const product = orderState.products.find(p => p.id === productId);
            if (product) {
                product.individualDiscount = discount;
                updateProductRowCalculations(e.target.closest('tr'), product);
                
                if (discount !== null && discount > 0) {
                    e.target.classList.add('highlight-discount');
                } else {
                    e.target.classList.remove('highlight-discount');
                }
                
                updateSummary();
                updatePaymentDates();
                saveData();
            }
        }      // Event listeners para produtos adicionais
        if (e.target.classList.contains('additional-product-quantity-input')) {
            const index = parseInt(e.target.dataset.index);
            const quantity = parseInt(e.target.value) || 0;
            orderState.additionalProducts[index].quantity = quantity;
            
            updateAdditionalProductRowCalculations(e.target.closest('tr'), orderState.additionalProducts[index]);
            
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        
        if (e.target.classList.contains('additional-product-price-input')) {
            const index = parseInt(e.target.dataset.index);
            const price = parseFloat(e.target.value) || 0;
            orderState.additionalProducts[index].catalogPrice = price;
            
            updateAdditionalProductRowCalculations(e.target.closest('tr'), orderState.additionalProducts[index]);
            
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        
        if (e.target.classList.contains('additional-product-discount-input')) {
            const index = parseInt(e.target.dataset.index);
            const discount = e.target.value === '' ? null : parseFloat(e.target.value);
            orderState.additionalProducts[index].individualDiscount = discount;
            
            updateAdditionalProductRowCalculations(e.target.closest('tr'), orderState.additionalProducts[index]);
            
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        
        // Event listener para campos de lote
        if (e.target.classList.contains('lot-input')) {
            const index = parseInt(e.target.dataset.productIndex);
            const additionalIndex = parseInt(e.target.dataset.additionalIndex);
            
            if (!isNaN(index) && index >= 0 && index < orderState.products.length) {
                orderState.products[index].lot = e.target.value;
                saveData();
            } else if (!isNaN(additionalIndex) && additionalIndex >= 0 && additionalIndex < orderState.additionalProducts.length) {
                orderState.additionalProducts[additionalIndex].lot = e.target.value;
                saveData();
            }
        }
        
        // MELHORIA 6: Event listener para campos de prazo com 3 dígitos
        if (e.target.classList.contains('payment-days-input')) {
            const index = parseInt(e.target.dataset.installmentIndex);
            const value = parseInt(e.target.value) || 0;
            // Limitar a 3 dígitos (999)
            if (value > 999) {
                e.target.value = 999;
                orderState.paymentDays[index] = 999;
            } else {
                orderState.paymentDays[index] = value;
            }
            
            // CORREÇÃO: Atualizar data dinâmica sem parênteses
            const orderDateElement = document.getElementById('order-date');
            const orderDate = orderDateElement ? new Date(orderDateElement.value) : new Date();
            const days = orderState.paymentDays[index] || 0;
            const paymentDate = new Date(orderDate.getTime() + (days + 1) * 24 * 60 * 60 * 1000);
            const formattedDate = days > 0 ? paymentDate.toLocaleDateString('pt-BR') : '(definir prazo)';
            
            const dateDisplay = document.getElementById(`payment-date-${index}`);
            if (dateDisplay) {
                dateDisplay.textContent = formattedDate;
            }
            
            updatePaymentDates();
            saveData();
        }
        
        if (e.target.classList.contains('additional-product-name-input')) {
            const index = parseInt(e.target.dataset.index);
            orderState.additionalProducts[index].name = e.target.value;
            saveData();
        }
        
        // Event listeners para campos básicos
        if (e.target.id === 'reseller-name') {
            orderState.resellerName = e.target.value;
            saveData();
        }
        if (e.target.id === 'address') {
            orderState.address = e.target.value;
            saveData();
        }
        if (e.target.id === 'phone') {
            orderState.phone = e.target.value;
            saveData();
        }
        if (e.target.id === 'attendance-by') {
            orderState.attendanceBy = e.target.value;
            saveData();
        }
        if (e.target.id === 'credit-paid') {
            orderState.creditPaid = parseFloat(e.target.value) || 0;
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        if (e.target.id === 'general-discount') {
            orderState.generalDiscount = parseFloat(e.target.value) || 0;
            renderProductsTable();
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        if (e.target.id === 'freight') {
            orderState.freight = parseFloat(e.target.value) || 0;
            updateSummary();
            updatePaymentDates();
            saveData();
        }
        
        if (e.target.id === 'transport-select') {
            orderState.transportOption = e.target.value;
            updateTransportDisplay();
            saveData();
        }
        
        // MELHORIA 5: Event listener para parcelas do Boleto
        if (e.target.id === 'installments') {
            const newInstallments = parseInt(e.target.value) || 1;
            orderState.installments = Math.max(1, Math.min(12, newInstallments));
            
            while (orderState.paymentDays.length < orderState.installments) {
                orderState.paymentDays.push(0);
            }
            orderState.paymentDays = orderState.paymentDays.slice(0, orderState.installments);

            renderPaymentDaysInputs();
            updatePaymentDates();
            updateInstallmentsText(); // MELHORIA 5: Atualizar texto
            saveData();
        }
        
        // MELHORIA 5: Event listener para parcelas do Cartão
        if (e.target.id === 'payment-credit-installments') {
            const newInstallments = parseInt(e.target.value) || 1;
            orderState.paymentMethods.credit.installments = Math.max(1, Math.min(12, newInstallments));
            updateInstallmentsText(); // MELHORIA 5: Atualizar texto
            saveData();
        }
        
        if (e.target.id === 'notes') {
            orderState.notes = e.target.value;
            saveData();
        }
        
        // Event listeners para formas de pagamento
        if (e.target.id === 'payment-pix-details') {
            orderState.paymentMethods.pix.details = e.target.value;
            saveData();
        }
        if (e.target.id === 'payment-transfer-details') {
            orderState.paymentMethods.transfer.details = e.target.value;
            saveData();
        }
        
        if (e.target.id === 'product-search') {
            filterProducts(e.target.value);
            toggleClearSearchButton(e.target.value);
        }
    });

    // Event listeners para checkboxes de pagamento
    document.addEventListener('change', function(e) {
        if (e.target.id === 'payment-pix') {
            orderState.paymentMethods.pix.enabled = e.target.checked;
            saveData();
        }
        if (e.target.id === 'payment-transfer') {
            orderState.paymentMethods.transfer.enabled = e.target.checked;
            saveData();
        }
        if (e.target.id === 'payment-boleto') {
            orderState.paymentMethods.boleto.enabled = e.target.checked;
            saveData();
        }
        if (e.target.id === 'payment-credit') {
            orderState.paymentMethods.credit.enabled = e.target.checked;
            toggleCreditInstallmentsField(e.target.checked);
            saveData();
        }
        
        if (e.target.id === 'hide-empty-lines') {
            toggleEmptyLines(e.target.checked);
        }
    });

    // Event listeners para seleção automática de texto nos campos de quantidade e desconto
    document.addEventListener('focus', function(e) {
        if (e.target.classList.contains('quantity-input') || 
            e.target.classList.contains('discount-input') ||
            e.target.classList.contains('additional-product-quantity-input') ||
            e.target.classList.contains('additional-product-discount-input') ||
            e.target.id === 'freight' ||
            e.target.id === 'general-discount') {
            e.target.select();
        }
    }, true);

    // Event listeners para botões
    document.addEventListener('click', function(e) {
        if (e.target.id === 'clear-order-btn') {
            if (confirm('Tem certeza que deseja limpar todos os dados do pedido?')) {
                clearOrder();
            }
        }
        if (e.target.id === 'save-order-btn') {
            saveOrderAsImage();
        }
        if (e.target.id === 'print-order-btn') {
            printOrderAsPDF();
        }
        if (e.target.id === 'add-new-product-btn') {
            addNewProduct();
        }
        if (e.target.id === 'clear-search-btn') {
            clearProductSearch();
        }
        if (e.target.id === 'export-excel-btn') {
            exportToExcel();
        }
        if (e.target.id === 'expedition-btn') {
            printExpeditionAsPDF();
        }
        if (e.target.id === 'add-transport-btn') {
            showAddTransportModal();
        }
        if (e.target.id === 'scroll-to-top') {
            e.preventDefault();
            e.stopPropagation();
            scrollToTop();
        }
        if (e.target.id === 'scroll-to-bottom') {
            e.preventDefault();
            e.stopPropagation();
            scrollToBottom();
        }
    });
    
    // Event listeners adicionais para melhor responsividade dos botões de scroll
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            scrollToTop();
        }, { passive: false });
    }
    
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            scrollToBottom();
        }, { passive: false });
    }
}

function updateProductRowCalculations(row, product) {
    if (!row) return;
    
    let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : orderState.generalDiscount;
    if (product.applyGeneralDiscount === false) {
        effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
    }

    const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
    const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

    const discountedPriceCell = row.querySelector('.discounted-price');
    const totalPriceCell = row.querySelector('.total-price');
    
    if (discountedPriceCell) discountedPriceCell.textContent = formatCurrency(discountedPrice);
    if (totalPriceCell) totalPriceCell.textContent = formatCurrency(totalPrice);
    
    if (product.quantity > 0) {
        row.classList.add("has-quantity");
    } else {
        row.classList.remove("has-quantity");
    }
}

function updateAdditionalProductRowCalculations(row, product) {
    if (!row) return;
    
    let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
    const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
    const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

    const discountedPriceCell = row.querySelector('.discounted-price');
    const totalPriceCell = row.querySelector('.total-price');
    
    if (discountedPriceCell) discountedPriceCell.textContent = formatCurrency(discountedPrice);
    if (totalPriceCell) totalPriceCell.textContent = formatCurrency(totalPrice);
    
    if (product.quantity > 0) {
        row.classList.add("has-quantity");
    } else {
        row.classList.remove("has-quantity");
    }
}

function updateSummary() {
    const totalQuantity = calculateTotalQuantity();
    const totalWeight = calculateTotalWeight();
    const grossValue = calculateGrossValue();
    const generalDiscountValue = calculateGeneralDiscountValue();
    const discountedValue = calculateDiscountedValue();
    const finalValue = calculateFinalValue();
    const settlementValue = calculateSettlementValue();
    const profit = calculateProfit();

    const totalQuantityElement = document.getElementById('total-quantity');
    if (totalQuantityElement) {
        totalQuantityElement.textContent = totalQuantity;
    }

    const totalWeightElement = document.getElementById('total-weight');
    if (totalWeightElement) {
        totalWeightElement.textContent = `${totalWeight.toFixed(2)} kg (${(totalWeight * 1000).toFixed(0)} g)`;
    }

    const grossValueEl = document.getElementById('gross-value');
    if (grossValueEl) grossValueEl.textContent = formatCurrency(grossValue);
    
    const generalDiscountValueEl = document.getElementById('general-discount-value');
    if (generalDiscountValueEl) generalDiscountValueEl.textContent = formatCurrency(generalDiscountValue);
    
    const freightValueEl = document.getElementById('freight-value');
    if (freightValueEl) freightValueEl.textContent = formatCurrency(orderState.freight);
    
    const settlementValueEl = document.getElementById('settlement-value');
    if (settlementValueEl) settlementValueEl.textContent = formatCurrency(settlementValue);
    
    const finalValueEl = document.getElementById('final-value');
    if (finalValueEl) finalValueEl.textContent = formatCurrency(finalValue);
    
    const profitValueEl = document.getElementById('profit-value');
    const profitItemEl = document.getElementById('profit-item');
    if (profitValueEl) profitValueEl.textContent = formatCurrency(profit);
    if (profitItemEl) {
        profitItemEl.style.display = profit > 0 ? 'flex' : 'none';
    }
    
    const creditPaidValueEl = document.getElementById('credit-paid-value');
    if (creditPaidValueEl) creditPaidValueEl.textContent = formatCurrency(orderState.creditPaid);
    
    const discountedValueEl = document.getElementById('discounted-value');
    if (discountedValueEl) discountedValueEl.textContent = formatCurrency(discountedValue);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value).replace(/\s/g, ""); // Remove espaços em branco (incluindo NBSP)
}

// Adicionar event listener para o botão de copiar
document.addEventListener("click", function(e) {
    if (e.target.id === "copy-settlement-value") {
        const settlementValueElement = document.getElementById("settlement-value");
        if (settlementValueElement) {
            const valueToCopy = "Valor do Acerto: " + settlementValueElement.textContent;
            navigator.clipboard.writeText(valueToCopy)
                .then(() => {

                })
                .catch(err => {
                    console.error("Erro ao copiar: ", err);
                    alert("Erro ao copiar o valor.");
                });
        }
    }
});

// MELHORIA 1: Função clearOrder melhorada com data de hoje como padrão
function clearOrder() {
    // Preservar o campo "Atendimento por" (não limpar)
    const currentAttendanceBy = orderState.attendanceBy;
    
    orderState = {
        resellerName: '',
        address: '',
        phone: '',
        attendanceBy: currentAttendanceBy, // Preservar
        orderDate: '', // Será preenchido por setCurrentDate()
        creditPaid: 0,
        freight: 0,
        transportOption: '', // Limpar transporte
        installments: 1,
        generalDiscount: 0,
        paymentDays: [],
         notes: '',
        packaging: orderState.packaging.map(pkg => ({ ...pkg, quantity: 0 })), // Limpar apenas a quantidade de caixas
        paymentMethods: {
            pix: {
                enabled: false,
                details: orderState.paymentMethods.pix.details // Preservar detalhes PIX
            },
            transfer: {
                enabled: false,
                details: orderState.paymentMethods.transfer.details // Preservar detalhes transferência
            },
            boleto: {
                enabled: false
            },
            credit: {
                enabled: false,
                installments: 1
            }
        },
        products: products.map(product => ({
            ...product,
            quantity: 0,
            individualDiscount: null,
            lot: orderState.products.find(p => p.id === product.id)?.lot || ''
        })),
        additionalProducts: []
    };

    // Atualizar campos na interface
    document.getElementById('reseller-name').value = '';
    document.getElementById('address').value = '';
    document.getElementById('phone').value = '';
    // NÃO limpar attendance-by
    document.getElementById('order-date').value = ''; // Será preenchido por setCurrentDate()
    document.getElementById('credit-paid').value = 0;
    document.getElementById('general-discount').value = 0;
    document.getElementById('freight').value = 0;
    document.getElementById('transport-select').value = '';
    document.getElementById('installments').value = 1;
    document.getElementById('notes').value = '';
    document.getElementById('product-search').value = '';

    // Limpar checkboxes mas preservar detalhes
    document.getElementById('payment-pix').checked = false;
    document.getElementById('payment-transfer').checked = false;
    document.getElementById('payment-boleto').checked = false;
    document.getElementById('payment-credit').checked = false;
    document.getElementById('payment-credit-installments').value = 1;

    renderProductsTable();
    renderPackagingTable(); // Adicionado para limpar as embalagens
    renderPaymentDaysInputs();
    updateSummary();
    updatePaymentDates();
    updateInstallmentsText(); // MELHORIA 5: Atualizar texto
    updateTransportDisplay(); // Atualizar exibição do transporte
    setCurrentDate(); // Garantir que a data seja preenchida após limpar
    saveData();
}

function generateFileName() {
    if (!orderState.resellerName.trim()) {
        alert('Por favor, informe o nome completo antes de salvar.');
        return null;
    }
    
    if (!orderState.attendanceBy.trim()) {
        alert('Por favor, informe o nome do atendente antes de salvar.');
        return null;
    }

    // Usar a data do campo "Data do Pedido", não a data atual do sistema
    const orderDateElement = document.getElementById('order-date');
    let orderDate;
    
    if (orderDateElement && orderDateElement.value) {
        // Garantir que a data seja interpretada corretamente
        const dateValue = orderDateElement.value;
        orderDate = new Date(dateValue + 'T00:00:00'); // Adicionar horário para evitar problemas de timezone
    } else {
        orderDate = new Date();
    }
    
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    
    // Formato: aaaammdd_AtendimentoPor_NomeDoCliente (preservando espaços)
    return `${year}${month}${day}_${orderState.attendanceBy.trim()}_${orderState.resellerName.trim()}`;
}

function saveOrderAsImage() {
    const fileName = generateFileName();
    if (!fileName) return;

    const printContent = createPrintableContent();
    
    html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        document.body.removeChild(printContent);
        console.log('Imagem salva com sucesso!');
    }).catch(error => {
        console.error('Erro ao gerar imagem:', error);
        document.body.removeChild(printContent);
        alert('Erro ao gerar imagem. Verifique se todas as bibliotecas estão carregadas.');
    });
}

function printOrderAsPDF() {
    console.log("Botão Expedição/Imprimir clicado. Iniciando geração de PDF...");
    const fileName = generateFileName();
    if (!fileName) return;

    console.log('Iniciando geração de PDF...');

    // Verificar se as bibliotecas estão carregadas
    if (typeof html2canvas === 'undefined') {
        alert('Erro: Biblioteca html2canvas não carregada. Recarregue a página e tente novamente.');
        return;
    }

    // Verificar jsPDF com múltiplas formas de acesso
    let jsPDFClass;
    if (typeof window.jsPDF !== 'undefined') {
        jsPDFClass = window.jsPDF;
    } else if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF;
    } else if (typeof jsPDF !== 'undefined') {
        jsPDFClass = jsPDF;
    } else {
        alert('Erro: Biblioteca jsPDF não carregada. Recarregue a página e tente novamente.');
        return;
    }

    const printContent = createPrintableContent();
    
    html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: printContent.scrollWidth,
        height: printContent.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDFClass('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(printContent);
        console.log('PDF gerado com sucesso!');
    }).catch(error => {
        console.error('Erro ao gerar PDF:', error);
        document.body.removeChild(printContent);
        alert('Erro ao gerar PDF: ' + error.message + '. Recarregue a página e tente novamente.');
    });
}

function createPrintableContent() {
    const printDiv = document.createElement('div');
    printDiv.style.cssText = `\n        position: absolute;\n        top: -9999px;\n        left: -9999px;\n        width: 800px;\n        background: white;\n        padding: 20px;\n        font-family: Arial, sans-serif;\n        font-size: 12px;\n        line-height: 1.4;\n        color: black;\n    `;

    // Usar a data do campo "Data do Pedido", não a data atual do sistema
    const orderDateElement = document.getElementById('order-date');
    let orderDate;
    
    if (orderDateElement && orderDateElement.value) {
        // Garantir que a data seja interpretada corretamente
        const dateValue = orderDateElement.value;
        orderDate = new Date(dateValue + 'T00:00:00'); // Adicionar horário para evitar problemas de timezone
    } else {
        orderDate = new Date();
    }
    
    const formattedOrderDate = orderDate.toLocaleDateString('pt-BR');

    let productsHTML = '';
    // Usar as funções que já incluem embalagens
    const totalQuantity = calculateTotalQuantity();
    const totalWeight = calculateTotalWeight();

    orderState.products.forEach(product => {
        if (product.quantity > 0) {
            let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : orderState.generalDiscount;
            if (product.applyGeneralDiscount === false) {
                effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
            }

            const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
            const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

            const hasAnyDiscount = checkIfHasAnyDiscount();
            
            if (hasAnyDiscount) {
                productsHTML += `\n                    <tr>\n                        <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(product.catalogPrice)}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${effectiveDiscount.toFixed(1)}%</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(discountedPrice)}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(totalPrice)}</td>\n                    </tr>\n                `;
            } else {
                productsHTML += `\n                    <tr>\n                        <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(product.catalogPrice)}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(totalPrice)}</td>\n                    </tr>\n                `;
            }
        }
    });

    orderState.additionalProducts.forEach(product => {
        if (product.quantity > 0) {
            let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
            const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
            const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

            const hasAnyDiscount = checkIfHasAnyDiscount();
            
            if (hasAnyDiscount) {
                productsHTML += `\n                    <tr>\n                        <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(product.catalogPrice)}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${effectiveDiscount.toFixed(1)}%</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(discountedPrice)}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(totalPrice)}</td>\n                    </tr>\n                `;
            } else {
                productsHTML += `\n                    <tr>\n                        <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                        <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(product.catalogPrice)}</td>\n                        <td style=\"text-align: right; border: 1px solid #ddd; padding: 8px;\">${formatCurrency(totalPrice)}</td>\n                    </tr>\n                `;
            }
        }
    });

    const hasAnyDiscount = checkIfHasAnyDiscount();
    const tableHeader = hasAnyDiscount ? `\n        <tr>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Produto</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Quantidade</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Preço Catálogo</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Desconto (%)</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Preço c/ Desconto</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Total Item</th>\n        </tr>\n    ` : `\n        <tr>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Produto</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Quantidade</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Preço Catálogo</th>\n            <th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Total Item</th>\n        </tr>\n    `;

    const grossValue = calculateGrossValue();
    const discountedValue = calculateDiscountedValue();
    const finalValue = calculateFinalValue();
    const settlementValue = calculateSettlementValue();
    const profit = calculateProfit();

    printDiv.innerHTML = `\n        <div style=\"position: relative; height: 80px; margin-bottom: 20px;\">\n            <img src=\"LogotipoCW.jpg\" alt=\"Logo\" style=\"position: absolute; top: 0; left: 0; max-height: 80px;\">\n            <h2 style=\"margin: 0; color: #333; text-align: center; line-height: 80px;\">PEDIDO DE VENDAS</h2>\n        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <p><strong>NOME:</strong> ${orderState.resellerName}</p>\n            <p><strong>Data do Pedido:</strong> ${formattedOrderDate}</p>\n            ${orderState.address ? `<p><strong>Endereço:</strong> ${orderState.address}</p>` : ''}\n            ${orderState.phone ? `<p><strong>Telefone:</strong> ${orderState.phone}</p>` : ''}\n            ${orderState.attendanceBy ? `<p><strong>Atendimento por:</strong> ${orderState.attendanceBy}</p>` : ''}\n        </div>\n\n        <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">\n            ${tableHeader}\n            ${productsHTML}\n        </table>\n\n        <div style=\"margin-bottom: 20px;\">\n            <p><strong>Quantidade Total:</strong> ${totalQuantity}</p>\n            <p><strong>Peso Total:</strong> ${totalWeight.toFixed(2)} kg (${(totalWeight * 1000).toFixed(0)} g)</p>\n        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">RESUMO DO PEDIDO</h3>\n            <p><strong>Valor Bruto:</strong> ${formatCurrency(grossValue)}</p>\n            ${orderState.freight > 0 ? `<p><strong>Frete:</strong> ${formatCurrency(orderState.freight)}${orderState.transportOption ? ` - ${orderState.transportOption}` : ''}</p>` : ''}\n            ${orderState.creditPaid > 0 ? `<p><strong>Crédito/Pago:</strong> ${formatCurrency(orderState.creditPaid)}</p>` : ''}\n            <p><strong style=\"font-size: 18px; font-weight: 700; color: #dc3545;\">Valor do Acerto:</strong> <span style=\"font-size: 18px; font-weight: 700; color: #dc3545;\">${formatCurrency(settlementValue)}</span></p>\n            ${profit > 0 ? `<p><strong>Lucro:</strong> ${formatCurrency(profit)}</p>` : ''}\n        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">Forma de Pagamento</h3>\n            ${generatePaymentConditionsHTML()}\n        </div>\n
        ${orderState.notes ? `\n        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">ANOTAÇÕES</h3>\n            <p>${orderState.notes}</p>\n        </div>\n        ` : ''}\n    `;

    document.body.appendChild(printDiv);
    return printDiv;
}

function generatePaymentConditionsHTML() {
    // Usar a data do campo "Data do Pedido", não a data atual do sistema
    const orderDateElement = document.getElementById('order-date');
    let orderDate;
    
    if (orderDateElement && orderDateElement.value) {
        // Corrigir a interpretação da data
        const dateValue = orderDateElement.value;
        // Se o valor está no formato incorreto, tentar corrigir
        if (dateValue.includes('-') && dateValue.length > 10) {
            // Formato incorreto detectado, usar data atual como fallback
            orderDate = new Date();
        } else {
            orderDate = new Date(dateValue + 'T00:00:00');
        }
    } else {
        orderDate = new Date();
    }
    
    let html = '';
    
    // Adicionar formas de pagamento selecionadas (com ✅)
    const paymentMethods = [];
    
        // Verificar PIX (primeiro)
    const pixCheckbox = document.querySelector('input[type="checkbox"][id*="pix"]') || document.querySelector('input[type="checkbox"]');
    if (pixCheckbox && pixCheckbox.checked) {
        const pixDetails = document.querySelector('input[placeholder*="PIX"]');
        if (pixDetails && pixDetails.value.trim()) {
            paymentMethods.push(`PIX: ${pixDetails.value.trim()}`);
        } else {
            paymentMethods.push('PIX');
        }
    }
    
    // Verificar Cartão de Crédito (segundo)
    const creditCheckbox = document.getElementById('payment-credit');
    if (creditCheckbox && creditCheckbox.checked) {
        const creditInstallments = orderState.paymentMethods.credit.installments;
        paymentMethods.push(`Cartão de Crédito: ${creditInstallments} Parcela${creditInstallments > 1 ? 's' : ''}`);
    }

    // Verificar Transferência Bancária (terceiro)
    const transferCheckbox = document.querySelectorAll('input[type="checkbox"]')[3];
    if (transferCheckbox && transferCheckbox.checked) {
        const transferDetails = document.querySelector('textarea[placeholder*="bancários"]');
        if (transferDetails && transferDetails.value.trim()) {
            paymentMethods.push(`Transferência Bancária: ${transferDetails.value.trim()}`);
        } else {
            paymentMethods.push('Transferência Bancária');
        }
    }

    // Verificar Boleto (quarto)
    const boletoCheckbox = document.querySelectorAll('input[type="checkbox"]')[2];
    if (boletoCheckbox && boletoCheckbox.checked) {
        const installments = orderState.installments;
        if (installments === 1) {
            paymentMethods.push('Boleto: 1 Parcela');
        } else {
            paymentMethods.push(`Boleto: ${installments} Parcelas`);
        }
    }
    
    // Exibir formas de pagamento selecionadas
    if (paymentMethods.length > 0) {
        html += '<div style="margin-bottom: 5px;">';
        paymentMethods.forEach(method => {
            html += `<p><strong>✅ ${method}</strong></p>`;
        });
        html += '</div>';
    }
    
    for (let i = 0; i < orderState.installments; i++) {
        const days = orderState.paymentDays[i] || 0;
        // Corrigir o cálculo: não adicionar +1 dia extra
        const paymentDate = new Date(orderDate.getTime() + days * 24 * 60 * 60 * 1000);
        const installmentValue = calculateSettlementValue() / orderState.installments;
        
        if (orderState.installments === 1) {
            html += `<p><strong style=\"font-size: 16px; font-weight: 700; color: #dc3545;\">Acerto até dia:</strong> <span style=\"font-size: 16px; font-weight: 700; color: #dc3545;\">${paymentDate.toLocaleDateString('pt-BR')}</span></p>`;
        } else {
            html += `<p><strong>${i + 1}ª Parcela ${formatCurrency(installmentValue)} - <span style=\"font-size: 16px; font-weight: 700; color: #dc3545;\">(Acerto até dia):</span></strong> <span style=\"font-size: 16px; font-weight: 700; color: #dc3545;\">${paymentDate.toLocaleDateString('pt-BR')}</span></p>`;
        }
    }
    
    return html;
}

function formatCurrencyForExcel(value) {
    // Formatar valor para moeda brasileira no Excel
    if (typeof value === 'number') {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\s/g, ''); // Adicionado .replace(/\s/g, '') para remover espaços em branco (incluindo NBSP)
    }
    return value;
}

function exportToExcel() {
    const fileName = generateFileName();
    if (!fileName) return;

    try {
        const data = [];
        
        data.push(['PEDIDO DE VENDAS']);
        data.push([]);
        data.push(['NOME:', orderState.resellerName]);
        
        // Usar a data do campo "Data do Pedido", não a data atual do sistema
        const orderDateElement = document.getElementById('order-date');
        let orderDate;
        
        if (orderDateElement && orderDateElement.value) {
            // Garantir que a data seja interpretada corretamente
            const dateValue = orderDateElement.value;
            orderDate = new Date(dateValue + 'T00:00:00'); // Adicionar horário para evitar problemas de timezone
        } else {
            orderDate = new Date();
        }
        
        data.push(['Data do Pedido:', orderDate.toLocaleDateString('pt-BR')]);
        if (orderState.address) data.push(['Endereço:', orderState.address]);
        if (orderState.phone) data.push(['Telefone:', orderState.phone]);
        if (orderState.attendanceBy) data.push(['Atendimento por:', orderState.attendanceBy]);
        data.push([]);
        
        const hasAnyDiscount = checkIfHasAnyDiscount();
        const productHeader = hasAnyDiscount ? 
            ['Produto', 'Quantidade', 'Preço Catálogo', 'Desconto (%)', 'Preço c/ Desconto', 'Total Item'] :
            ['Produto', 'Quantidade', 'Preço Catálogo', 'Total Item'];
        data.push(productHeader);
        
        // Usar as funções que já incluem embalagens
        const totalQuantity = calculateTotalQuantity();
        const totalWeight = calculateTotalWeight();
        
        orderState.products.forEach(product => {
            if (product.quantity > 0) {
                let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : orderState.generalDiscount;
                if (product.applyGeneralDiscount === false) {
                    effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
                }

                const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
                const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

                const row = hasAnyDiscount ? 
                    [product.name, product.quantity, formatCurrencyForExcel(product.catalogPrice), effectiveDiscount + '%', formatCurrencyForExcel(discountedPrice), formatCurrencyForExcel(totalPrice)] :
                    [product.name, product.quantity, formatCurrencyForExcel(product.catalogPrice), formatCurrencyForExcel(totalPrice)];
                data.push(row);
            }
        });

        orderState.additionalProducts.forEach(product => {
            if (product.quantity > 0) {
                let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
                const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
                const totalPrice = calculateTotalPrice(product.quantity, discountedPrice);

                const row = hasAnyDiscount ? 
                    [product.name, product.quantity, formatCurrencyForExcel(product.catalogPrice), effectiveDiscount + '%', formatCurrencyForExcel(discountedPrice), formatCurrencyForExcel(totalPrice)] :
                    [product.name, product.quantity, formatCurrencyForExcel(product.catalogPrice), formatCurrencyForExcel(totalPrice)];
                data.push(row);
            }
        });

        data.push([]);
        data.push(['Quantidade Total:', totalQuantity]);
        data.push([`Peso Total: ${totalWeight.toFixed(2)} kg (${(totalWeight * 1000).toFixed(0)} g)`]);
        data.push([]);
        data.push(['RESUMO DO PEDIDO']);
        data.push(['Valor Bruto:', formatCurrencyForExcel(calculateGrossValue())]);
        data.push(['Frete:', formatCurrencyForExcel(orderState.freight)]);
        data.push(['Transporte:', orderState.transportOption || '']);
        // 'Valor da Empresa' mantido para cálculos mas não exibido na exportação
        if (orderState.creditPaid > 0) {
            data.push(['Crédito/Pago:', formatCurrencyForExcel(orderState.creditPaid)]);
        }
        data.push(['Valor do Acerto:', formatCurrencyForExcel(calculateSettlementValue())]);
        const profit = calculateProfit();
        if (profit > 0) {
            data.push(['Lucro:', formatCurrencyForExcel(profit)]);
        }

        data.push([]);
        data.push(['Forma de Pagamento']);
        
        // Adicionar formas de pagamento selecionadas (com ✅) no Excel
        const paymentMethods = [];
        
        // Verificar PIX
        const pixCheckbox = document.querySelector("input[type=\"checkbox\"][id*=\"pix\"]") || document.querySelector("input[type=\"checkbox\"]");
        if (pixCheckbox && pixCheckbox.checked) {
            const pixDetails = document.querySelector("input[placeholder*=\"PIX\"]");
            if (pixDetails && pixDetails.value.trim()) {
                paymentMethods.push(`✅ PIX: ${pixDetails.value.trim()}`);
            } else {
                paymentMethods.push("✅ PIX");
            }
        }
             // Verificar Cartão de Crédito
        const creditCheckbox = document.getElementById("payment-credit");
        if (creditCheckbox && creditCheckbox.checked) {
            const creditInstallments = orderState.paymentMethods.credit.installments;
            paymentMethods.push(`✅ Cartão de Crédito: ${creditInstallments} Parcela${creditInstallments > 1 ? "s" : ""}`);
        }

        // Verificar Transferência Bancária
        const transferCheckbox = document.getElementById("payment-transfer");
        if (transferCheckbox && transferCheckbox.checked) {
            const transferDetails = document.querySelector("textarea[placeholder*=\"bancários\"]");
            if (transferDetails && transferDetails.value.trim()) {
                paymentMethods.push(`✅ Transferência Bancária: ${transferDetails.value.trim()}`);
            } else {
                paymentMethods.push("✅ Transferência Bancária");
            }
        }

        // Verificar Boleto
        const boletoCheckbox = document.getElementById("payment-boleto");
        if (boletoCheckbox && boletoCheckbox.checked) {
            const installments = orderState.installments;
            if (installments === 1) {
                paymentMethods.push("✅ Boleto: 1 Parcela");
            } else {
                paymentMethods.push(`✅ Boleto: ${installments} Parcelas`);
            }
        }   
        // Adicionar formas de pagamento ao Excel
        paymentMethods.forEach(method => {
            data.push([method]);
        });
        
        for (let i = 0; i < orderState.installments; i++) {
            const days = orderState.paymentDays[i] || 0;
            
            // Usar a data do campo "Data do Pedido", não a data atual do sistema
            const orderDateElement = document.getElementById('order-date');
            let orderDate;
            
            if (orderDateElement && orderDateElement.value) {
                // Corrigir a interpretação da data
                const dateValue = orderDateElement.value;
                // Se o valor está no formato incorreto, tentar corrigir
                if (dateValue.includes('-') && dateValue.length > 10) {
                    // Formato incorreto detectado, usar data atual como fallback
                    orderDate = new Date();
                } else {
                    orderDate = new Date(dateValue + 'T00:00:00');
                }
            } else {
                orderDate = new Date();
            }
            
            // Corrigir o cálculo: não adicionar +1 dia extra
            const paymentDate = new Date(orderDate.getTime() + days * 24 * 60 * 60 * 1000);
            const installmentValue = calculateSettlementValue() / orderState.installments;
            
            if (orderState.installments === 1) {
                data.push(['Acerto até dia:', paymentDate.toLocaleDateString('pt-BR')]);
            } else {
                data.push([`${i + 1}ª Parcela:`, formatCurrencyForExcel(installmentValue), 'Acerto até dia:', paymentDate.toLocaleDateString('pt-BR')]);
            }
        }

        if (orderState.notes) {
            data.push([]);
            data.push(['ANOTAÇÕES']);
            data.push([orderState.notes]);
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        XLSX.utils.book_append_sheet(wb, ws, "Pedido");
        
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        
        console.log('Excel exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        alert('Erro ao exportar para Excel. Verifique se todas as bibliotecas estão carregadas.');
    }
}

function addNewProduct() {
    const newProduct = {
        name: '',
        catalogPrice: 0,
        weight: 0.1,
        quantity: 0,
        individualDiscount: null,
        lot: ''
    };
    
    orderState.additionalProducts.push(newProduct);
    renderProductsTable();
    saveData();
}

function removeAdditionalProduct(index) {
    orderState.additionalProducts.splice(index, 1);
    renderProductsTable();
    updateSummary();
    updatePaymentDates();
    saveData();
}

function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filterProducts(searchTerm) {
    if (!searchTerm.trim()) {
        renderProductsTable();
        return;
    }

    const normalizedSearchTerm = normalizeText(searchTerm);
    const filteredProducts = orderState.products.filter(product => 
        normalizeText(product.name).includes(normalizedSearchTerm)
    );
    
    renderProductsTable(filteredProducts);
}

function toggleClearSearchButton(searchValue) {
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        if (searchValue.trim()) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    }
}

function clearProductSearch() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.value = '';
        filterProducts('');
        toggleClearSearchButton('');
        searchInput.focus();
    }
}

// Funções de cálculo
function calculateDiscountedPrice(catalogPrice, discount) {
    return catalogPrice * (1 - discount / 100);
}

function calculateTotalPrice(quantity, discountedPrice) {
    return quantity * discountedPrice;
}

function calculateTotalQuantity() {
    let total = 0;
    orderState.products.forEach(product => {
        total += product.quantity;
    });
    orderState.additionalProducts.forEach(product => {
        total += product.quantity;
    });
    return total;
}

function calculateTotalWeight() {
    let total = 0;
    orderState.products.forEach(product => {
        total += product.quantity * (product.weight || 0);
    });
    orderState.additionalProducts.forEach(product => {
        total += product.quantity * (product.weight || 0.1);
    });
    // Adicionar peso das embalagens
    orderState.packaging.forEach(packaging => {
        total += packaging.quantity * (packaging.weight || 0) / 1000; // Converter gramas para kg
    });
    return total;
}

function calculateGrossValue() {
    let total = 0;
    orderState.products.forEach(product => {
        total += product.quantity * product.catalogPrice;
    });
    orderState.additionalProducts.forEach(product => {
        total += product.quantity * product.catalogPrice;
    });
    return total;
}

function calculateGeneralDiscountValue() {
    return calculateGrossValue() * (orderState.generalDiscount / 100);
}

function calculateDiscountedValue() {
    let total = 0;
    orderState.products.forEach(product => {
        let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : orderState.generalDiscount;
        if (product.applyGeneralDiscount === false) {
            effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
        }
        const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
        total += calculateTotalPrice(product.quantity, discountedPrice);
    });
    orderState.additionalProducts.forEach(product => {
        let effectiveDiscount = product.individualDiscount !== null ? product.individualDiscount : 0;
        const discountedPrice = calculateDiscountedPrice(product.catalogPrice, effectiveDiscount);
        total += calculateTotalPrice(product.quantity, discountedPrice);
    });
    return total + orderState.freight;
}

function calculateFinalValue() {
    return calculateDiscountedValue();
}

function calculateSettlementValue() {
    return calculateFinalValue() - orderState.creditPaid;
}

function calculateProfit() {
    const grossValue = calculateGrossValue();
    const discountedValue = calculateDiscountedValue();
    return grossValue - discountedValue;
}



// Função para ocultar/mostrar linhas com quantidade vazia ou 0
function toggleEmptyLines(hideEmpty) {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        // Pular a linha do botão "Adicionar outro item"
        if (row.querySelector('#add-new-product-btn')) {
            return;
        }
        
        // Encontrar o campo de quantidade na linha
        const quantityInput = row.querySelector('.quantity-input, .additional-product-quantity-input');
        
        if (quantityInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            
            if (hideEmpty && quantity === 0) {
                row.style.display = 'none';
            } else {
                row.style.display = '';
            }
        }
    });
}


// Funções de scroll automático
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

// Função específica para expedição com colunas ocultas
function printExpeditionAsPDF() {
    console.log("Botão Expedição clicado. Iniciando geração de PDF com colunas ocultas...");
    const fileName = generateFileName();
    if (!fileName) return;

    console.log('Iniciando geração de PDF para expedição...');

    // Verificar se as bibliotecas estão carregadas
    if (typeof html2canvas === 'undefined') {
        alert('Erro: Biblioteca html2canvas não carregada. Recarregue a página e tente novamente.');
        return;
    }

    // Verificar jsPDF com múltiplas formas de acesso
    let jsPDFClass;
    if (typeof window.jsPDF !== 'undefined') {
        jsPDFClass = window.jsPDF;
    } else if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF;
    } else if (typeof jsPDF !== 'undefined') {
        jsPDFClass = jsPDF;
    } else {
        alert('Erro: Biblioteca jsPDF não carregada. Recarregue a página e tente novamente.');
        return;
    }

    const printContent = createExpeditionPrintableContent();
    
    html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: printContent.scrollWidth,
        height: printContent.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Configuração específica para A4 com margens de 1cm
        const pdf = new jsPDFClass('p', 'mm', 'a4');
        
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const margin = 10; // 1cm margin in mm
        const imgWidth = pdfWidth - (2 * margin); // 190mm (210 - 20)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = margin; // Start at margin position
        
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - (2 * margin)); // Account for top and bottom margins
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - (2 * margin));
        }
        
        pdf.save(`${fileName}.pdf`);
        document.body.removeChild(printContent);
        console.log('PDF de expedição gerado com sucesso!');
    }).catch(error => {
        console.error('Erro ao gerar PDF de expedição:', error);
        document.body.removeChild(printContent);
        alert('Erro ao gerar PDF: ' + error.message + '. Recarregue a página e tente novamente.');
    });
}

function generateExpeditionPaymentConditionsHTML() {
    let html = "";
    const paymentMethods = [];

    if (orderState.paymentMethods.pix.enabled) {
        paymentMethods.push(`✅ PIX${orderState.paymentMethods.pix.details ? ": " + orderState.paymentMethods.pix.details : ""}`);
    }

    if (orderState.paymentMethods.credit.enabled) {
        const installments = orderState.paymentMethods.credit.installments;
        paymentMethods.push(`✅ Cartão de Crédito: ${installments} Parcela${installments > 1 ? "s" : ""}`);
    }

    if (orderState.paymentMethods.transfer.enabled) {
        paymentMethods.push(`✅ Transferência Bancária${orderState.paymentMethods.transfer.details ? ": " + orderState.paymentMethods.transfer.details : ""}`);
    }

    if (orderState.paymentMethods.boleto.enabled) {
        const installments = orderState.installments;
        if (installments === 1) {
            paymentMethods.push(`✅ Boleto: 1 Parcela`);
        } else {
            paymentMethods.push(`✅ Boleto: ${installments} Parcelas`);
        }
    }

    if (paymentMethods.length > 0) {
        html += `<div style=\"margin-bottom: 10px;\">`;
        paymentMethods.forEach(method => {
            html += `<p>${method}</p>`;
        });
        html += `</div>`;
    }

    return html;
}

// Função para criar conteúdo imprimível específico para expedição
function createExpeditionPrintableContent() {
    const printDiv = document.createElement("div");
    printDiv.style.cssText = `\n        position: absolute;\n        top: -9999px;\n        left: -9999px;\n        width: 800px;\n        background: white;\n        padding: 20px;\n        font-family: Arial, sans-serif;\n        font-size: 12px;\n        line-height: 1.4;\n        color: black;\n    `;

    const orderDateElement = document.getElementById("order-date");
    let orderDate;
    
    if (orderDateElement && orderDateElement.value) {
        const dateValue = orderDateElement.value;
        orderDate = new Date(dateValue + "T00:00:00");
    } else {
        orderDate = new Date();
    }
    
    const formattedOrderDate = orderDate.toLocaleDateString("pt-BR");

    let productsHTML = "";
    // Usar as funções que já incluem embalagens
    const totalQuantity = calculateTotalQuantity();
    const totalWeight = calculateTotalWeight();

    orderState.products.forEach(product => {
        if (product.quantity > 0) {
            productsHTML += `\n                <tr>\n                    <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                    <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                    <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.lot || ""}</td>\n                </tr>\n            `;
        }
    });

    orderState.additionalProducts.forEach(product => {
        if (product.quantity > 0) {
            productsHTML += `\n                <tr>\n                    <td style=\"border: 1px solid #ddd; padding: 8px;\">${product.name}</td>\n                    <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.quantity}</td>\n                    <td style=\"text-align: center; border: 1px solid #ddd; padding: 8px;\">${product.lot || ""}</td>\n                </tr>\n            `;
        }
    });

    const tableHeader = `\n        <tr>\n            <th style=\"width: 50%; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Produto</th>\n            <th style=\"width: 15%; text-align: center; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Quantidade</th>\n            <th style=\"width: 35%; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Lote</th>\n        </tr>\n    `;

    printDiv.innerHTML = `\n        <div style=\"position: relative; height: 80px; margin-bottom: 20px;\">\n            <img src=\"LogotipoCW.jpg\" alt=\"Logo\" style=\"position: absolute; top: 0; left: 0; max-height: 80px;\">\n            <h2 style=\"margin: 0; color: #333; text-align: center; line-height: 80px;\">EXPEDIÇÃO</h2>\n        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <p><strong>NOME:</strong> ${orderState.resellerName}</p>\n            <p><strong>Data do Pedido:</strong> ${formattedOrderDate}</p>\n            ${orderState.address ? `<p><strong>Endereço:</strong> ${orderState.address}</p>` : ""}\n            ${orderState.phone ? `<p><strong>Telefone:</strong> ${orderState.phone}</p>` : ""}\n            ${orderState.attendanceBy ? `<p><strong>Atendimento por:</strong> ${orderState.attendanceBy}</p>` : ""}\n            ${orderState.transportOption ? `<p><strong>Transporte:</strong> ${orderState.transportOption}</p>` : ""}\n        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">PRODUTOS</h3>\n            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">\n                <thead>\n                    ${tableHeader}\n                </thead>\n                <tbody>\n                    ${productsHTML}\n                    </tbody>\n                </table>\n\n        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">EMBALAGENS DO PEDIDO</h3>\n            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">\n                <thead>\n                    <tr>\n                        <th style=\"width: 40%; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Caixa</th>\n                        <th style=\"width: 20%; text-align: center; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Qtde</th>\n                        <th style=\"width: 20%; text-align: center; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Peso (g)</th>\n                        <th style=\"width: 20%; text-align: center; border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;\">Peso Total (g)</th>\n                    </tr>\n                </thead>\n                  <tbody>
                    ${orderState.packaging.filter(pkg => pkg.quantity > 0).map(pkg => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${pkg.name}</td>
                            <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${pkg.quantity}</td>
                            <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${pkg.weight}</td>
                            <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${pkg.quantity * pkg.weight}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>\n\n        <div style=\"margin-bottom: 20px;\">\n            <p><strong>Quantidade Total:</strong> ${totalQuantity}</p>\n            <p><strong>Peso Total:</strong> ${totalWeight.toFixed(2)} kg (${(totalWeight * 1000).toFixed(0)} g)</p>\n        </div>\n
        ${orderState.notes ? `     <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">ANOTAÇÕES</h3>\n            <p>${orderState.notes}</p>\n        </div>\n        ` : ""}

        <div style=\"margin-bottom: 20px;\">\n            <h3 style=\"margin-bottom: 10px;\">FORMA DE PAGAMENTO</h3>\n            ${generateExpeditionPaymentConditionsHTML()}\n        </div>\n    `;

    document.body.appendChild(printDiv);
    return printDiv;
}



// Funções para gerenciar embalagens
function renderPackagingTable() {
    const tbody = document.getElementById("packaging-tbody");
    if (!tbody) {
        console.error("renderPackagingTable: Elemento packaging-tbody não encontrado");
        return;
    }
    
    tbody.innerHTML = "";
    
    orderState.packaging.forEach((packaging, index) => {
        const row = createPackagingRow(packaging, index);
        tbody.appendChild(row);
    });

    // Adicionar linha inicial se não houver embalagens
    if (orderState.packaging.length === 0) {
        addNewPackaging();
    }
}

function createPackagingRow(packaging, index) {
    const row = document.createElement("tr");
    
    const totalWeight = packaging.quantity * (packaging.weight || 0);
    
    row.innerHTML = `\n        <td>\n            <input type=\"text\" \n                   value=\"${packaging.name || ''}\" \n                   data-packaging-index=\"${index}\" \n                   data-field=\"name\" \n                   class=\"packaging-name-input\" \n                   placeholder=\"Nome da caixa\">\n        </td>\n        <td>\n            <input type=\"number\" \n                   value=\"${packaging.quantity || ''}\" \n                   data-packaging-index=\"${index}\" \n                   data-field=\"quantity\" \n                   class=\"packaging-quantity-input\" \n                   min=\"0\" \n                   step=\"1\" \n                   placeholder=\"0\">\n        </td>\n        <td>\n            <input type=\"number\" \n                   value=\"${packaging.weight || ''}\" \n                   data-packaging-index=\"${index}\" \n                   data-field=\"weight\" \n                   class=\"packaging-weight-input\" \n                   min=\"0\" \n                   step=\"1\" \n                   placeholder=\"0\">\n        </td>\n        <td>\n            <span class=\"packaging-weight-total\">${totalWeight.toFixed(0)}</span>\n            <button class=\"remove-packaging-btn\" data-packaging-index=\"${index}\">×</button>\n        </td>\n    `;
    
    return row;
}

function addNewPackaging() {
    orderState.packaging.push({
        name: '',
        quantity: 0,
        weight: 0
    });
    renderPackagingTable();
    saveData();
}

function removePackaging(index) {
    orderState.packaging.splice(index, 1);
    renderPackagingTable();
    updateSummary();
    saveData();
}

function updatePackaging(index, field, value) {
    if (orderState.packaging[index]) {
        if (field === 'quantity' || field === 'weight') {
            orderState.packaging[index][field] = parseFloat(value) || 0;
        } else {
            orderState.packaging[index][field] = value;
        }
        
        // Atualizar o peso total da linha
        const totalWeight = orderState.packaging[index].quantity * (orderState.packaging[index].weight || 0);
        const weightTotalElement = document.querySelector(`[data-packaging-index=\"${index}\"]`).closest('tr').querySelector('.packaging-weight-total');
        if (weightTotalElement) {
            weightTotalElement.textContent = totalWeight.toFixed(0);
        }
        
        updateSummary();
        saveData();
    }
}

// Adicionar event listeners para embalagens
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('packaging-name-input') || 
        e.target.classList.contains('packaging-quantity-input') || 
        e.target.classList.contains('packaging-weight-input')) {
        const index = parseInt(e.target.dataset.packagingIndex);
        const field = e.target.dataset.field;
        updatePackaging(index, field, e.target.value);
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'add-new-packaging-btn') {
        addNewPackaging();
    }
    
    if (e.target.classList.contains('remove-packaging-btn')) {
        const index = parseInt(e.target.dataset.packagingIndex);
        removePackaging(index);
    }
});



// Funções para gerenciar transporte
function updateTransportDisplay() {
    const transportDisplay = document.getElementById('transport-display');
    if (transportDisplay) {
        transportDisplay.textContent = orderState.transportOption || '';
    }
}

function showAddTransportModal() {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'transport-modal';
    modal.innerHTML = `\n        <div class=\"transport-modal-content\">\n            <h3>Adicionar Nova Opção de Transporte</h3>\n            <input type=\"text\" id=\"new-transport-input\" class=\"modern-input\" placeholder=\"Digite a nova opção de transporte\" maxlength=\"50\">\n            <div class=\"transport-modal-buttons\">\n                <button class=\"btn btn-secondary\" onclick=\"closeTransportModal()\">Cancelar</button>\n                <button class=\"btn btn-primary\" onclick=\"addNewTransportOption()\">Adicionar</button>\n            </div>\n        </div>\n    `;
    
    document.body.appendChild(modal);
    
    // Focar no input
    const input = document.getElementById('new-transport-input');
    if (input) {
        input.focus();
        
        // Adicionar event listener para Enter
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewTransportOption();
            }
        });
    }
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTransportModal();
        }
    });
}

function closeTransportModal() {
    const modal = document.querySelector('.transport-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function addNewTransportOption() {
    const input = document.getElementById('new-transport-input');
    if (!input) return;
    
    const newOption = input.value.trim();
    if (!newOption) {
        alert('Por favor, digite uma opção de transporte válida.');
        return;
    }
    
    // Verificar se a opção já existe
    const select = document.getElementById('transport-select');
    const existingOptions = Array.from(select.options).map(option => option.value.toLowerCase());
    
    if (existingOptions.includes(newOption.toLowerCase())) {
        alert('Esta opção de transporte já existe.');
        return;
    }
    
    // Adicionar nova opção ao select
    const option = document.createElement('option');
    option.value = newOption;
    option.textContent = newOption;
    select.appendChild(option);
    
    // Selecionar a nova opção
    select.value = newOption;
    orderState.transportOption = newOption;
    updateTransportDisplay();
    saveData();
    
    // Fechar modal
    closeTransportModal();
}

// Inicializar exibição do transporte na inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(function() {
        updateTransportDisplay();
    }, 100);
});





