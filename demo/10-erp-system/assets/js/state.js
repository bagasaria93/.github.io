const State = (function () {
    const STORAGE_KEY = 'erpcore_sentosa_v1';

    let data = {};

    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                data = JSON.parse(saved);
            } else {
                data = JSON.parse(JSON.stringify(INITIAL_DATA));
                save();
            }
        } catch (e) {
            data = JSON.parse(JSON.stringify(INITIAL_DATA));
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function reset() {
        data = JSON.parse(JSON.stringify(INITIAL_DATA));
        save();
    }

    function get(key) {
        return data[key];
    }

    function set(key, value) {
        data[key] = value;
        save();
    }

    function genId(prefix) {
        const now = new Date();
        const year = now.getFullYear();
        const rand = Math.floor(Math.random() * 900) + 100;
        return `${prefix}-${year}-${rand}`;
    }

    function addActivity(tipe, pesan, warna) {
        const activities = data.activities || [];
        const now = new Date();
        const waktu = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');
        activities.unshift({ id: Date.now(), tipe, pesan, waktu, warna });
        if (activities.length > 20) activities.pop();
        data.activities = activities;
        save();
    }

    function addNotification(pesan, tipe) {
        const notifs = data.notifications || [];
        notifs.unshift({ id: Date.now(), pesan, tipe: tipe || 'info', waktu: new Date().toLocaleTimeString('id-ID') });
        if (notifs.length > 30) notifs.pop();
        data.notifications = notifs;
        save();
    }

    function autoCreateWO(so) {
        const wos = data.workOrders || [];
        so.items.forEach(function (item) {
            const woId = 'WO-' + so.id.replace('SO-', '');
            const exists = wos.find(function (w) { return w.soId === so.id && w.productId === item.productId; });
            if (!exists) {
                wos.push({
                    id: genId('WO'),
                    soId: so.id,
                    productId: item.productId,
                    qty: item.qty,
                    workCenterId: 'WC05',
                    status: 'Not Started',
                    progress: 0,
                    targetDate: so.targetKirim,
                    startDate: null,
                    completedDate: null
                });
            }
        });
        data.workOrders = wos;
        addActivity('wo', 'Work Order auto-generated dari ' + so.id, 'bg-orange-400');
        addNotification('Work Order dibuat otomatis dari ' + so.id, 'info');
        save();
    }

    function autoCreateQC(wo) {
        const inspections = data.qcInspections || [];
        const exists = inspections.find(function (q) { return q.woId === wo.id; });
        if (!exists) {
            inspections.push({
                id: genId('QC'),
                woId: wo.id,
                productId: wo.productId,
                qty: wo.qty,
                status: 'Pending',
                hasil: null,
                inspector: 'Teguh Santoso',
                tanggal: new Date().toISOString().split('T')[0],
                checklist: [],
                catatan: ''
            });
            data.qcInspections = inspections;
            addActivity('qc', 'QC Inspection auto-generated dari ' + wo.id, 'bg-purple-400');
            addNotification('QC Inspection dibuat otomatis dari ' + wo.id, 'info');
            save();
        }
    }

    function autoCreateInvoice(so) {
        const invoices = data.invoices || [];
        const exists = invoices.find(function (inv) { return inv.soId === so.id; });
        if (!exists) {
            const total = so.items.reduce(function (sum, item) {
                return sum + (item.qty * item.harga);
            }, 0);
            const tgl = new Date();
            const jatuhTempo = new Date(tgl);
            jatuhTempo.setDate(jatuhTempo.getDate() + 30);
            invoices.push({
                id: genId('INV'),
                soId: so.id,
                customerId: so.customerId,
                tanggal: tgl.toISOString().split('T')[0],
                jatuhTempo: jatuhTempo.toISOString().split('T')[0],
                status: 'Draft',
                totalTagihan: total,
                totalBayar: 0,
                payments: []
            });
            data.invoices = invoices;
            addActivity('inv', 'Invoice auto-generated dari ' + so.id, 'bg-green-400');
            addNotification('Invoice dibuat otomatis dari ' + so.id, 'success');
            save();
        }
    }

    function checkLowStock() {
        const materials = data.materials || SEED.materials;
        const prs = data.purchaseRequests || [];
        materials.forEach(function (mat) {
            if (mat.stok <= mat.stokMin) {
                const recentPR = prs.find(function (pr) {
                    return pr.materialId === mat.id && pr.status === 'Pending';
                });
                if (!recentPR) {
                    prs.push({
                        id: genId('PR'),
                        materialId: mat.id,
                        qty: mat.stokMin * 3,
                        status: 'Pending',
                        alasan: 'Stok di bawah minimum (auto-generated)',
                        tanggal: new Date().toISOString().split('T')[0],
                        approvedBy: null
                    });
                    addActivity('pr', 'PR auto-generated: ' + mat.nama + ' stok kritis', 'bg-yellow-400');
                    addNotification('Purchase Request auto-generated: ' + mat.nama, 'warning');
                }
            }
        });
        data.purchaseRequests = prs;
        save();
    }

    function getMaterials() {
        return data.materials && data.materials.length ? data.materials : JSON.parse(JSON.stringify(SEED.materials));
    }

    function updateMaterialStock(materialId, delta, tipe, ref, keterangan) {
        const materials = getMaterials();
        const idx = materials.findIndex(function (m) { return m.id === materialId; });
        if (idx === -1) return;
        const stokSebelum = materials[idx].stok;
        materials[idx].stok = Math.max(0, stokSebelum + delta);
        data.materials = materials;

        const history = data.stockHistory || [];
        history.unshift({
            id: genId('SH'),
            materialId: materialId,
            tipe: tipe,
            qty: Math.abs(delta),
            stokSebelum: stokSebelum,
            stokSesudah: materials[idx].stok,
            ref: ref,
            tanggal: new Date().toISOString().split('T')[0],
            keterangan: keterangan || ''
        });
        data.stockHistory = history;
        save();
        checkLowStock();
    }

    return {
        load: load,
        save: save,
        reset: reset,
        get: get,
        set: set,
        genId: genId,
        addActivity: addActivity,
        addNotification: addNotification,
        autoCreateWO: autoCreateWO,
        autoCreateQC: autoCreateQC,
        autoCreateInvoice: autoCreateInvoice,
        checkLowStock: checkLowStock,
        getMaterials: getMaterials,
        updateMaterialStock: updateMaterialStock,
    };
})();