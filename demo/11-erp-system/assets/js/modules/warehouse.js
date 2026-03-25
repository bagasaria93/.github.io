const ModuleWarehouse = (function () {
    let searchQ = '';
    let activeTab = 'stock';

    function render() {
        $('#module-warehouse').html(
            '<div class="section-header"><span class="section-title">Warehouse Management</span></div>' +
            '<div class="flex gap-2 mb-5">' +
                '<button class="btn-secondary btn-sm tab-wh' + (activeTab === 'stock' ? ' btn-primary' : '') + '" data-tab="stock">Stock List</button>' +
                '<button class="btn-secondary btn-sm tab-wh' + (activeTab === 'in' ? ' btn-primary' : '') + '" data-tab="in">Stock In</button>' +
                '<button class="btn-secondary btn-sm tab-wh' + (activeTab === 'out' ? ' btn-primary' : '') + '" data-tab="out">Stock Out</button>' +
                '<button class="btn-secondary btn-sm tab-wh' + (activeTab === 'history' ? ' btn-primary' : '') + '" data-tab="history">Stock History</button>' +
            '</div>' +
            '<div id="wh-content"></div>'
        );
        renderTab();
        $('.tab-wh').off('click').on('click', function () {
            activeTab = $(this).data('tab');
            render();
        });
    }

    function renderTab() {
        if (activeTab === 'stock') renderStock();
        if (activeTab === 'in') renderStockIn();
        if (activeTab === 'out') renderStockOut();
        if (activeTab === 'history') renderHistory();
    }

    function renderStock() {
        const materials = State.getMaterials();
        let filtered = materials.filter(function (m) {
            return !searchQ || m.nama.toLowerCase().includes(searchQ.toLowerCase()) || m.kode.toLowerCase().includes(searchQ.toLowerCase());
        });
        $('#wh-content').html(
            '<input class="search-input mb-4" id="wh-search" placeholder="Cari material..." value="' + searchQ + '">' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Kode</th><th>Nama Material</th><th>Satuan</th><th>Stok</th><th>Min</th><th>Lokasi</th><th>Nilai Stok</th><th>Status</th>' +
                '</tr></thead>' +
                '<tbody>' + filtered.map(function (m) {
                    const nilai = m.stok * m.hargaBeli;
                    const status = m.stok === 0 ? '<span class="badge badge-rejected">HABIS</span>' :
                        m.stok <= m.stokMin ? '<span class="badge badge-low">KRITIS</span>' :
                        '<span class="badge badge-ok">NORMAL</span>';
                    return '<tr>' +
                        '<td class="font-mono text-xs text-gray-400">' + m.kode + '</td>' +
                        '<td class="font-medium text-white">' + m.nama + '</td>' +
                        '<td>' + m.satuan + '</td>' +
                        '<td class="font-bold ' + (m.stok <= m.stokMin ? 'text-red-400' : 'text-green-400') + '">' + m.stok + '</td>' +
                        '<td class="text-gray-500">' + m.stokMin + '</td>' +
                        '<td class="font-mono text-xs">' + m.lokasi + '</td>' +
                        '<td>Rp ' + Number(nilai).toLocaleString('id-ID') + '</td>' +
                        '<td>' + status + '</td>' +
                    '</tr>';
                }).join('') + '</tbody>' +
            '</table></div></div>'
        );
        $('#wh-search').on('input', function () { searchQ = $(this).val(); renderStock(); });
    }

    function renderStockIn() {
        const materials = State.getMaterials();
        const poList = State.get('purchaseOrders') || [];
        const matOptions = materials.map(function (m) {
            return '<option value="' + m.id + '">' + m.nama + ' (stok: ' + m.stok + ' ' + m.satuan + ')</option>';
        }).join('');
        const poOptions = '<option value="">Pilih PO (opsional)</option>' + poList.map(function (po) {
            return '<option value="' + po.id + '">' + po.id + '</option>';
        }).join('');
        $('#wh-content').html(
            '<div class="bg-card border border-border rounded-2xl p-5 max-w-lg">' +
                '<h3 class="font-semibold text-white mb-4">Form Stock In</h3>' +
                '<div class="form-group"><label class="form-label">Material</label>' +
                    '<select class="form-input" id="si-material">' + matOptions + '</select></div>' +
                '<div class="form-group"><label class="form-label">Referensi PO</label>' +
                    '<select class="form-input" id="si-po">' + poOptions + '</select></div>' +
                '<div class="form-group"><label class="form-label">Jumlah</label>' +
                    '<input type="number" class="form-input" id="si-qty" min="1" value="1"></div>' +
                '<div class="form-group"><label class="form-label">Keterangan</label>' +
                    '<input type="text" class="form-input" id="si-ket" placeholder="Keterangan penerimaan"></div>' +
                '<button class="btn-primary" id="btn-si-submit">Simpan Stock In</button>' +
            '</div>'
        );
        $('#btn-si-submit').on('click', function () {
            const matId = $('#si-material').val();
            const qty = parseInt($('#si-qty').val());
            const po = $('#si-po').val();
            const ket = $('#si-ket').val() || 'Stock In Manual';
            if (!matId || !qty || qty < 1) { App.toast('Isi material dan jumlah dengan benar', 'warning'); return; }
            State.updateMaterialStock(matId, qty, 'masuk', po || 'MANUAL', ket);
            State.addActivity('wh', 'Stock In: +' + qty + ' unit ' + matId, 'bg-green-400');
            App.toast('Stock In berhasil disimpan', 'success');
            render();
            App.updateBadges();
        });
    }

    function renderStockOut() {
        const materials = State.getMaterials();
        const woList = (State.get('workOrders') || []).filter(function (w) { return w.status === 'In Progress' || w.status === 'Not Started'; });
        const matOptions = materials.map(function (m) {
            return '<option value="' + m.id + '">' + m.nama + ' (stok: ' + m.stok + ' ' + m.satuan + ')</option>';
        }).join('');
        const woOptions = '<option value="">Pilih WO (opsional)</option>' + woList.map(function (wo) {
            return '<option value="' + wo.id + '">' + wo.id + '</option>';
        }).join('');
        $('#wh-content').html(
            '<div class="bg-card border border-border rounded-2xl p-5 max-w-lg">' +
                '<h3 class="font-semibold text-white mb-4">Form Stock Out</h3>' +
                '<div class="form-group"><label class="form-label">Material</label>' +
                    '<select class="form-input" id="so2-material">' + matOptions + '</select></div>' +
                '<div class="form-group"><label class="form-label">Referensi WO</label>' +
                    '<select class="form-input" id="so2-wo">' + woOptions + '</select></div>' +
                '<div class="form-group"><label class="form-label">Jumlah</label>' +
                    '<input type="number" class="form-input" id="so2-qty" min="1" value="1"></div>' +
                '<div class="form-group"><label class="form-label">Keterangan</label>' +
                    '<input type="text" class="form-input" id="so2-ket" placeholder="Keterangan pengeluaran"></div>' +
                '<button class="btn-primary" id="btn-so2-submit">Simpan Stock Out</button>' +
            '</div>'
        );
        $('#btn-so2-submit').on('click', function () {
            const matId = $('#so2-material').val();
            const qty = parseInt($('#so2-qty').val());
            const wo = $('#so2-wo').val();
            const ket = $('#so2-ket').val() || 'Stock Out Manual';
            if (!matId || !qty || qty < 1) { App.toast('Isi material dan jumlah dengan benar', 'warning'); return; }
            const materials = State.getMaterials();
            const mat = materials.find(function (m) { return m.id === matId; });
            if (mat && qty > mat.stok) { App.toast('Stok tidak mencukupi. Stok saat ini: ' + mat.stok, 'warning'); return; }
            State.updateMaterialStock(matId, -qty, 'keluar', wo || 'MANUAL', ket);
            State.addActivity('wh', 'Stock Out: -' + qty + ' unit ' + matId, 'bg-red-400');
            App.toast('Stock Out berhasil disimpan', 'success');
            render();
            App.updateBadges();
        });
    }

    function renderHistory() {
        const history = State.get('stockHistory') || [];
        $('#wh-content').html(
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Tanggal</th><th>Material</th><th>Tipe</th><th>Qty</th><th>Stok Sebelum</th><th>Stok Sesudah</th><th>Referensi</th><th>Keterangan</th>' +
                '</tr></thead>' +
                '<tbody>' + (history.length ? history.slice(0, 30).map(function (h) {
                    const mat = State.getMaterials().find(function (m) { return m.id === h.materialId; });
                    const tipeClass = h.tipe === 'masuk' || h.tipe === 'retur' ? 'text-green-400' : 'text-red-400';
                    return '<tr>' +
                        '<td class="text-xs">' + h.tanggal + '</td>' +
                        '<td>' + (mat ? mat.nama : h.materialId) + '</td>' +
                        '<td><span class="font-semibold ' + tipeClass + '">' + h.tipe.toUpperCase() + '</span></td>' +
                        '<td class="font-bold">' + h.qty + '</td>' +
                        '<td class="text-gray-500">' + h.stokSebelum + '</td>' +
                        '<td class="text-gray-300">' + h.stokSesudah + '</td>' +
                        '<td class="font-mono text-xs text-orange-400">' + (h.ref || '-') + '</td>' +
                        '<td class="text-xs text-gray-500">' + (h.keterangan || '-') + '</td>' +
                    '</tr>';
                }).join('') : '<tr><td colspan="8"><div class="empty-state"><p>Belum ada riwayat transaksi</p></div></td></tr>') +
                '</tbody></table>' +
            '</div></div>'
        );
    }

    return { render: render };
})();