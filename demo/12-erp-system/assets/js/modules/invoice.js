const ModuleInvoice = (function () {
    let filterStatus = '';

    function render() {
        const invoices = State.get('invoices') || [];
        let filtered = invoices.filter(function (inv) {
            return !filterStatus || inv.status === filterStatus;
        });

        $('#module-invoice').html(
            '<div class="section-header"><span class="section-title">Invoice Management</span></div>' +
            '<div class="flex gap-3 mb-4">' +
                '<select class="filter-select" id="inv-filter">' +
                    '<option value="">Semua Status</option>' +
                    '<option value="Draft"' + (filterStatus === 'Draft' ? ' selected' : '') + '>Draft</option>' +
                    '<option value="Sent"' + (filterStatus === 'Sent' ? ' selected' : '') + '>Sent</option>' +
                    '<option value="Partial"' + (filterStatus === 'Partial' ? ' selected' : '') + '>Partial</option>' +
                    '<option value="Paid"' + (filterStatus === 'Paid' ? ' selected' : '') + '>Paid</option>' +
                '</select>' +
            '</div>' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor Invoice</th><th>SO</th><th>Customer</th><th>Tanggal</th><th>Jatuh Tempo</th><th>Total Tagihan</th><th>Terbayar</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead>' +
                '<tbody>' + (filtered.length ? filtered.map(function (inv) {
                    const customer = SEED.customers.find(function (c) { return c.id === inv.customerId; });
                    const sisa = inv.totalTagihan - inv.totalBayar;
                    return '<tr>' +
                        '<td class="font-mono text-orange-400 font-semibold">' + inv.id + '</td>' +
                        '<td class="font-mono text-xs">' + inv.soId + '</td>' +
                        '<td>' + (customer ? customer.nama : inv.customerId) + '</td>' +
                        '<td class="text-xs">' + inv.tanggal + '</td>' +
                        '<td class="text-xs">' + inv.jatuhTempo + '</td>' +
                        '<td>Rp ' + Number(inv.totalTagihan).toLocaleString('id-ID') + '</td>' +
                        '<td class="' + (inv.totalBayar >= inv.totalTagihan ? 'text-green-400' : 'text-yellow-400') + '">Rp ' + Number(inv.totalBayar).toLocaleString('id-ID') + '</td>' +
                        '<td>' + badge(inv.status) + '</td>' +
                        '<td><div class="flex gap-2">' +
                            (inv.status === 'Draft' ? '<button class="btn-primary btn-sm btn-inv-send" data-id="' + inv.id + '">Kirim</button>' : '') +
                            (inv.status !== 'Paid' && inv.status !== 'Draft' ? '<button class="btn-secondary btn-sm btn-inv-pay" data-id="' + inv.id + '">Bayar</button>' : '') +
                            '<button class="btn-secondary btn-sm btn-inv-print" data-id="' + inv.id + '">Print</button>' +
                        '</div></td>' +
                    '</tr>';
                }).join('') : '<tr><td colspan="9"><div class="empty-state"><p>Tidak ada data Invoice</p></div></td></tr>') +
                '</tbody></table>' +
            '</div></div>'
        );

        $('#inv-filter').off('change').on('change', function () { filterStatus = $(this).val(); render(); });
        $(document).off('click', '.btn-inv-send').on('click', '.btn-inv-send', function () { sendInvoice($(this).data('id')); });
        $(document).off('click', '.btn-inv-pay').on('click', '.btn-inv-pay', function () { showPayModal($(this).data('id')); });
        $(document).off('click', '.btn-inv-print').on('click', '.btn-inv-print', function () { printInvoice($(this).data('id')); });
    }

    function sendInvoice(id) {
        const invoices = State.get('invoices') || [];
        const idx = invoices.findIndex(function (inv) { return inv.id === id; });
        if (idx === -1) return;
        invoices[idx].status = 'Sent';
        State.set('invoices', invoices);
        State.addActivity('inv', 'Invoice ' + id + ' dikirim ke customer', 'bg-blue-400');
        render();
        App.updateBadges();
        App.toast('Invoice ' + id + ' berhasil dikirim', 'success');
    }

    function showPayModal(id) {
        const invoices = State.get('invoices') || [];
        const inv = invoices.find(function (inv) { return inv.id === id; });
        if (!inv) return;
        const sisa = inv.totalTagihan - inv.totalBayar;
        App.openModal('Catat Pembayaran - ' + id,
            '<div class="mb-4"><div class="form-label">Sisa Tagihan</div>' +
                '<div class="text-xl font-bold text-orange-400">Rp ' + Number(sisa).toLocaleString('id-ID') + '</div></div>' +
            '<div class="form-group"><label class="form-label">Jumlah Bayar (Rp)</label>' +
                '<input type="number" class="form-input" id="pay-amount" min="1" max="' + sisa + '" value="' + sisa + '"></div>' +
            '<div class="form-group"><label class="form-label">Metode Pembayaran</label>' +
                '<select class="form-input" id="pay-method">' +
                    '<option>Transfer Bank</option><option>Giro</option><option>Tunai</option><option>Cek</option>' +
                '</select></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Simpan', cls: 'btn-primary', action: function () {
                    const amount = parseInt($('#pay-amount').val());
                    const method = $('#pay-method').val();
                    if (!amount || amount <= 0) { App.toast('Masukkan jumlah pembayaran', 'warning'); return; }
                    const idx = invoices.findIndex(function (i) { return i.id === id; });
                    invoices[idx].totalBayar = Math.min(invoices[idx].totalTagihan, invoices[idx].totalBayar + amount);
                    invoices[idx].payments = invoices[idx].payments || [];
                    invoices[idx].payments.push({ tanggal: new Date().toISOString().split('T')[0], jumlah: amount, metode: method });
                    invoices[idx].status = invoices[idx].totalBayar >= invoices[idx].totalTagihan ? 'Paid' : 'Partial';

                    const sos = State.get('salesOrders') || [];
                    const soIdx = sos.findIndex(function (s) { return s.id === invoices[idx].soId; });
                    if (soIdx !== -1 && invoices[idx].status === 'Paid') {
                        sos[soIdx].status = 'Invoiced';
                        State.set('salesOrders', sos);
                    }

                    State.set('invoices', invoices);
                    State.addActivity('inv', 'Pembayaran Rp ' + Number(amount).toLocaleString('id-ID') + ' diterima untuk ' + id, 'bg-green-400');
                    App.closeModal();
                    render();
                    App.updateBadges();
                    App.toast('Pembayaran berhasil dicatat. Status: ' + invoices[idx].status, 'success');
                }}
            ]
        );
    }

    function printInvoice(id) {
        const invoices = State.get('invoices') || [];
        const inv = invoices.find(function (i) { return i.id === id; });
        if (!inv) return;
        const customer = SEED.customers.find(function (c) { return c.id === inv.customerId; });
        const sos = State.get('salesOrders') || [];
        const so = sos.find(function (s) { return s.id === inv.soId; });
        const itemRows = so ? so.items.map(function (item) {
            const prod = SEED.products.find(function (p) { return p.id === item.productId; });
            return '<tr><td>' + (prod ? prod.nama : item.productId) + '</td><td>' + item.qty + '</td><td>Rp ' + Number(item.harga).toLocaleString('id-ID') + '</td><td>Rp ' + Number(item.qty * item.harga).toLocaleString('id-ID') + '</td></tr>';
        }).join('') : '';
        $('#print-area').html(
            '<h2>INVOICE - ' + inv.id + '</h2>' +
            '<div class="print-meta">' +
                'Kepada: ' + (customer ? customer.nama : inv.customerId) + '<br>' +
                'Tanggal: ' + inv.tanggal + ' | Jatuh Tempo: ' + inv.jatuhTempo + '<br>' +
                'Status: ' + inv.status +
            '</div>' +
            '<table><thead><tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead><tbody>' + itemRows + '</tbody></table>' +
            '<div style="margin-top:16px;font-weight:700;">Total Tagihan: Rp ' + Number(inv.totalTagihan).toLocaleString('id-ID') + '</div>' +
            '<div>Terbayar: Rp ' + Number(inv.totalBayar).toLocaleString('id-ID') + '</div>' +
            '<div>Sisa: Rp ' + Number(inv.totalTagihan - inv.totalBayar).toLocaleString('id-ID') + '</div>' +
            '<div class="print-footer">PT Sentosa Manufaktur - Demo project by Bagas Aria Sativa - bagasaria93.github.io</div>'
        );
        window.print();
    }

    function badge(status) {
        const map = { 'Draft': 'badge-draft', 'Sent': 'badge-sent', 'Partial': 'badge-partial', 'Paid': 'badge-paid' };
        return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + status + '</span>';
    }

    return { render: render };
})();