const ModulePurchase = (function () {
    let activeTab = 'pr';

    function render() {
        $('#module-purchase').html(
            '<div class="section-header"><span class="section-title">Purchase Management</span></div>' +
            '<div class="flex gap-2 mb-5">' +
                '<button class="btn-secondary btn-sm tab-pur' + (activeTab === 'pr' ? ' btn-primary' : '') + '" data-tab="pr">Purchase Request</button>' +
                '<button class="btn-secondary btn-sm tab-pur' + (activeTab === 'po' ? ' btn-primary' : '') + '" data-tab="po">Purchase Order</button>' +
            '</div>' +
            '<div id="pur-content"></div>'
        );
        renderTab();
        $('.tab-pur').off('click').on('click', function () {
            activeTab = $(this).data('tab');
            render();
        });
    }

    function renderTab() {
        if (activeTab === 'pr') renderPR();
        if (activeTab === 'po') renderPO();
    }

    function renderPR() {
        const prs = State.get('purchaseRequests') || [];
        const materials = State.getMaterials();
        $('#pur-content').html(
            '<div class="section-header mb-3">' +
                '<span class="text-sm font-semibold text-gray-400">Purchase Request</span>' +
                '<button class="btn-primary btn-sm" id="btn-create-pr">+ Buat PR Manual</button>' +
            '</div>' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor PR</th><th>Material</th><th>Qty</th><th>Alasan</th><th>Tanggal</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead>' +
                '<tbody>' + (prs.length ? prs.map(function (pr) {
                    const mat = materials.find(function (m) { return m.id === pr.materialId; });
                    return '<tr>' +
                        '<td class="font-mono text-orange-400 font-semibold">' + pr.id + '</td>' +
                        '<td>' + (mat ? mat.nama : pr.materialId) + '</td>' +
                        '<td>' + pr.qty + ' ' + (mat ? mat.satuan : '') + '</td>' +
                        '<td class="text-xs text-gray-400">' + pr.alasan + '</td>' +
                        '<td class="text-xs">' + pr.tanggal + '</td>' +
                        '<td>' + badge(pr.status) + '</td>' +
                        '<td><div class="flex gap-2">' +
                            (pr.status === 'Pending' ? '<button class="btn-primary btn-sm btn-pr-approve" data-id="' + pr.id + '">Approve</button>' : '') +
                            (pr.status === 'Pending' ? '<button class="btn-secondary btn-sm btn-pr-reject" data-id="' + pr.id + '">Reject</button>' : '') +
                            (pr.status === 'Approved' ? '<button class="btn-secondary btn-sm btn-pr-po" data-id="' + pr.id + '">Buat PO</button>' : '') +
                        '</div></td>' +
                    '</tr>';
                }).join('') : '<tr><td colspan="7"><div class="empty-state"><p>Tidak ada Purchase Request</p></div></td></tr>') +
                '</tbody></table>' +
            '</div></div>'
        );
        bindPREvents();
    }

    function bindPREvents() {
        $('#btn-create-pr').off('click').on('click', showCreatePRModal);
        $(document).off('click', '.btn-pr-approve').on('click', '.btn-pr-approve', function () {
            updatePRStatus($(this).data('id'), 'Approved');
        });
        $(document).off('click', '.btn-pr-reject').on('click', '.btn-pr-reject', function () {
            updatePRStatus($(this).data('id'), 'Rejected');
        });
        $(document).off('click', '.btn-pr-po').on('click', '.btn-pr-po', function () {
            showCreatePOModal($(this).data('id'));
        });
    }

    function showCreatePRModal() {
        const materials = State.getMaterials();
        const matOptions = materials.map(function (m) {
            return '<option value="' + m.id + '">' + m.nama + ' (stok: ' + m.stok + ')</option>';
        }).join('');
        App.openModal('Buat Purchase Request',
            '<div class="form-group"><label class="form-label">Material</label>' +
                '<select class="form-input" id="pr-mat">' + matOptions + '</select></div>' +
            '<div class="form-group"><label class="form-label">Jumlah</label>' +
                '<input type="number" class="form-input" id="pr-qty" min="1" value="1"></div>' +
            '<div class="form-group"><label class="form-label">Alasan</label>' +
                '<input type="text" class="form-input" id="pr-alasan" placeholder="Alasan permintaan pembelian"></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Simpan', cls: 'btn-primary', action: function () {
                    const matId = $('#pr-mat').val();
                    const qty = parseInt($('#pr-qty').val());
                    const alasan = $('#pr-alasan').val() || 'Permintaan manual';
                    if (!matId || !qty) { App.toast('Lengkapi semua field', 'warning'); return; }
                    const prs = State.get('purchaseRequests') || [];
                    prs.push({ id: State.genId('PR'), materialId: matId, qty: qty, status: 'Pending', alasan: alasan, tanggal: new Date().toISOString().split('T')[0], approvedBy: null });
                    State.set('purchaseRequests', prs);
                    State.addActivity('pr', 'PR manual dibuat untuk ' + matId, 'bg-yellow-400');
                    App.closeModal();
                    renderPR();
                    App.updateBadges();
                    App.toast('Purchase Request berhasil dibuat', 'success');
                }}
            ]
        );
    }

    function updatePRStatus(id, status) {
        const prs = State.get('purchaseRequests') || [];
        const idx = prs.findIndex(function (p) { return p.id === id; });
        if (idx === -1) return;
        prs[idx].status = status;
        if (status === 'Approved') prs[idx].approvedBy = 'Manajer Produksi';
        State.set('purchaseRequests', prs);
        State.addActivity('pr', 'PR ' + id + ' ' + status, status === 'Approved' ? 'bg-green-400' : 'bg-red-400');
        renderPR();
        App.updateBadges();
        App.toast('PR ' + id + ' ' + status, status === 'Approved' ? 'success' : 'warning');
    }

    function showCreatePOModal(prId) {
        const prs = State.get('purchaseRequests') || [];
        const pr = prs.find(function (p) { return p.id === prId; });
        if (!pr) return;
        const materials = State.getMaterials();
        const mat = materials.find(function (m) { return m.id === pr.materialId; });
        const supOptions = SEED.suppliers.map(function (s) {
            return '<option value="' + s.id + '">' + s.nama + ' - ' + s.kota + '</option>';
        }).join('');
        App.openModal('Buat Purchase Order dari ' + prId,
            '<div class="form-group"><label class="form-label">Material</label>' +
                '<div class="form-input bg-bg/50 text-gray-400">' + (mat ? mat.nama : pr.materialId) + '</div></div>' +
            '<div class="form-group"><label class="form-label">Qty</label>' +
                '<input type="number" class="form-input" id="po-qty" value="' + pr.qty + '" min="1"></div>' +
            '<div class="form-group"><label class="form-label">Supplier</label>' +
                '<select class="form-input" id="po-supplier">' + supOptions + '</select></div>' +
            '<div class="form-group"><label class="form-label">Harga Satuan (Rp)</label>' +
                '<input type="number" class="form-input" id="po-harga" value="' + (mat ? mat.hargaBeli : 0) + '"></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Buat PO', cls: 'btn-primary', action: function () {
                    const qty = parseInt($('#po-qty').val());
                    const supplierId = $('#po-supplier').val();
                    const harga = parseInt($('#po-harga').val());
                    if (!qty || !supplierId || !harga) { App.toast('Lengkapi semua field', 'warning'); return; }
                    const pos = State.get('purchaseOrders') || [];
                    pos.push({
                        id: State.genId('PO'), prId: prId, supplierId: supplierId,
                        materialId: pr.materialId, qty: qty, harga: harga,
                        status: 'Draft', tanggal: new Date().toISOString().split('T')[0], tanggalTerima: null
                    });
                    State.set('purchaseOrders', pos);
                    State.addActivity('po', 'PO dibuat dari ' + prId, 'bg-blue-400');
                    App.closeModal();
                    activeTab = 'po';
                    render();
                    App.updateBadges();
                    App.toast('Purchase Order berhasil dibuat', 'success');
                }}
            ]
        );
    }

    function renderPO() {
        const pos = State.get('purchaseOrders') || [];
        const materials = State.getMaterials();
        $('#pur-content').html(
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor PO</th><th>PR</th><th>Supplier</th><th>Material</th><th>Qty</th><th>Total</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead>' +
                '<tbody>' + (pos.length ? pos.map(function (po) {
                    const sup = SEED.suppliers.find(function (s) { return s.id === po.supplierId; });
                    const mat = materials.find(function (m) { return m.id === po.materialId; });
                    return '<tr>' +
                        '<td class="font-mono text-orange-400 font-semibold">' + po.id + '</td>' +
                        '<td class="font-mono text-xs">' + (po.prId || '-') + '</td>' +
                        '<td>' + (sup ? sup.nama : po.supplierId) + '</td>' +
                        '<td>' + (mat ? mat.nama : po.materialId) + '</td>' +
                        '<td>' + po.qty + '</td>' +
                        '<td>Rp ' + Number(po.qty * po.harga).toLocaleString('id-ID') + '</td>' +
                        '<td>' + badge(po.status) + '</td>' +
                        '<td><div class="flex gap-2">' +
                            (po.status === 'Draft' ? '<button class="btn-primary btn-sm btn-po-send" data-id="' + po.id + '">Kirim</button>' : '') +
                            (po.status === 'Sent' ? '<button class="btn-secondary btn-sm btn-po-receive" data-id="' + po.id + '">Terima</button>' : '') +
                        '</div></td>' +
                    '</tr>';
                }).join('') : '<tr><td colspan="8"><div class="empty-state"><p>Tidak ada Purchase Order</p></div></td></tr>') +
                '</tbody></table>' +
            '</div></div>'
        );
        $(document).off('click', '.btn-po-send').on('click', '.btn-po-send', function () { updatePOStatus($(this).data('id'), 'Sent'); });
        $(document).off('click', '.btn-po-receive').on('click', '.btn-po-receive', function () { receivePO($(this).data('id')); });
    }

    function updatePOStatus(id, status) {
        const pos = State.get('purchaseOrders') || [];
        const idx = pos.findIndex(function (p) { return p.id === id; });
        if (idx === -1) return;
        pos[idx].status = status;
        State.set('purchaseOrders', pos);
        State.addActivity('po', 'PO ' + id + ' status: ' + status, 'bg-blue-400');
        renderPO();
        App.toast('PO ' + id + ' ' + status, 'success');
    }

    function receivePO(id) {
        const pos = State.get('purchaseOrders') || [];
        const idx = pos.findIndex(function (p) { return p.id === id; });
        if (idx === -1) return;
        pos[idx].status = 'Completed';
        pos[idx].tanggalTerima = new Date().toISOString().split('T')[0];
        State.set('purchaseOrders', pos);
        State.updateMaterialStock(pos[idx].materialId, pos[idx].qty, 'masuk', id, 'Penerimaan dari PO ' + id);
        State.addActivity('po', 'PO ' + id + ' diterima. Stok diupdate.', 'bg-green-400');
        renderPO();
        App.updateBadges();
        App.toast('PO diterima. Stok material diupdate.', 'success');
    }

    function badge(status) {
        const map = { 'Pending': 'badge-pending', 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'Draft': 'badge-draft', 'Sent': 'badge-sent', 'Completed': 'badge-completed' };
        return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + status + '</span>';
    }

    return { render: render };
})();