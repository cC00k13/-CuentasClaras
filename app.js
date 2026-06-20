// ==========================================
// 1. SELECTORES DEL DOM
// ==========================================
const form = document.getElementById('gastoForm');
const conceptoInput = document.getElementById('conceptoInput');
const cantidadInput = document.getElementById('cantidadInput');
const fechaInput = document.getElementById('fechaInput');
const listaTransacciones = document.getElementById('listaTransacciones');
const btnExportar = document.getElementById('btnExportar');
const btnImportar = document.getElementById('btnImportar');
const inputFile = document.getElementById('inputFile');
const btnCaptura = document.getElementById('btnCaptura');
const panelIngreso = document.getElementById('panelIngreso');
const barraControl = document.getElementById('barraControl');
const modalCuentas = document.getElementById('modalCuentas');
const modalCuentasContent = document.getElementById('modalCuentasContent');
const vistaListaCuentas = document.getElementById('vistaListaCuentas');
const vistaFormCuenta = document.getElementById('vistaFormCuenta');
const listaCuentasContainer = document.getElementById('listaCuentasContainer');
const btnAjustes = document.getElementById('btnAjustes');
const editCuentaId = document.getElementById('editCuentaId');
const editNombre = document.getElementById('editNombre');
const editMonto = document.getElementById('editMonto');
const tituloFormCuenta = document.getElementById('tituloFormCuenta');
const zonaPeligroCuenta = document.getElementById('zonaPeligroCuenta');
const modalDescripcion = document.getElementById('modalDescripcion');
const modalDescripcionContent = document.getElementById('modalDescripcionContent');
const btnCerrarDescripcion = document.getElementById('btnCerrarDescripcion');
const btnGuardarDescripcion = document.getElementById('btnGuardarDescripcion');
const editDescripcionTexto = document.getElementById('editDescripcionTexto');

// ==========================================
// 2. ESTADO GLOBAL Y PERSISTENCIA
// ==========================================
let transaccionActivaDesc = null;
let estadoGlobal = {
    cuenta_activa_id: "cta_principal",
    cuentas: [
        { id: "cta_principal", nombre: "Cuenta Principal", monto_inicial: 120000, transacciones: [] }
    ]
};

// Cargar datos al iniciar
const datosGuardados = localStorage.getItem('cuentas_claras_data');
if (datosGuardados) {
    try {
        const dataParseada = JSON.parse(datosGuardados);
        if (dataParseada.cuentas && Array.isArray(dataParseada.cuentas)) {
            estadoGlobal = dataParseada;
        } else if (Array.isArray(dataParseada)) {
            estadoGlobal.cuentas[0].transacciones = dataParseada;
            localStorage.setItem('cuentas_claras_data', JSON.stringify(estadoGlobal));
        }
    } catch (error) { console.error("Error al migrar datos."); }
}

function getCuentaActiva() {
    return estadoGlobal.cuentas.find(c => c.id === estadoGlobal.cuenta_activa_id) || estadoGlobal.cuentas[0];
}

function calcularSaldoDeCuenta(cuenta) {
    return cuenta.monto_inicial - cuenta.transacciones.reduce((sum, t) => sum + t.cantidad, 0);
}

function setFechaActual() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    fechaInput.value = now.toISOString().slice(0, 16);
}

