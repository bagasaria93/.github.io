const ModuleProduction = (function () {
    let filterStatus = '';
    let searchQ = '';

    function render() {
        $('#module-production').html(
            '<div class="section-header">' +
                '<span class="section-title">Production - Work Orders</span>' +
            '</div>' +
            '<div class="flex flex-wrap gap-3 mb-4">' +
                '<input class="search-input" id="wo-search" placeholder="Cari nomor WO atau SO..." value="' + searchQ + '">' +
                '<select class="filter-select" id="wo-filter">' +
                    '<option value="">Semua Status</option>' +
                    '<option value="Not Started"' + (filterStatus === 'Not Started' ? ' selected' : '') + '>Not Started</option>' +
                    '<option value="In Progress"' + (filterStatus === 'In Progress' ? ' selected' : '') + '>In Progress</option>' +
                    '<option value="QC"' + (filterStatus === 'QC' ? ' selected' : '') + '>QC</option>' +
                    '<option value="Completed"' + (filterStatus === 'Completed' ? ' selected' : '') + '>Completed</option>' +
                '</select>' +
            '</div>' +
            '<div class="table-wrap"><div class="table-scroll">' +
                '<table class="erp-table"><thead><tr>' +
                    '<th>Nomor WO</th><th>SO</th><th>Produk</th><th>Qty</th><th>Work Center</th><th>Progress</th><th>Target</th><th>Status</th><th>Aksi</th>' +
                '</tr></thead><tbody id="wo-tbody"></tbody></table>' +
            '</div></div>'
        );
        renderRows();
        bindEvents();
    }

    function renderRows() {
        const wos = State.get('workOrders') || [];
        let filtered = wos.filter(function (wo) {
            const matchSearch = !searchQ || wo.id.toLowerCase().includes(searchQ.toLowerCase()) || wo.soId.toLowerCase().includes(searchQ.toLowerCase());
            const matchStatus = !filterStatus || wo.status === filterStatus;
            return matchSearch && matchStatus;
        });

        if (!filtered.length) {
            $('#wo-tbody').html('<tr><td colspan="9"><div class="empty-state"><p>Tidak ada Work Order</p></div></td></tr>');
            return;
        }

        $('#wo-tbody').html(filtered.map(function (wo) {
            const prod = SEED.products.find(function (p) { return p.id === wo.productId; });
            const wc = SEED.workCenters.find(function (w) { return w.id === wo.workCenterId; });
            return '<tr>' +
                '<td class="font-mono text-orange-400 font-semibold">' + wo.id + '</td>' +
                '<td class="font-mono text-xs">' + wo.soId + '</td>' +
                '<td>' + (prod ? prod.nama : wo.productId) + '</td>' +
                '<td>' + wo.qty + '</td>' +
                '<td>' + (wc ? wc.nama : wo.workCenterId) + '</td>' +
                '<td style="min-width:120px;">' +
                    '<div class="flex items-center gap-2">' +
                        '<div class="progress-bar-wrap flex-1"><div class="progress-bar-fill" style="width:' + wo.progress + '%"></div></div>' +
                        '<span class="text-xs text-gray-400">' + wo.progress + '%</span>' +
                    '</div>' +
                '</td>' +
                '<td class="text-xs">' + (wo.targetDate || '-') + '</td>' +
                '<td>' + badge(wo.status) + '</td>' +
                '<td><div class="flex gap-2">' +
                    (wo.status === 'Not Started' ? '<button class="btn-primary btn-sm btn-wo-start" data-id="' + wo.id + '">Mulai</button>' : '') +
                    (wo.status === 'In Progress' ? '<button class="btn-secondary btn-sm btn-wo-progress" data-id="' + wo.id + '">Update</button>' : '') +
                    (wo.status === 'In Progress' ? '<button class="btn-primary btn-sm btn-wo-complete" data-id="' + wo.id + '">Selesai</button>' : '') +
                    (wo.status === 'Completed' ? '<button class="btn-secondary btn-sm btn-wo-print" data-id="' + wo.id + '">Print</button>' : '') +
                '</div></td>' +
            '</tr>';
        }).join(''));
    }

    function bindEvents() {
        $('#wo-search').off('input').on('input', function () { searchQ = $(this).val(); renderRows(); });
        $('#wo-filter').off('change').on('change', function () { filterStatus = $(this).val(); renderRows(); });

        $(document).off('click', '.btn-wo-start').on('click', '.btn-wo-start', function () { startWO($(this).data('id')); });
        $(document).off('click', '.btn-wo-progress').on('click', '.btn-wo-progress', function () { updateProgress($(this).data('id')); });
        $(document).off('click', '.btn-wo-complete').on('click', '.btn-wo-complete', function () { completeWO($(this).data('id')); });
        $(document).off('click', '.btn-wo-print').on('click', '.btn-wo-print', function () { printWO($(this).data('id')); });
    }

    function startWO(id) {
        const wos = State.get('workOrders') || [];
        const idx = wos.findIndex(function (w) { return w.id === id; });
        if (idx === -1) return;
        wos[idx].status = 'In Progress';
        wos[idx].progress = 10;
        wos[idx].startDate = new Date().toISOString().split('T')[0];

        const sos = State.get('salesOrders') || [];
        const soIdx = sos.findIndex(function (s) { return s.id === wos[idx].soId; });
        if (soIdx !== -1 && sos[soIdx].status === 'Confirmed') {
            sos[soIdx].status = 'In Production';
            State.set('salesOrders', sos);
        }

        State.set('workOrders', wos);
        State.addActivity('wo', 'WO ' + id + ' dimulai', 'bg-orange-400');
        render();
        App.updateBadges();
        App.toast('Work Order ' + id + ' dimulai', 'success');
    }

    function updateProgress(id) {
        const wos = State.get('workOrders') || [];
        const wo = wos.find(function (w) { return w.id === id; });
        if (!wo) return;
        App.openModal('Update Progress - ' + id,
            '<div class="form-group"><label class="form-label">Progress (%)</label>' +
                '<input type="range" class="w-full" id="prog-range" min="' + (wo.progress + 5) + '" max="95" step="5" value="' + wo.progress + '">' +
                '<div class="text-center text-orange-400 font-bold mt-2" id="prog-val">' + wo.progress + '%</div></div>' +
            '<div class="form-group"><label class="form-label">Work Center</label>' +
                '<select class="form-input" id="prog-wc">' +
                    SEED.workCenters.map(function (wc) {
                        return '<option value="' + wc.id + '"' + (wo.workCenterId === wc.id ? ' selected' : '') + '>' + wc.nama + '</option>';
                    }).join('') +
                '</select></div>',
            [
                { label: 'Batal', cls: 'btn-secondary', action: function () { App.closeModal(); } },
                { label: 'Simpan', cls: 'btn-primary', action: function () {
                    const newProg = parseInt($('#prog-range').val());
                    const newWC = $('#prog-wc').val();
                    const idx = wos.findIndex(function (w) { return w.id === id; });
                    wos[idx].progress = newProg;
                    wos[idx].workCenterId = newWC;
                    State.set('workOrders', wos);
                    State.addActivity('wo', 'WO ' + id + ' progress diupdate ke ' + newProg + '%', 'bg-orange-400');
                    App.closeModal();
                    render();
                    App.toast('Progress diupdate ke ' + newProg + '%', 'success');
                }}
            ]
        );
        $('#prog-range').on('input', function () { $('#prog-val').text($(this).val() + '%'); });
    }

    function completeWO(id) {
        const wos = State.get('workOrders') || [];
        const idx = wos.findIndex(function (w) { return w.id === id; });
        if (idx === -1) return;
        wos[idx].status = 'Completed';
        wos[idx].progress = 100;
        wos[idx].completedDate = new Date().toISOString().split('T')[0];
        State.set('workOrders', wos);
        State.autoCreateQC(wos[idx]);
        State.addActivity('wo', 'WO ' + id + ' selesai. QC Inspection dibuat.', 'bg-green-400');
        render();
        App.updateBadges();
        App.toast('WO ' + id + ' selesai. QC Inspection dibuat otomatis.', 'success');
    }

    function printWO(id) {
        const wos = State.get('workOrders') || [];
        const wo = wos.find(function (w) { return w.id === id; });
        if (!wo) return;
        const prod = SEED.products.find(function (p) { return p.id === wo.productId; });
        const wc = SEED.workCenters.find(function (w) { return w.id === wo.workCenterId; });
        $('#print-area').html(
            '<h2>' + wo.id + '</h2>' +
            '<div class="print-meta">SO: ' + wo.soId + ' | Produk: ' + (prod ? prod.nama : wo.productId) + ' | Qty: ' + wo.qty + '</div>' +
            '<table><thead><tr><th>Work Center</th><th>Target Date</th><th>Start Date</th><th>Completed</th><th>Status</th><th>Progress</th></tr></thead>' +
            '<tbody><tr><td>' + (wc ? wc.nama : wo.workCenterId) + '</td><td>' + (wo.targetDate || '-') + '</td><td>' + (wo.startDate || '-') + '</td><td>' + (wo.completedDate || '-') + '</td><td>' + wo.status + '</td><td>' + wo.progress + '%</td></tr></tbody></table>' +
            '<div class="print-footer">PT Sentosa Manufaktur - Demo project by Bagas Aria Sativa - bagasaria93.github.io</div>'
        );
        window.print();
    }

    function badge(status) {
        const map = { 'Not Started': 'badge-notstarted', 'In Progress': 'badge-inprogress', 'QC': 'badge-qc', 'Completed': 'badge-completed' };
        return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + status + '</span>';
    }

    return { render: render };
})();