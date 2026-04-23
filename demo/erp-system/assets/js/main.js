const App = (function () {
    let currentModule = 'dashboard';

    const moduleMap = {
        dashboard: { label: 'Dashboard', subtitle: 'Overview sistem manufaktur PT Sentosa Manufaktur', render: function () { ModuleDashboard.render(); } },
        sales: { label: 'Sales Order', subtitle: 'Manajemen pesanan penjualan', render: function () { ModuleSales.render(); } },
        production: { label: 'Production', subtitle: 'Work Order dan progress produksi', render: function () { ModuleProduction.render(); } },
        warehouse: { label: 'Warehouse', subtitle: 'Manajemen stok dan material', render: function () { ModuleWarehouse.render(); } },
        qc: { label: 'Quality Control', subtitle: 'Inspeksi dan kontrol kualitas produk', render: function () { ModuleQC.render(); } },
        purchase: { label: 'Purchase', subtitle: 'Purchase Request dan Purchase Order', render: function () { ModulePurchase.render(); } },
        invoice: { label: 'Invoice', subtitle: 'Tagihan dan pembayaran customer', render: function () { ModuleInvoice.render(); } },
    };

    function init() {
        State.load();
        State.checkLowStock();
        bindNav();
        bindSidebar();
        bindModal();
        bindNotif();
        bindGlobalSearch();
        bindToolbar();
        startClock();
        navigate('dashboard');
        updateBadges();
        updateNotifDot();
    }

    function bindNav() {
        $('.nav-btn[data-module]').off('click').on('click', function () {
            navigate($(this).data('module'));
        });
    }

    function bindSidebar() {
        $('#sidebar-toggle').off('click').on('click', function () {
            $('#sidebar').toggleClass('collapsed');
        });

        $('#mobile-toggle').off('click').on('click', function () {
            $('#sidebar').toggleClass('mobile-open');
            $('#sidebar-overlay').toggleClass('hidden');
        });

        $('#sidebar-overlay').off('click').on('click', function () {
            $('#sidebar').removeClass('mobile-open');
            $('#sidebar-overlay').addClass('hidden');
        });
    }

    function bindModal() {
        $('#modal-close').off('click').on('click', closeModal);
        $('#modal-overlay').off('click').on('click', function (e) {
            if ($(e.target).is('#modal-overlay')) closeModal();
        });
        $(document).off('keydown.modal').on('keydown.modal', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    function bindNotif() {
        $('#notif-btn').off('click').on('click', function (e) {
            e.stopPropagation();
            $('#search-dropdown').addClass('hidden');
            $('#notif-panel').toggleClass('hidden');
            if (!$('#notif-panel').hasClass('hidden')) renderNotifPanel();
        });

        $(document).off('click.notif').on('click.notif', function (e) {
            if (!$(e.target).closest('#notif-panel, #notif-btn').length) {
                $('#notif-panel').addClass('hidden');
            }
        });

        $('#clear-notif').off('click').on('click', function () {
            State.set('notifications', []);
            renderNotifPanel();
            updateNotifDot();
        });
    }

    function bindGlobalSearch() {
        const $input = $('#global-search');
        const $dropdown = $('#search-dropdown');
        if (!$input.length) return;

        $input.off('input focus').on('input focus', function () {
            const q = $(this).val().trim().toLowerCase();
            if (!q) { $dropdown.addClass('hidden'); return; }

            const results = [];
            const sos = State.get('salesOrders') || [];
            const wos = State.get('workOrders') || [];
            const invoices = State.get('invoices') || [];
            const materials = State.getMaterials();

            sos.forEach(function (so) {
                const c = SEED.customers.find(function (x) { return x.id === so.customerId; });
                const nama = c ? c.nama.toLowerCase() : '';
                if (so.id.toLowerCase().includes(q) || nama.includes(q)) {
                    results.push({ label: so.id, sub: (c ? c.nama : '') + ' - ' + so.status, module: 'sales', icon: 'SO' });
                }
            });

            wos.forEach(function (wo) {
                if (wo.id.toLowerCase().includes(q) || wo.soId.toLowerCase().includes(q)) {
                    results.push({ label: wo.id, sub: wo.soId + ' - ' + wo.status, module: 'production', icon: 'WO' });
                }
            });

            invoices.forEach(function (inv) {
                if (inv.id.toLowerCase().includes(q)) {
                    results.push({ label: inv.id, sub: 'Rp ' + Number(inv.totalTagihan).toLocaleString('id-ID') + ' - ' + inv.status, module: 'invoice', icon: 'INV' });
                }
            });

            materials.forEach(function (m) {
                if (m.nama.toLowerCase().includes(q) || m.kode.toLowerCase().includes(q)) {
                    results.push({ label: m.nama, sub: 'Stok: ' + m.stok + ' ' + m.satuan, module: 'warehouse', icon: 'MAT' });
                }
            });

            if (!results.length) {
                $dropdown.html('<div class="px-4 py-4 text-xs text-gray-500 text-center">Tidak ada hasil untuk "' + $input.val() + '"</div>').removeClass('hidden');
                return;
            }

            $dropdown.html(results.slice(0, 6).map(function (r) {
                return '<div class="search-result-item" data-module="' + r.module + '">' +
                    '<span class="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">' + r.icon + '</span>' +
                    '<div><div class="text-sm text-gray-300 font-medium">' + r.label + '</div>' +
                    '<div class="text-xs text-gray-500">' + r.sub + '</div></div>' +
                '</div>';
            }).join('')).removeClass('hidden');

            $dropdown.find('.search-result-item').on('click', function () {
                navigate($(this).data('module'));
                $input.val('');
                $dropdown.addClass('hidden');
            });
        });

        $(document).off('click.search').on('click.search', function (e) {
            if (!$(e.target).closest('#global-search, #search-dropdown').length) {
                $dropdown.addClass('hidden');
            }
        });
    }

    function bindToolbar() {
        $('#btn-reset-data').off('click').on('click', function () {
            openModal('Reset Data Demo',
                '<div class="reset-confirm">' +
                    '<div class="flex items-start gap-3">' +
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                        '<div><div class="text-sm font-semibold text-red-400 mb-1">Konfirmasi Reset</div>' +
                        '<div class="text-xs text-gray-400">Semua perubahan data akan dihapus dan dikembalikan ke data awal. Aksi ini tidak bisa dibatalkan.</div></div>' +
                    '</div>' +
                '</div>',
                [
                    { label: 'Batal', cls: 'btn-secondary', action: function () { closeModal(); } },
                    { label: 'Ya, Reset Sekarang', cls: 'btn-danger', action: function () {
                        State.reset();
                        closeModal();
                        navigate('dashboard');
                        updateBadges();
                        updateNotifDot();
                        toast('Data berhasil direset ke kondisi awal', 'success');
                    }}
                ]
            );
        });

        $('#btn-export-csv').off('click').on('click', function () {
            openModal('Export CSV',
                '<div class="grid grid-cols-1 gap-3">' +
                    exportOption('export-so', 'Sales Order', 'Semua data SO beserta status') +
                    exportOption('export-wo', 'Work Order', 'Data produksi dan progress') +
                    exportOption('export-inv', 'Invoice', 'Data tagihan dan pembayaran') +
                    exportOption('export-mat', 'Material / Stock', 'Data stok material gudang') +
                '</div>',
                [{ label: 'Tutup', cls: 'btn-secondary', action: function () { closeModal(); } }]
            );

            $('#export-so').on('click', function () { exportSO(); });
            $('#export-wo').on('click', function () { exportWO(); });
            $('#export-inv').on('click', function () { exportInv(); });
            $('#export-mat').on('click', function () { exportMat(); });
        });
    }

    function exportOption(id, label, sub) {
        return '<button id="' + id + '" class="btn-secondary w-full justify-between px-4 py-3 rounded-xl">' +
            '<div class="text-left"><div class="font-semibold text-white text-sm">' + label + '</div>' +
            '<div class="text-xs text-gray-500">' + sub + '</div></div>' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        '</button>';
    }

    function exportSO() {
        const sos = State.get('salesOrders') || [];
        const rows = [['Nomor SO', 'Customer', 'Tanggal', 'Target Kirim', 'Total', 'Status']];
        sos.forEach(function (so) {
            const c = SEED.customers.find(function (x) { return x.id === so.customerId; });
            const total = so.items.reduce(function (s, i) { return s + i.qty * i.harga; }, 0);
            rows.push([so.id, c ? c.nama : so.customerId, so.tanggal, so.targetKirim, total, so.status]);
        });
        downloadCSV(rows, 'sales-order.csv');
        toast('Export Sales Order berhasil', 'success');
    }

    function exportWO() {
        const wos = State.get('workOrders') || [];
        const rows = [['Nomor WO', 'SO', 'Produk', 'Qty', 'Work Center', 'Progress', 'Target Date', 'Status']];
        wos.forEach(function (wo) {
            const p = SEED.products.find(function (x) { return x.id === wo.productId; });
            const wc = SEED.workCenters.find(function (x) { return x.id === wo.workCenterId; });
            rows.push([wo.id, wo.soId, p ? p.nama : wo.productId, wo.qty, wc ? wc.nama : wo.workCenterId, wo.progress + '%', wo.targetDate || '-', wo.status]);
        });
        downloadCSV(rows, 'work-order.csv');
        toast('Export Work Order berhasil', 'success');
    }

    function exportInv() {
        const invoices = State.get('invoices') || [];
        const rows = [['Nomor Invoice', 'SO', 'Customer', 'Tanggal', 'Jatuh Tempo', 'Total Tagihan', 'Terbayar', 'Sisa', 'Status']];
        invoices.forEach(function (inv) {
            const c = SEED.customers.find(function (x) { return x.id === inv.customerId; });
            rows.push([inv.id, inv.soId, c ? c.nama : inv.customerId, inv.tanggal, inv.jatuhTempo, inv.totalTagihan, inv.totalBayar, inv.totalTagihan - inv.totalBayar, inv.status]);
        });
        downloadCSV(rows, 'invoice.csv');
        toast('Export Invoice berhasil', 'success');
    }

    function exportMat() {
        const materials = State.getMaterials();
        const rows = [['Kode', 'Nama Material', 'Satuan', 'Stok', 'Stok Min', 'Harga Beli', 'Nilai Stok', 'Lokasi', 'Status']];
        materials.forEach(function (m) {
            const status = m.stok === 0 ? 'HABIS' : m.stok <= m.stokMin ? 'KRITIS' : 'NORMAL';
            rows.push([m.kode, m.nama, m.satuan, m.stok, m.stokMin, m.hargaBeli, m.stok * m.hargaBeli, m.lokasi, status]);
        });
        downloadCSV(rows, 'material-stock.csv');
        toast('Export Material berhasil', 'success');
    }

    function downloadCSV(rows, filename) {
        const content = rows.map(function (row) {
            return row.map(function (cell) {
                const val = String(cell).replace(/"/g, '""');
                return '"' + val + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function navigate(mod) {
        if (!moduleMap[mod]) return;

        if (currentModule === 'dashboard') ModuleDashboard.destroy && ModuleDashboard.destroy();

        currentModule = mod;

        $('.nav-btn[data-module]').removeClass('active');
        $('.nav-btn[data-module="' + mod + '"]').addClass('active');

        Object.keys(moduleMap).forEach(function (key) {
            $('#module-' + key).addClass('hidden');
        });

        const $target = $('#module-' + mod);
        $target.removeClass('hidden');
        $target.addClass('module-fade');
        setTimeout(function () { $target.removeClass('module-fade'); }, 250);

        $('#page-title').text(moduleMap[mod].label);
        $('#page-subtitle').text(moduleMap[mod].subtitle);

        moduleMap[mod].render();

        $('#sidebar').removeClass('mobile-open');
        $('#sidebar-overlay').addClass('hidden');
        $('#notif-panel').addClass('hidden');
        $('#search-dropdown').addClass('hidden');
    }

    function openModal(title, body, actions) {
        $('#modal-title').text(title);
        $('#modal-body').html(body);
        $('#modal-footer').empty();
        if (actions && actions.length) {
            actions.forEach(function (action) {
                const btn = $('<button>').addClass(action.cls).text(action.label);
                btn.on('click', action.action);
                $('#modal-footer').append(btn);
            });
        }
        $('#modal-overlay').removeClass('hidden').addClass('flex');
        $('body').addClass('modal-open');
    }

    function closeModal() {
        $('#modal-overlay').addClass('hidden').removeClass('flex');
        $('body').removeClass('modal-open');
        $('#modal-body').empty();
        $('#modal-footer').empty();
    }

    function toast(msg, type) {
        const types = {
            success: { cls: 'toast-success', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' },
            warning: { cls: 'toast-warning', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>' },
            info: { cls: 'toast-info', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
            error: { cls: 'toast-error', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
        };
        const t = types[type] || types.info;
        const el = $('<div>').addClass('toast ' + t.cls).html(t.icon + '<span>' + msg + '</span>');
        $('#toast-container').append(el);
        setTimeout(function () {
            el.css({ animation: 'toastOut 0.3s ease forwards' });
            setTimeout(function () { el.remove(); }, 300);
        }, 3200);
    }

    function updateBadges() {
        const wos = State.get('workOrders') || [];
        const qcs = State.get('qcInspections') || [];
        const prs = State.get('purchaseRequests') || [];
        const invs = State.get('invoices') || [];
        const sos = State.get('salesOrders') || [];
        const materials = State.getMaterials();

        setBadge('sales', sos.filter(function (s) { return s.status === 'Draft'; }).length);
        setBadge('production', wos.filter(function (w) { return w.status === 'Not Started' || w.status === 'In Progress'; }).length);
        setBadge('warehouse', materials.filter(function (m) { return m.stok <= m.stokMin; }).length);
        setBadge('qc', qcs.filter(function (q) { return q.status === 'Pending'; }).length);
        setBadge('purchase', prs.filter(function (p) { return p.status === 'Pending'; }).length);
        setBadge('invoice', invs.filter(function (i) { return i.status === 'Sent' || i.status === 'Partial'; }).length);
    }

    function setBadge(module, count) {
        const badge = $('#badge-' + module);
        if (count > 0) { badge.text(count).show(); } else { badge.hide(); }
    }

    function updateNotifDot() {
        const notifs = State.get('notifications') || [];
        if (notifs.length > 0) { $('#notif-dot').removeClass('hidden'); } else { $('#notif-dot').addClass('hidden'); }
    }

    function renderNotifPanel() {
        const notifs = State.get('notifications') || [];
        if (!notifs.length) {
            $('#notif-list').html('<div class="px-4 py-6 text-center text-xs text-gray-500">Tidak ada notifikasi</div>');
            return;
        }
        $('#notif-list').html(notifs.map(function (n) {
            const colors = { success: 'bg-green-400', warning: 'bg-yellow-400', info: 'bg-blue-400', error: 'bg-red-400' };
            return '<div class="flex gap-3 px-4 py-3 border-b border-border hover:bg-surface transition-colors">' +
                '<span class="w-2 h-2 rounded-full flex-shrink-0 mt-1 ' + (colors[n.tipe] || 'bg-gray-400') + '"></span>' +
                '<div><div class="text-xs text-gray-300">' + n.pesan + '</div>' +
                '<div class="text-xs text-gray-600 mt-0.5">' + n.waktu + '</div></div>' +
            '</div>';
        }).join(''));
        updateNotifDot();
    }

    function startClock() {
        function tick() {
            const now = new Date();
            const pad = function (n) { return String(n).padStart(2, '0'); };
            $('#live-clock').text(pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()));
        }
        tick();
        setInterval(tick, 1000);
    }

    $(document).ready(function () { init(); });

    return {
        navigate: navigate,
        openModal: openModal,
        closeModal: closeModal,
        toast: toast,
        updateBadges: updateBadges,
        updateNotifDot: updateNotifDot,
    };
})();