// ==========================================
// 3. MOTOR MATEMÁTICO (Generado por IA)
// ==========================================
const FinanceService = {
    calcularEstadoCuenta: (montoInicial, transacciones) => {
        const ordenadas = [...transacciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        let saldoAcumulado = montoInicial;
        let totalGastado = 0;

        const procesadas = ordenadas.map(t => {
            saldoAcumulado -= t.cantidad;
            totalGastado += t.cantidad;
            return {
                ...t,
                saldoDisponible: saldoAcumulado
            };
        });

        return { transaccionesProcesadas: procesadas, totalGastado, saldoFinal: saldoAcumulado };
    },
    formatCurrency: (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
};

// ==========================================
// 4. LÓGICA DE RENDERIZADO
// ==========================================
function recalcularYRenderizar() {
    const cuentaActiva = getCuentaActiva();
    
    // 1. Calcular
    const { transaccionesProcesadas, totalGastado, saldoFinal } = 
        FinanceService.calcularEstadoCuenta(cuentaActiva.monto_inicial, cuentaActiva.transacciones);

    // 2. Guardar estado
    cuentaActiva.transacciones = transaccionesProcesadas;
    localStorage.setItem('cuentas_claras_data', JSON.stringify(estadoGlobal));

    // 3. Renderizar
    renderInterface(cuentaActiva, totalGastado, saldoFinal);
}

function renderInterface(cuenta, totalGastado, saldoFinal) {
    document.getElementById('tituloCuenta').textContent = cuenta.nombre;
    document.getElementById('montoBase').innerHTML = `
        <span class="text-[20px] font-sans opacity-60 font-medium align-baseline mr-1">$</span>
        <span class="align-baseline">${FinanceService.formatCurrency(cuenta.monto_inicial)}</span>
    `;

    const resumenEl = document.getElementById('resumenCuenta');
    if (cuenta.transacciones.length > 0) {
        resumenEl.classList.remove('hidden');
        document.getElementById('totalGastado').textContent = FinanceService.formatCurrency(totalGastado);
        document.getElementById('saldoFinal').textContent = FinanceService.formatCurrency(saldoFinal);
    } else {
        resumenEl.classList.add('hidden');
    }

    renderListaTransacciones(cuenta.transacciones);
}

function renderListaTransacciones(transacciones) {
    listaTransacciones.innerHTML = '';
    const paraMostrar = [...transacciones].reverse();

    if (paraMostrar.length === 0) {
        listaTransacciones.innerHTML = '<div class="py-12 text-center text-gray-500 dark:text-neo-text-dim text-sm italic">Esta cuenta no tiene movimientos.</div>';
        return;
    }

    paraMostrar.forEach(t => {
        const item = document.createElement('div');
        item.className = "glass-panel rounded-2xl border border-gray-200 dark:border-neo-border bg-white/70 dark:bg-[#12161c]/70 shadow-sm px-5 py-3 flex flex-col group hover:scale-[1.01] hover:bg-white/90 dark:hover:bg-neo-surface/90 transition-all cursor-pointer";
        // Asignamos la función explícitamente al objeto window para evitar problemas de alcance
        item.onclick = () => window.abrirModalDescripcion(t.id);
        
        const icon = getIconByConcepto(t.concepto);
        const timeStr = new Date(t.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        item.innerHTML = `
            <div class="flex items-center justify-between gap-3 w-full">
                <div class="flex items-start gap-3 flex-1">
                    <div class="w-9 h-9 rounded-full bg-white/80 dark:bg-neo-bg border border-gray-200 dark:border-neo-border flex items-center justify-center text-gray-700 dark:text-neo-text shrink-0 mt-0.5">
                        <span class="material-symbols-outlined text-[18px]">${icon}</span>
                    </div>
                    <div class="flex-1 pr-1">
                        <h4 class="font-sans text-sm font-semibold text-gray-950 dark:text-white leading-snug break-words">${t.concepto}</h4>
                        <span class="font-sans text-[10px] text-gray-500 dark:text-neo-text-dim block mt-0.5">${timeStr}</span>
                    </div>
                </div>
                <div class="flex items-center shrink-0 gap-2 self-start mt-0.5">
                    <div class="flex gap-4 text-right">
                        <div class="min-w-[70px] flex justify-end items-baseline gap-[2px]">
                            <span class="text-[11px] font-bold text-red-500 dark:text-neo-danger opacity-80 font-sans">-$</span>
                            <span class="font-sans text-sm font-bold text-red-600 dark:text-neo-danger">${FinanceService.formatCurrency(t.cantidad)}</span>
                        </div>
                        <div class="min-w-[85px] flex justify-end items-baseline gap-[2px]">
                            <span class="text-[11px] font-medium text-gray-500 dark:text-neo-text-dim font-sans">$</span>
                            <span class="font-sans text-sm font-medium text-gray-700 dark:text-neo-text">${FinanceService.formatCurrency(t.saldoDisponible)}</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); window.eliminarRegistro('${t.id}')" class="btn-eliminar text-gray-300 hover:text-red-500 dark:text-neo-border dark:hover:text-neo-danger transition-all p-1 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neo-bg/50">
                        <span class="material-symbols-outlined text-[17px]">close</span>
                    </button>
                </div>
            </div>
            ${t.descripcion ? `<div class="w-full pt-1 px-1"><p class="font-sans text-xs text-gray-500 dark:text-neo-text-dim leading-relaxed text-center italic">${t.descripcion}</p></div>` : ''}
        `;
        listaTransacciones.appendChild(item);
    });
}

function getIconByConcepto(concepto) {
    const c = concepto.toLowerCase();
    if (c.includes('almuerzo') || c.includes('comida')) return 'restaurant';
    if (c.includes('transporte') || c.includes('uber')) return 'directions_bus';
    if (c.includes('super') || c.includes('oxxo')) return 'shopping_cart';
    return 'receipt_long';
}

// ==========================================
// 5. FUNCIONES GLOBALES DE LA INTERFAZ
// ==========================================
window.abrirModalCuentas = function() {
    renderizarListaCuentas();
    volverAListaCuentas();
    modalCuentas.classList.remove('opacity-0', 'pointer-events-none');
    modalCuentasContent.classList.remove('translate-y-full', 'sm:scale-95');
}

window.cerrarModalCuentas = function() {
    modalCuentas.classList.add('opacity-0', 'pointer-events-none');
    modalCuentasContent.classList.add('translate-y-full', 'sm:scale-95');
}

window.renderizarListaCuentas = function() {
    listaCuentasContainer.innerHTML = '';
    estadoGlobal.cuentas.forEach(cuenta => {
        const saldo = calcularSaldoDeCuenta(cuenta);
        const isActive = cuenta.id === estadoGlobal.cuenta_activa_id;
        const div = document.createElement('div');
        div.className = `p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${isActive ? 'bg-emerald-50 dark:bg-[#00ff88]/10 border-emerald-200 dark:border-[#00ff88]/30' : 'bg-gray-50 dark:bg-neo-bg border-gray-200 dark:border-neo-border hover:bg-gray-100 dark:hover:bg-white/[0.02]'}`;
        div.innerHTML = `
            <div class="flex-1 min-w-0" onclick="window.seleccionarCuenta('${cuenta.id}')">
                <h4 class="font-sans text-sm font-bold ${isActive ? 'text-emerald-700 dark:text-[#00ff88]' : 'text-gray-900 dark:text-white'} truncate">${cuenta.nombre}</h4>
                <p class="font-sans text-xs text-gray-500 dark:text-neo-text-dim mt-0.5">Saldo: $${saldo.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <button onclick="window.abrirFormularioCuenta('${cuenta.id}'); event.stopPropagation();" class="p-2 text-gray-400 hover:text-emerald-500 dark:hover:text-[#00ff88] transition-colors rounded-full shrink-0" title="Editar cuenta">
                <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
        `;
        listaCuentasContainer.appendChild(div);
    });
}

window.seleccionarCuenta = function(id) {
    estadoGlobal.cuenta_activa_id = id;
    recalcularYRenderizar();
    window.cerrarModalCuentas();
}

window.volverAListaCuentas = function() {
    vistaListaCuentas.classList.remove('-translate-x-full');
    vistaFormCuenta.classList.add('translate-x-full');
}

window.abrirFormularioCuenta = function(idParaEditar = null) {
    if (idParaEditar) {
        const cuenta = estadoGlobal.cuentas.find(c => c.id === idParaEditar);
        tituloFormCuenta.textContent = "Editar Cuenta";
        editCuentaId.value = cuenta.id;
        editNombre.value = cuenta.nombre;
        editMonto.value = cuenta.monto_inicial;
        zonaPeligroCuenta.classList.remove('hidden'); 
    } else {
        tituloFormCuenta.textContent = "Nueva Cuenta";
        editCuentaId.value = "";
        editNombre.value = "";
        editMonto.value = "";
        zonaPeligroCuenta.classList.add('hidden'); 
    }
    vistaListaCuentas.classList.add('-translate-x-full');
    vistaFormCuenta.classList.remove('translate-x-full');
}

window.guardarCuenta = function() {
    const id = editCuentaId.value;
    const nuevoNombre = editNombre.value.trim();
    const nuevoMonto = parseFloat(editMonto.value);

    if (!nuevoNombre || isNaN(nuevoMonto) || nuevoMonto < 0) {
        alert("Por favor ingresa un nombre y un fondo inicial válidos.");
        return;
    }

    if (id) {
        const cuenta = estadoGlobal.cuentas.find(c => c.id === id);
        cuenta.nombre = nuevoNombre;
        cuenta.monto_inicial = nuevoMonto;
    } else {
        const nuevaCuenta = {
            id: "cta_" + Date.now().toString(),
            nombre: nuevoNombre,
            monto_inicial: nuevoMonto,
            transacciones: []
        };
        estadoGlobal.cuentas.push(nuevaCuenta);
        estadoGlobal.cuenta_activa_id = nuevaCuenta.id; 
    }
    recalcularYRenderizar();
    window.volverAListaCuentas();
    window.renderizarListaCuentas(); 
}

window.eliminarCuentaActualForm = function() {
    const id = editCuentaId.value;
    if (estadoGlobal.cuentas.length <= 1) {
        alert("No puedes eliminar la única cuenta que tienes. Puedes editarla o vaciar sus transacciones.");
        return;
    }
    if (confirm("⚠️ ¿Estás seguro de que deseas eliminar TODA la cuenta y su historial? Esta acción es irreversible.")) {
        estadoGlobal.cuentas = estadoGlobal.cuentas.filter(c => c.id !== id);
        if (estadoGlobal.cuenta_activa_id === id) {
            estadoGlobal.cuenta_activa_id = estadoGlobal.cuentas[0].id;
        }
        recalcularYRenderizar();
        window.volverAListaCuentas();
        window.renderizarListaCuentas();
    }
}

window.eliminarRegistro = function(idTransaccion) {
    if (confirm("¿Estás seguro de eliminar este gasto? El saldo se recalculará automáticamente.")) {
        const cuentaActiva = getCuentaActiva();
        cuentaActiva.transacciones = cuentaActiva.transacciones.filter(t => t.id !== idTransaccion);
        recalcularYRenderizar();
    }
};

window.abrirModalDescripcion = function(idTransaccion) {
    const cuentaActiva = getCuentaActiva();
    transaccionActivaDesc = cuentaActiva.transacciones.find(t => t.id === idTransaccion);
    if (!transaccionActivaDesc) return;

    editDescripcionTexto.value = transaccionActivaDesc.descripcion || '';
    modalDescripcion.classList.remove('opacity-0', 'pointer-events-none');
    modalDescripcionContent.classList.remove('scale-95');
    modalDescripcionContent.classList.add('scale-100');
}

window.cerrarModalDescripcion = function() {
    modalDescripcion.classList.add('opacity-0', 'pointer-events-none');
    modalDescripcionContent.classList.remove('scale-100');
    modalDescripcionContent.classList.add('scale-95');
    transaccionActivaDesc = null;
}

// ==========================================
// 6. EVENT LISTENERS Y TRIGGERS
// ==========================================
btnAjustes.addEventListener('click', (e) => {
    e.stopPropagation();
    window.abrirModalCuentas();
});

btnCerrarDescripcion.addEventListener('click', window.cerrarModalDescripcion);

btnGuardarDescripcion.addEventListener('click', () => {
    if (transaccionActivaDesc) {
        transaccionActivaDesc.descripcion = editDescripcionTexto.value.trim();
        recalcularYRenderizar();
        window.cerrarModalDescripcion();
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(cantidadInput.value);
    const cuentaActiva = getCuentaActiva();

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor ingresa una cantidad válida mayor a 0.");
        return;
    }
    if (cantidad > cuentaActiva.monto_inicial) {
        alert(`Error: El gasto supera el fondo disponible ($${cuentaActiva.monto_inicial.toLocaleString()}).`);
        return;
    }

    const nuevoGasto = {
        id: Date.now().toString(),
        concepto: conceptoInput.value.trim(),
        cantidad: cantidad,
        fecha: fechaInput.value,
        descripcion: "" 
    };

    cuentaActiva.transacciones.push(nuevoGasto);
    recalcularYRenderizar();
    
    conceptoInput.value = '';
    cantidadInput.value = '';
    setFechaActual();
    conceptoInput.blur(); 
});

btnCaptura.addEventListener('click', (e) => {
    e.stopPropagation(); 
    panelIngreso.classList.add('oculto-captura');
    barraControl.classList.add('oculto-captura');
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
    });
});

document.addEventListener('click', (e) => {
    if (panelIngreso.classList.contains('oculto-captura') && 
       !modalCuentasContent.contains(e.target) &&
       !modalDescripcionContent.contains(e.target)) {
        
        panelIngreso.classList.remove('oculto-captura');
        barraControl.classList.remove('oculto-captura');
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    }
});

btnExportar.addEventListener('click', () => {
    const dataStr = JSON.stringify(estadoGlobal, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuentas_claras_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

btnImportar.addEventListener('click', () => inputFile.click());

inputFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const json = JSON.parse(event.target.result);
            if (json.cuentas && json.cuenta_activa_id) {
                estadoGlobal = json;
                recalcularYRenderizar();
                alert("Datos cargados con éxito.");
            } else throw new Error();
        } catch (error) { alert("Archivo inválido."); }
        inputFile.value = '';
    };
    reader.readAsText(file);
});

// ==========================================
// 7. INICIALIZACIÓN
// ==========================================
setFechaActual();
recalcularYRenderizar();