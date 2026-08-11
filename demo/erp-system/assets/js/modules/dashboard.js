const ModuleDashboard = (function () {
    let chartProd = null;
    let chartRevenue = null;

    function render() {
        const sos = State.get('salesOrders') || [];
        const wos = State.get('workOrders') || [];
        const invoices = State.get('invoices') || [];
        const materials = State.getMaterials();

        const totalSO = sos.length;
        const inProd = wos.filter(function (w) { return w.status === 'In Progress'; }).length;
        const lowStock = materials.filter(function (m) { return m.stok <= m.stokMin; }).length;
        const arOutstanding = invoices.reduce(function (sum, inv) {
            return sum + (inv.totalTagihan - inv.totalBayar);
        }, 0);
        const totalRevenue = invoices.reduce(function (sum, inv) { return sum + inv.totalBayar; }, 0);
        const completedWO = wos.filter(function (w) { return w.status === 'Completed'; }).length;
        const activities = State.get('activities') || [];

        const doneWOs = wos.filter(function (w) { return w.status === 'Completed' && w.completedDate; });
        const onTimeWOs = doneWOs.filter(function (w) { return !w.targetDate || w.completedDate <= w.targetDate; });
        const onTimePct = doneWOs.length ? Math.round((onTimeWOs.length / doneWOs.length) * 100) : 100;

        $('#module-dashboard').html(
            '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' +
                kpiCard('Total Sales Order', totalSO, '+2 bulan ini', 'bg-blue-500/10', iconDoc(), '<span class="stat-trend up">+18%</span>') +
                kpiCard('In Production', inProd, 'Work Order berjalan', 'bg-orange-500/10', iconGear(), '<span class="stat-trend up">Active</span>') +
                kpiCard('Stock Alert', lowStock, 'Material stok kritis', 'bg-red-500/10', iconAlert(), lowStock > 0 ? '<span class="stat-trend down">Perlu PR</span>' : '<span class="stat-trend up">OK</span>') +
                kpiCard('AR Outstanding', 'Rp ' + fmtNum(arOutstanding), 'Belum terbayar', 'bg-green-500/10', iconMoney(), '<span class="stat-trend down">Jatuh tempo</span>') +
            '</div>' +
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">' +
                miniStat('Total Revenue', 'Rp ' + fmtNum(totalRevenue), '#34d399') +
                miniStat('WO Completed', completedWO + ' order', '#60a5fa') +
                miniStat('On-Time Delivery', onTimePct + '%', '#a78bfa') +
            '</div>' +
            '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">' +
                '<div class="lg:col-span-2 bg-card border border-border rounded-2xl p-5">' +
                    '<div class="section-header"><span class="section-title">Revenue Bulanan 2024</span><span class="text-xs text-gray-500">Rp Juta</span></div>' +
                    '<div class="chart-wrap"><canvas id="chart-revenue"></canvas></div>' +
                '</div>' +
                '<div class="bg-card border border-border rounded-2xl p-5">' +
                    '<div class="section-header"><span class="section-title">Status Produksi</span></div>' +
                    '<div class="chart-wrap"><canvas id="chart-prod"></canvas></div>' +
                '</div>' +
            '</div>' +
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
                '<div class="bg-card border border-border rounded-2xl p-5">' +
                    '<div class="section-header"><span class="section-title">Aktivitas Terbaru</span></div>' +
                    '<div id="activity-list">' + renderActivities(activities) + '</div>' +
                '</div>' +
                '<div class="bg-card border border-border rounded-2xl p-5">' +
                    '<div class="section-header">' +
                        '<span class="section-title">Low Stock Alert</span>' +
                        '<button class="btn-primary btn-sm" id="btn-go-purchase">+ Buat PR</button>' +
                    '</div>' +
                    '<div>' + renderLowStock(materials) + '</div>' +
                '</div>' +
            '</div>'
        );

        renderChartRevenue(invoices);
        renderChartProd(wos);

        $('#btn-go-purchase').on('click', function () {
            App.navigate('purchase');
        });
    }

    function miniStat(label, value, color) {
        return '<div class="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between">' +
            '<div><div class="text-xs text-gray-500 mb-1">' + label + '</div>' +
            '<div class="text-lg font-bold text-white">' + value + '</div></div>' +
            '<div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:' + color + '22;">' +
            '<div class="w-3 h-3 rounded-full" style="background:' + color + ';"></div></div>' +
        '</div>';
    }

    function kpiCard(label, value, sub, iconBg, icon, trend) {
        return '<div class="kpi-card">' +
            '<div class="flex items-start justify-between mb-3">' +
                '<div class="kpi-icon ' + iconBg + '">' + icon + '</div>' +
                trend +
            '</div>' +
            '<div class="text-xl font-bold text-white mb-1">' + value + '</div>' +
            '<div class="text-xs font-semibold text-gray-400">' + label + '</div>' +
            '<div class="text-xs text-gray-600 mt-1">' + sub + '</div>' +
        '</div>';
    }

    function renderActivities(activities) {
        if (!activities.length) return '<div class="empty-state"><p>Belum ada aktivitas</p></div>';
        return activities.slice(0, 8).map(function (a) {
            return '<div class="activity-item">' +
                '<span class="activity-dot ' + a.warna + '"></span>' +
                '<div><div class="text-sm text-gray-300">' + a.pesan + '</div>' +
                '<div class="text-xs text-gray-600 mt-0.5">' + a.waktu + '</div></div>' +
            '</div>';
        }).join('');
    }

    function renderLowStock(materials) {
        const low = materials.filter(function (m) { return m.stok <= m.stokMin; });
        if (!low.length) return '<div class="empty-state"><p>Semua stok dalam kondisi normal</p></div>';
        return low.map(function (m) {
            const pct = Math.round((m.stok / m.stokMin) * 100);
            return '<div class="stock-alert-item">' +
                '<div class="flex-1">' +
                    '<div class="text-sm text-gray-300 font-medium">' + m.nama + '</div>' +
                    '<div class="text-xs text-gray-500 mt-0.5">' + m.stok + ' ' + m.satuan + ' / min ' + m.stokMin + '</div>' +
                    '<div class="progress-bar-wrap mt-2">' +
                        '<div class="progress-bar-fill" style="width:' + Math.min(pct, 100) + '%;background:' + (pct <= 20 ? '#ef4444' : '#f97316') + ';"></div>' +
                    '</div>' +
                '</div>' +
                '<span class="badge ' + (m.stok === 0 ? 'badge-rejected' : 'badge-low') + ' ml-3">' + (m.stok === 0 ? 'HABIS' : 'KRITIS') + '</span>' +
            '</div>';
        }).join('');
    }

    function renderChartRevenue(invoices) {
        if (chartRevenue) { chartRevenue.destroy(); chartRevenue = null; }
        const ctx = document.getElementById('chart-revenue');
        if (!ctx) return;
        const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const revenues = [18200000, 24500000, 31800000, 62150000, 54600000, 21150000];
        chartRevenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenues,
                        backgroundColor: 'rgba(234,88,12,0.7)',
                        borderColor: '#ea580c',
                        borderWidth: 0,
                        borderRadius: 8,
                        borderSkipped: false,
                    },
                    {
                        label: 'Target',
                        data: [25000000, 25000000, 30000000, 50000000, 50000000, 40000000],
                        type: 'line',
                        borderColor: '#fb923c',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                plugins: {
                    legend: { display: true, labels: { color: '#6b7280', font: { size: 11 }, boxWidth: 12 } },
                    tooltip: {
                        backgroundColor: '#1e2330', borderColor: '#2a3040', borderWidth: 1,
                        titleColor: '#fb923c', bodyColor: '#d1d5db',
                        callbacks: { label: function (ctx) { return ' Rp ' + fmtNum(ctx.parsed.y); } }
                    }
                },
                scales: {
                    x: { grid: { color: '#2a3040' }, ticks: { color: '#6b7280', font: { size: 11 } } },
                    y: { grid: { color: '#2a3040' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: function (v) { return 'Rp ' + fmtNum(v); } } }
                }
            }
        });
    }

    function renderChartProd(wos) {
        if (chartProd) { chartProd.destroy(); chartProd = null; }
        const ctx = document.getElementById('chart-prod');
        if (!ctx) return;
        const labels = ['Not Started', 'In Progress', 'Completed'];
        const counts = [
            wos.filter(function (w) { return w.status === 'Not Started'; }).length,
            wos.filter(function (w) { return w.status === 'In Progress'; }).length,
            wos.filter(function (w) { return w.status === 'Completed'; }).length,
        ];
        chartProd = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: ['#374151', '#f97316', '#34d399'],
                    borderColor: '#1e2330',
                    borderWidth: 3,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12, boxWidth: 12 } },
                    tooltip: { backgroundColor: '#1e2330', borderColor: '#2a3040', borderWidth: 1, titleColor: '#fb923c', bodyColor: '#d1d5db' }
                },
                cutout: '65%',
            }
        });
    }

    function iconDoc() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'; }
    function iconGear() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>'; }
    function iconAlert() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
    function iconMoney() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'; }
    function fmtNum(n) { return Number(n).toLocaleString('id-ID'); }

    function destroy() {
        if (chartProd) { chartProd.destroy(); chartProd = null; }
        if (chartRevenue) { chartRevenue.destroy(); chartRevenue = null; }
    }

    return { render: render, destroy: destroy };
})();