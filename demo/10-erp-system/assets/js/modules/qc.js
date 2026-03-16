const ModuleQC = (function () {
    let filterStatus = '';

    function render() {
        const inspections = State.get('qcInspections') || [];
        let filtered = inspections.filter(function (q) {
            return !filterStatus || q.status === filterStatus;
        });

        $('#module-qc').html(
            '<div class="section-header"><span class="section-title">Quality Control</span></div>' +
            '<div class="flex gap-3 mb-4">' +
                '<select class="filter-select" id="qc-filter">' +
                    '<option value="">Semua Status</option>' +
                    '<option value="Pending"' + (filterStatus === 'Pending' ? ' selected' : '') + '>Pending</option>' +
                    '<option value="Approved"' + (filterStatus === 'Approved' ? ' selected' : '') + '>Approved</option>' +
                    '<option value="Rejected"' + (filterStatus === 'Rejected' ? ' selected' : '') + '>Rejected</option>' +
                    '<option value="Rework"' + (filterStatus === 'Rework' ? ' selected' : '') + '>Rework</option>' +
                '</select>' +
            '</div>' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor QC</th><th>WO</th><th>Produk</th><th>Qty</th><th>Inspector</th><th>Tanggal</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead>' +
                '<tbody>' + (filtered.length ? filtered.map(function (q) {
                    const prod = SEED.products.find(function (p) { return p.id === q.productId; });
                    return '<tr>' +
                        '<td class="font-mono text-orange-400 font-semibold">' + q.id + '</td>' +
                        '<td class="font-mono text-xs">' + q.woId + '</td>' +
                        '<td>' + (prod ? prod.nama : q.productId) + '</td>' +
                        '<td>' + q.qty + '</td>' +
                        '<td>' + q.inspector + '</td>' +
                        '<td class="text-xs">' + q.tanggal + '</td>' +
                        '<td>' + badge(q.status) + '</td>' +
                        '<td><div class="flex gap-2">' +
                            (q.status === 'Pending' ? '<button class="btn-primary btn-sm btn-qc-inspect" data-id="' + q.id + '">Inspeksi</button>' : '') +
                            '<button class="btn-secondary btn-sm btn-qc-detail" data-id="' + q.id + '">Detail</button>' +
                        '</div></td>' +
                    '</tr>';
                }).join('') : '<tr><td colspan="8"><div class="empty-state"><p>Tidak ada data QC Inspection</p></div></td></tr>') +
                '</tbody></table>' +
            '</div></div>'
        );

        $('#qc-filter').off('change').on('change', function () { filterStatus = $(this).val(); render(); });
        $(document).off('click', '.btn-qc-inspect').on('click', '.btn-qc-inspect', function () { showInspectModal($(this).data('id')); });
        $(document).off('click', '.btn-qc-detail').on('click', '.btn-qc-detail', function () { showDetail($(this).data('id')); });
    }

    function showInspectModal(id) {
        const inspections = State.get('qcInspections') || [];
        const qc = inspections.find(function (q) { return q.id === id; });
        if (!qc) return;
        const params = SEED.qcParams[qc.productId] || SEED.qcParams['default'];

        const checklistHtml = params.map(function (p, idx) {
            return '<div class="checklist-row">' +
                '<div class="flex-1">' +
                    '<div class="text-sm text-gray-300 font-medium">' + p.param + '</div>' +
                    '<div class="text-xs text-gray-500">Standar: ' + p.standar + '</div>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button class="checklist-result" data-idx="' + idx + '" data-result="pass">Pass</button>' +
                    '<button class="checklist-result" data-idx="' + idx + '" data-result="fail">Fail</button>' +
                '</div>' +
            '</div>';
        }).join('');

        App.openModal('Inspeksi QC - ' + id,
            '<div class="mb-3 text-xs text-gray-500">Klik Pass atau Fail untuk setiap parameter pemeriksaan.</div>' +
            '<div class="bg-bg rounded-xl border border-border mb-4">' + checklistHtml + '</div>' +
            '<div class="form-group"><label class="form-label">Catatan Inspector</label>' +
                '<input type="text" class="form-input" id="qc-catatan" placeholder="Temuan atau catatan inspeksi"></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Approved', cls: 'btn-primary', action: function () { submitQC(id, 'Approved'); } },
                { label: 'Rejected', cls: 'btn-secondary', action: function () { submitQC(id, 'Rejected'); } },
                { label: 'Rework', cls: 'btn-secondary', action: function () { submitQC(id, 'Rework'); } },
            ]
        );

        $(document).off('click', '.checklist-result').on('click', '.checklist-result', function () {
            const idx = $(this).data('idx');
            const result = $(this).data('result');
            $('[data-idx="' + idx + '"]').removeClass('pass fail');
            $('[data-idx="' + idx + '"][data-result="' + result + '"]').addClass(result);
        });
    }

    function submitQC(id, hasil) {
        const inspections = State.get('qcInspections') || [];
        const idx = inspections.findIndex(function (q) { return q.id === id; });
        if (idx === -1) return;

        const checklist = [];
        $('[data-idx]').each(function () {
            const i = $(this).data('idx');
            if (!checklist[i]) checklist[i] = { result: null };
            if ($(this).hasClass('pass')) checklist[i].result = 'pass';
            if ($(this).hasClass('fail')) checklist[i].result = 'fail';
        });

        inspections[idx].status = hasil;
        inspections[idx].hasil = hasil;
        inspections[idx].checklist = checklist;
        inspections[idx].catatan = $('#qc-catatan').val();
        State.set('qcInspections', inspections);

        if (hasil === 'Approved') {
            const wos = State.get('workOrders') || [];
            const wo = wos.find(function (w) { return w.id === inspections[idx].woId; });
            if (wo) {
                const sos = State.get('salesOrders') || [];
                const soIdx = sos.findIndex(function (s) { return s.id === wo.soId; });
                if (soIdx !== -1 && sos[soIdx].status === 'In Production') {
                    sos[soIdx].status = 'Delivered';
                    State.set('salesOrders', sos);
                    State.autoCreateInvoice(sos[soIdx]);
                }
            }
            State.addActivity('qc', 'QC ' + id + ' disetujui - ' + hasil, 'bg-green-400');
            App.toast('QC Approved. SO otomatis Delivered dan Invoice dibuat.', 'success');
        } else {
            State.addActivity('qc', 'QC ' + id + ' hasil: ' + hasil, 'bg-red-400');
            App.toast('QC ' + hasil, 'warning');
        }

        App.closeModal();
        render();
        App.updateBadges();
    }

    function showDetail(id) {
        const inspections = State.get('qcInspections') || [];
        const qc = inspections.find(function (q) { return q.id === id; });
        if (!qc) return;
        const prod = SEED.products.find(function (p) { return p.id === qc.productId; });
        App.openModal('Detail QC - ' + id,
            '<div class="grid grid-cols-2 gap-3 mb-4">' +
                '<div><div class="form-label">Produk</div><div class="text-sm text-white">' + (prod ? prod.nama : qc.productId) + '</div></div>' +
                '<div><div class="form-label">Status</div>' + badge(qc.status) + '</div>' +
                '<div><div class="form-label">Inspector</div><div class="text-sm text-gray-300">' + qc.inspector + '</div></div>' +
                '<div><div class="form-label">Tanggal</div><div class="text-sm text-gray-300">' + qc.tanggal + '</div></div>' +
            '</div>' +
            (qc.catatan ? '<div class="text-sm text-gray-400 mb-3">Catatan: ' + qc.catatan + '</div>' : '') +
            (qc.checklist && qc.checklist.length ? '<div class="text-xs text-gray-500">Checklist: ' + qc.checklist.filter(function (c) { return c && c.result; }).length + ' parameter dinilai</div>' : ''),
            [{ label: 'Tutup', cls: 'btn-secondary', action: function () { App.closeModal(); } }]
        );
    }

    function badge(status) {
        const map = { 'Pending': 'badge-pending', 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'Rework': 'badge-rework' };
        return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + status + '</span>';
    }

    return { render: render };
})();