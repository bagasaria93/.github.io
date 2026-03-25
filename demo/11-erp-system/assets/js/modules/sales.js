const ModuleSales = (function () {
    let filterStatus = '';
    let searchQ = '';

    function render() {
        const sos = State.get('salesOrders') || [];
        $('#module-sales').html(
            '<div class="section-header">' +
                '<span class="section-title">Sales Order</span>' +
                '<button class="btn-primary" id="btn-create-so"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Buat SO</button>' +
            '</div>' +
            '<div class="flex flex-wrap gap-3 mb-4">' +
                '<input class="search-input" id="so-search" placeholder="Cari nomor SO atau customer..." value="' + searchQ + '">' +
                '<select class="filter-select" id="so-filter">' +
                    '<option value="">Semua Status</option>' +
                    '<option value="Draft"' + (filterStatus === 'Draft' ? ' selected' : '') + '>Draft</option>' +
                    '<option value="Confirmed"' + (filterStatus === 'Confirmed' ? ' selected' : '') + '>Confirmed</option>' +
                    '<option value="In Production"' + (filterStatus === 'In Production' ? ' selected' : '') + '>In Production</option>' +
                    '<option value="Delivered"' + (filterStatus === 'Delivered' ? ' selected' : '') + '>Delivered</option>' +
                    '<option value="Invoiced"' + (filterStatus === 'Invoiced' ? ' selected' : '') + '>Invoiced</option>' +
                '</select>' +
            '</div>' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor SO</th><th>Customer</th><th>Tanggal</th><th>Target Kirim</th><th>Total</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead><tbody id="so-tbody"></tbody></table>' +
            '</div></div>'
        );
        renderRows();
        bindEvents();
    }

    function renderRows() {
        const sos = State.get('salesOrders') || [];
        let filtered = sos.filter(function (so) {
            const customer = SEED.customers.find(function (c) { return c.id === so.customerId; });
            const nama = customer ? customer.nama : '';
            const matchSearch = !searchQ || so.id.toLowerCase().includes(searchQ.toLowerCase()) || nama.toLowerCase().includes(searchQ.toLowerCase());
            const matchStatus = !filterStatus || so.status === filterStatus;
            return matchSearch && matchStatus;
        });

        if (!filtered.length) {
            $('#so-tbody').html('<tr><td colspan="7"><div class="empty-state"><p>Tidak ada data Sales Order</p></div></td></tr>');
            return;
        }

        $('#so-tbody').html(filtered.map(function (so) {
            const customer = SEED.customers.find(function (c) { return c.id === so.customerId; });
            const total = so.items.reduce(function (s, i) { return s + i.qty * i.harga; }, 0);
            return '<tr>' +
                '<td class="font-mono text-orange-400 font-semibold">' + so.id + '</td>' +
                '<td>' + (customer ? customer.nama : so.customerId) + '</td>' +
                '<td>' + so.tanggal + '</td>' +
                '<td>' + so.targetKirim + '</td>' +
                '<td>Rp ' + Number(total).toLocaleString('id-ID') + '</td>' +
                '<td>' + badge(so.status) + '</td>' +
                '<td><div class="flex gap-2">' +
                    '<button class="btn-secondary btn-sm btn-so-detail" data-id="' + so.id + '">Detail</button>' +
                    (so.status === 'Draft' ? '<button class="btn-primary btn-sm btn-so-confirm" data-id="' + so.id + '">Konfirmasi</button>' : '') +
                    (so.status === 'In Production' ? '<button class="btn-secondary btn-sm btn-so-deliver" data-id="' + so.id + '">Kirim</button>' : '') +
                    (so.status === 'Draft' ? '<button class="btn-secondary btn-sm btn-so-print" data-id="' + so.id + '">Print</button>' : '') +
                '</div></td>' +
            '</tr>';
        }).join(''));
    }

    function bindEvents() {
        $('#btn-create-so').off('click').on('click', showCreateModal);
        $('#so-search').off('input').on('input', function () { searchQ = $(this).val(); renderRows(); });
        $('#so-filter').off('change').on('change', function () { filterStatus = $(this).val(); renderRows(); });

        $(document).off('click', '.btn-so-detail').on('click', '.btn-so-detail', function () {
            showDetail($(this).data('id'));
        });
        $(document).off('click', '.btn-so-confirm').on('click', '.btn-so-confirm', function () {
            confirmSO($(this).data('id'));
        });
        $(document).off('click', '.btn-so-deliver').on('click', '.btn-so-deliver', function () {
            deliverSO($(this).data('id'));
        });
        $(document).off('click', '.btn-so-print').on('click', '.btn-so-print', function () {
            printSO($(this).data('id'));
        });
    }

    function showCreateModal() {
        const customerOptions = SEED.customers.map(function (c) {
            return '<option value="' + c.id + '">' + c.nama + '</option>';
        }).join('');
        const productOptions = SEED.products.map(function (p) {
            return '<option value="' + p.id + '" data-harga="' + p.harga + '">' + p.nama + ' - Rp ' + Number(p.harga).toLocaleString('id-ID') + '</option>';
        }).join('');

        App.openModal('Buat Sales Order Baru',
            '<div class="form-group"><label class="form-label">Customer</label>' +
                '<select class="form-input" id="so-customer">' + customerOptions + '</select></div>' +
            '<div class="form-group"><label class="form-label">Target Kirim</label>' +
                '<input type="date" class="form-input" id="so-target"></div>' +
            '<div class="form-group"><label class="form-label">Produk</label>' +
                '<select class="form-input" id="so-product">' + productOptions + '</select></div>' +
            '<div class="grid grid-cols-2 gap-3">' +
                '<div class="form-group"><label class="form-label">Qty</label>' +
                    '<input type="number" class="form-input" id="so-qty" min="1" value="1"></div>' +
                '<div class="form-group"><label class="form-label">Harga Satuan</label>' +
                    '<input type="number" class="form-input" id="so-harga"></div>' +
            '</div>' +
            '<div class="form-group"><label class="form-label">Catatan</label>' +
                '<input type="text" class="form-input" id="so-catatan" placeholder="Opsional"></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Simpan', cls: 'btn-primary', action: saveSO }
            ]
        );

        $('#so-product').on('change', function () {
            const harga = $(this).find('option:selected').data('harga');
            $('#so-harga').val(harga);
        }).trigger('change');
    }

    function saveSO() {
        const customerId = $('#so-customer').val();
        const target = $('#so-target').val();
        const productId = $('#so-product').val();
        const qty = parseInt($('#so-qty').val());
        const harga = parseInt($('#so-harga').val());
        const catatan = $('#so-catatan').val();

        if (!customerId || !target || !productId || !qty || !harga) {
            App.toast('Lengkapi semua field wajib', 'warning'); return;
        }

        const sos = State.get('salesOrders') || [];
        const newSO = {
            id: State.genId('SO'),
            customerId: customerId,
            tanggal: new Date().toISOString().split('T')[0],
            targetKirim: target,
            status: 'Draft',
            items: [{ productId: productId, qty: qty, harga: harga }],
            catatan: catatan
        };
        sos.push(newSO);
        State.set('salesOrders', sos);
        State.addActivity('so', 'SO ' + newSO.id + ' dibuat', 'bg-blue-400');
        App.closeModal();
        render();
        App.updateBadges();
        App.toast('Sales Order ' + newSO.id + ' berhasil dibuat', 'success');
    }

    function confirmSO(id) {
        const sos = State.get('salesOrders') || [];
        const idx = sos.findIndex(function (s) { return s.id === id; });
        if (idx === -1) return;
        sos[idx].status = 'Confirmed';
        State.set('salesOrders', sos);
        State.autoCreateWO(sos[idx]);
        render();
        App.updateBadges();
        App.toast('SO ' + id + ' dikonfirmasi. Work Order dibuat otomatis.', 'success');
    }

    function deliverSO(id) {
        const sos = State.get('salesOrders') || [];
        const idx = sos.findIndex(function (s) { return s.id === id; });
        if (idx === -1) return;
        sos[idx].status = 'Delivered';
        State.set('salesOrders', sos);
        State.autoCreateInvoice(sos[idx]);
        State.addActivity('so', 'SO ' + id + ' dikirim ke customer', 'bg-purple-400');
        render();
        App.updateBadges();
        App.toast('SO ' + id + ' ditandai Delivered. Invoice dibuat otomatis.', 'success');
    }

    function showDetail(id) {
        const sos = State.get('salesOrders') || [];
        const so = sos.find(function (s) { return s.id === id; });
        if (!so) return;
        const customer = SEED.customers.find(function (c) { return c.id === so.customerId; });
        const total = so.items.reduce(function (s, i) { return s + i.qty * i.harga; }, 0);
        const itemRows = so.items.map(function (item) {
            const prod = SEED.products.find(function (p) { return p.id === item.productId; });
            return '<tr><td>' + (prod ? prod.nama : item.productId) + '</td><td>' + item.qty + '</td>' +
                '<td>Rp ' + Number(item.harga).toLocaleString('id-ID') + '</td>' +
                '<td>Rp ' + Number(item.qty * item.harga).toLocaleString('id-ID') + '</td></tr>';
        }).join('');

        App.openModal('Detail - ' + so.id,
            '<div class="grid grid-cols-2 gap-3 mb-4">' +
                '<div><div class="form-label">Customer</div><div class="text-sm text-white">' + (customer ? customer.nama : so.customerId) + '</div></div>' +
                '<div><div class="form-label">Status</div><div>' + badge(so.status) + '</div></div>' +
                '<div><div class="form-label">Tanggal</div><div class="text-sm text-gray-300">' + so.tanggal + '</div></div>' +
                '<div><div class="form-label">Target Kirim</div><div class="text-sm text-gray-300">' + so.targetKirim + '</div></div>' +
            '</div>' +
            '<div class="table-wrap mb-3"><div class="table-scroll"><table class="erp-table"><thead><tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>' + itemRows + '</tbody></table></div></div>' +
            '<div class="flex justify-between items-center px-2"><span class="text-sm text-gray-400">Total</span><span class="font-bold text-orange-400">Rp ' + Number(total).toLocaleString('id-ID') + '</span></div>' +
            (so.catatan ? '<div class="mt-3 text-xs text-gray-500">Catatan: ' + so.catatan + '</div>' : ''),
            [{ label: 'Tutup', cls: 'btn-secondary', action: function () { App.closeModal(); } }]
        );
    }

    function printSO(id) {
        const sos = State.get('salesOrders') || [];
        const so = sos.find(function (s) { return s.id === id; });
        if (!so) return;
        const customer = SEED.customers.find(function (c) { return c.id === so.customerId; });
        const total = so.items.reduce(function (s, i) { return s + i.qty * i.harga; }, 0);
        const rows = so.items.map(function (item) {
            const prod = SEED.products.find(function (p) { return p.id === item.productId; });
            return '<tr><td>' + (prod ? prod.nama : item.productId) + '</td><td>' + item.qty + '</td><td>Rp ' + Number(item.harga).toLocaleString('id-ID') + '</td><td>Rp ' + Number(item.qty * item.harga).toLocaleString('id-ID') + '</td></tr>';
        }).join('');
        $('#print-area').html(
            '<h2>' + so.id + '</h2>' +
            '<div class="print-meta">Customer: ' + (customer ? customer.nama : so.customerId) + ' | Tanggal: ' + so.tanggal + ' | Target Kirim: ' + so.targetKirim + '</div>' +
            '<table><thead><tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div style="margin-top:16px;font-weight:700;">Total: Rp ' + Number(total).toLocaleString('id-ID') + '</div>' +
            '<div class="print-footer">PT Sentosa Manufaktur - Demo project by Bagas Aria Sativa - bagasaria93.github.io</div>'
        );
        window.print();
    }

    function badge(status) {
        const map = { 'Draft': 'badge-draft', 'Confirmed': 'badge-confirmed', 'In Production': 'badge-inprogress', 'Delivered': 'badge-delivered', 'Invoiced': 'badge-invoiced' };
        return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + status + '</span>';
    }

    return { render: render };
})();