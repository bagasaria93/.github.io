window.TrainingModule = (function () {
  let _page = 1;
  const PER_PAGE = 8;
  let _filters = { status: '', category: '', method: '' };

  // ── render ──────────────────────────────────────────────────
  function render() {
    const isHR = Auth.can('create_training');
    const user = Auth.getUser();

    if (isHR) {
      return `
<div class="page-header">
  <div>
    <h1 class="page-title">Pelatihan & Pengembangan</h1>
    <p class="page-subtitle">Kelola program pelatihan dan pengembangan karyawan</p>
  </div>
  <button class="btn btn-primary" onclick="TrainingModule.openAdd()">
    <i data-lucide="plus" style="width:16px;height:16px"></i> Tambah Pelatihan
  </button>
</div>

<div class="card" style="margin-bottom:16px;padding:16px 20px">
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
    <div class="form-group" style="margin:0;min-width:160px">
      <label class="form-label">Status</label>
      <select class="form-control" onchange="TrainingModule.setFilter('status',this.value)">
        <option value="">Semua Status</option>
        <option value="Berlangsung">Berlangsung</option>
        <option value="Akan Datang">Akan Datang</option>
        <option value="Selesai">Selesai</option>
      </select>
    </div>
    <div class="form-group" style="margin:0;min-width:160px">
      <label class="form-label">Kategori</label>
      <select class="form-control" onchange="TrainingModule.setFilter('category',this.value)">
        <option value="">Semua Kategori</option>
        <option value="Hard Skill">Hard Skill</option>
        <option value="Soft Skill">Soft Skill</option>
        <option value="Compliance">Compliance</option>
        <option value="Leadership">Leadership</option>
      </select>
    </div>
    <div class="form-group" style="margin:0;min-width:140px">
      <label class="form-label">Metode</label>
      <select class="form-control" onchange="TrainingModule.setFilter('method',this.value)">
        <option value="">Semua Metode</option>
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
        <option value="Hybrid">Hybrid</option>
      </select>
    </div>
    <button class="btn btn-outline btn-sm" onclick="TrainingModule.resetFilter()">Reset</button>
  </div>
</div>

<div id="training-grid"></div>
<div id="training-pagination" style="margin-top:16px"></div>

${_modalHtml()}`;
    } else {
      return `
<div class="page-header">
  <div>
    <h1 class="page-title">Pelatihan Saya</h1>
    <p class="page-subtitle">Program pelatihan yang Anda ikuti</p>
  </div>
</div>
<div id="my-training-list"></div>
${_modalHtml()}`;
    }
  }

  // ── init ─────────────────────────────────────────────────────
  function init() {
    lucide.createIcons();
    const isHR = Auth.can('create_training');
    if (isHR) {
      _renderGrid();
    } else {
      _renderMyTraining();
    }
  }

  // ── HR grid ──────────────────────────────────────────────────
  function _renderGrid() {
    let items = DB.training.getAll();
    if (_filters.status) items = items.filter(t => t.status === _filters.status);
    if (_filters.category) items = items.filter(t => t.category === _filters.category);
    if (_filters.method) items = items.filter(t => t.method === _filters.method);
    items.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const pag = paginate(items, _page, PER_PAGE);
    const grid = document.getElementById('training-grid');
    if (!grid) return;

    if (!pag.items.length) {
      grid.innerHTML = `<div class="empty-state"><i data-lucide="book-open" style="width:48px;height:48px;color:var(--text-muted)"></i><p>Belum ada program pelatihan.</p></div>`;
      document.getElementById('training-pagination').innerHTML = '';
      lucide.createIcons();
      return;
    }

    grid.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">${pag.items.map(_cardHtml).join('')}</div>`;
    document.getElementById('training-pagination').innerHTML = paginationHtml(pag, 'TrainingModule.goPage');
    lucide.createIcons();
  }

  function _cardHtml(t) {
    const participants = t.participants ? t.participants.length : 0;
    const completions = t.completions ? t.completions.length : 0;
    const fillPct = participants ? Math.round((completions / participants) * 100) : 0;
    const statusCls = { 'Selesai': 'badge-success', 'Berlangsung': 'badge-warning', 'Akan Datang': 'badge-info' }[t.status] || 'badge-secondary';
    const methodIcon = { 'Online': 'monitor', 'Offline': 'map-pin', 'Hybrid': 'layers' }[t.method] || 'book';
    const catCls = { 'Hard Skill': 'badge-info', 'Soft Skill': 'badge-purple', 'Compliance': 'badge-warning', 'Leadership': 'badge-success' }[t.category] || 'badge-secondary';

    return `
<div class="card" style="cursor:pointer;transition:box-shadow .2s;padding:16px" onmouseenter="this.style.boxShadow='0 4px 20px rgba(0,0,0,.15)'" onmouseleave="this.style.boxShadow=''" onclick="TrainingModule.openDetail('${t.id}')">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
    <span class="badge ${catCls}" style="font-size:10px">${t.category}</span>
    <span class="badge ${statusCls}">${t.status}</span>
  </div>
  <h3 style="font-size:15px;font-weight:600;margin-bottom:4px;color:var(--text-primary)">${escapeHtml(t.title)}</h3>
  <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${escapeHtml(t.organization)}</p>
  <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--text-secondary);margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:6px">
      <i data-lucide="calendar" style="width:13px;height:13px;flex-shrink:0"></i>
      ${formatDate(t.startDate)} – ${formatDate(t.endDate)}
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <i data-lucide="${methodIcon}" style="width:13px;height:13px;flex-shrink:0"></i>
      ${t.method} · ${escapeHtml(t.location)}
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <i data-lucide="users" style="width:13px;height:13px;flex-shrink:0"></i>
      ${participants} peserta · Kuota ${t.quota}
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <i data-lucide="banknote" style="width:13px;height:13px;flex-shrink:0"></i>
      ${formatCurrency(t.cost)}/peserta
    </div>
  </div>
  ${t.status === 'Selesai' || t.status === 'Berlangsung' ? `
  <div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
      <span>Penyelesaian</span><span>${completions}/${participants} (${fillPct}%)</span>
    </div>
    <div style="background:#F1F5F9;border-radius:4px;height:6px;overflow:hidden">
      <div style="background:${fillPct >= 100 ? 'var(--success)' : fillPct >= 60 ? 'var(--primary)' : 'var(--warning)'};width:${fillPct}%;height:100%;border-radius:4px;transition:width .4s"></div>
    </div>
  </div>` : ''}
  <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();TrainingModule.openEdit('${t.id}')">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();TrainingModule.deleteTraining('${t.id}')">Hapus</button>
  </div>
</div>`;
  }

  // ── Employee view ─────────────────────────────────────────────
  function _renderMyTraining() {
    const user = Auth.getUser();
    const all = DB.training.getAll();
    const myTrainings = all.filter(t => t.participants && t.participants.includes(user.id));
    const upcoming = all.filter(t => t.status === 'Akan Datang' && !(t.participants && t.participants.includes(user.id)));

    const el = document.getElementById('my-training-list');
    if (!el) return;

    let html = '';

    if (myTrainings.length) {
      html += `<h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:12px">PELATIHAN TERDAFTAR</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:28px">`;
      html += myTrainings.map(t => {
        const done = t.completions && t.completions.includes(user.id);
        const statusCls = { 'Selesai': 'badge-success', 'Berlangsung': 'badge-warning', 'Akan Datang': 'badge-info' }[t.status] || 'badge-secondary';
        return `
<div class="card" style="cursor:pointer;padding:16px" onclick="TrainingModule.openDetail('${t.id}')">
  <div style="display:flex;justify-content:space-between;margin-bottom:8px">
    <span class="badge badge-secondary" style="font-size:10px">${t.category}</span>
    <span class="badge ${statusCls}">${t.status}</span>
  </div>
  <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">${escapeHtml(t.title)}</h3>
  <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${escapeHtml(t.organization)}</p>
  <div style="font-size:12px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
    <span><i data-lucide="calendar" style="width:12px;height:12px;margin-right:4px;vertical-align:middle"></i>${formatDate(t.startDate)} – ${formatDate(t.endDate)}</span>
    <span><i data-lucide="map-pin" style="width:12px;height:12px;margin-right:4px;vertical-align:middle"></i>${t.method}</span>
  </div>
  ${done ? `<span class="badge badge-success"><i data-lucide="check-circle" style="width:11px;height:11px;margin-right:4px;vertical-align:middle"></i>Selesai</span>` :
    t.status === 'Berlangsung' ? `<span class="badge badge-warning">Sedang Berlangsung</span>` :
    t.status === 'Akan Datang' ? `<span class="badge badge-info">Menunggu Pelaksanaan</span>` :
    `<span class="badge badge-secondary">Terdaftar</span>`}
</div>`;
      }).join('');
      html += '</div>';
    } else {
      html += `<div class="empty-state"><i data-lucide="book-open" style="width:48px;height:48px;color:var(--text-muted)"></i><p>Anda belum terdaftar di pelatihan manapun.</p></div>`;
    }

    if (upcoming.length) {
      html += `<h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);margin:8px 0 12px">PELATIHAN TERSEDIA</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">`;
      html += upcoming.map(t => `
<div class="card" onclick="TrainingModule.openDetail('${t.id}')" style="cursor:pointer;opacity:.85;padding:16px">
  <span class="badge badge-secondary" style="font-size:10px;margin-bottom:8px">${t.category}</span>
  <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">${escapeHtml(t.title)}</h3>
  <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${escapeHtml(t.organization)}</p>
  <div style="font-size:12px;color:var(--text-secondary)">
    ${formatDate(t.startDate)} – ${formatDate(t.endDate)} · ${t.method}
  </div>
</div>`).join('');
      html += '</div>';
    }

    el.innerHTML = html;
    lucide.createIcons();
  }

  // ── Detail modal ──────────────────────────────────────────────
  function openDetail(id) {
    const t = DB.training.getById(id);
    if (!t) return;
    const isHR = Auth.can('create_training');
    const user = Auth.getUser();
    const employees = DB.employees.getAll();

    const participantRows = (t.participants || []).map(empId => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) return '';
      const done = (t.completions || []).includes(empId);
      return `<tr>
        <td>${avatarHtml(emp.name, 28)} <span style="margin-left:8px">${escapeHtml(emp.name)}</span></td>
        <td>${getDeptName(emp.department)}</td>
        <td><span class="badge ${done ? 'badge-success' : 'badge-warning'}">${done ? 'Selesai' : 'Berlangsung'}</span></td>
        ${isHR ? `<td><button class="btn btn-${done ? 'outline' : 'primary'} btn-sm" onclick="TrainingModule.toggleComplete('${id}','${empId}')">${done ? 'Batalkan' : 'Tandai Selesai'}</button></td>` : ''}
      </tr>`;
    }).join('');

    const availableEmps = isHR ? employees.filter(e => !(t.participants || []).includes(e.id)) : [];

    document.getElementById('modal-training-detail-body').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
  <div>
    <p class="form-label" style="margin-bottom:2px">Penyelenggara</p>
    <p style="font-weight:500">${escapeHtml(t.organization)}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Trainer / Fasilitator</p>
    <p style="font-weight:500">${escapeHtml(t.trainer)}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Tanggal</p>
    <p style="font-weight:500">${formatDate(t.startDate)} – ${formatDate(t.endDate)}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Metode</p>
    <p style="font-weight:500">${t.method}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Lokasi / Platform</p>
    <p style="font-weight:500">${escapeHtml(t.location)}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Biaya / Peserta</p>
    <p style="font-weight:500">${formatCurrency(t.cost)}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Kategori</p>
    <p style="font-weight:500">${t.category}</p>
  </div>
  <div>
    <p class="form-label" style="margin-bottom:2px">Status</p>
    <span class="badge ${{ 'Selesai': 'badge-success', 'Berlangsung': 'badge-warning', 'Akan Datang': 'badge-info' }[t.status] || 'badge-secondary'}">${t.status}</span>
  </div>
</div>
<div style="margin-bottom:20px">
  <p class="form-label" style="margin-bottom:6px">Deskripsi Program</p>
  <p style="font-size:13px;line-height:1.6;color:var(--text-secondary)">${nl2br(escapeHtml(t.description))}</p>
</div>
<div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <p class="form-label" style="margin:0">Peserta (${(t.participants || []).length}/${t.quota})</p>
    ${isHR && availableEmps.length && (t.participants || []).length < t.quota ? `
    <div style="display:flex;gap:8px;align-items:center">
      <select id="add-participant-select" class="form-control" style="font-size:12px;padding:4px 8px">
        <option value="">Pilih karyawan...</option>
        ${availableEmps.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-sm" onclick="TrainingModule.addParticipant('${id}')">Tambah</button>
    </div>` : ''}
  </div>
  ${participantRows ? `
  <table class="data-table" style="font-size:13px">
    <thead><tr><th>Karyawan</th><th>Departemen</th><th>Status</th>${isHR ? '<th>Aksi</th>' : ''}</tr></thead>
    <tbody>${participantRows}</tbody>
  </table>` : `<p style="color:var(--text-muted);font-size:13px">Belum ada peserta terdaftar.</p>`}
</div>`;

    document.getElementById('modal-training-title').textContent = t.title;
    openModal('modal-training-detail');
    lucide.createIcons();
  }

  function toggleComplete(trainingId, empId) {
    const t = DB.training.getById(trainingId);
    if (!t) return;
    let completions = [...(t.completions || [])];
    if (completions.includes(empId)) {
      completions = completions.filter(id => id !== empId);
    } else {
      completions.push(empId);
    }
    const allDone = completions.length === (t.participants || []).length && completions.length > 0;
    DB.training.update(trainingId, { completions, status: allDone ? 'Selesai' : t.status });
    showToast('Status penyelesaian diperbarui', 'success');
    openDetail(trainingId);
    _renderGrid();
  }

  function addParticipant(trainingId) {
    const sel = document.getElementById('add-participant-select');
    if (!sel || !sel.value) return;
    const t = DB.training.getById(trainingId);
    if (!t) return;
    const participants = [...(t.participants || []), sel.value];
    DB.training.update(trainingId, { participants });
    showToast('Peserta berhasil ditambahkan', 'success');
    openDetail(trainingId);
    _renderGrid();
  }

  // ── Add / Edit modal ──────────────────────────────────────────
  function openAdd() {
    document.getElementById('training-form-title').textContent = 'Tambah Pelatihan';
    document.getElementById('training-form-id').value = '';
    document.getElementById('training-form').reset();
    openModal('modal-training-form');
  }

  function openEdit(id) {
    const t = DB.training.getById(id);
    if (!t) return;
    document.getElementById('training-form-title').textContent = 'Edit Pelatihan';
    document.getElementById('training-form-id').value = id;
    setFormData('training-form', {
      title: t.title, category: t.category, method: t.method,
      trainer: t.trainer, organization: t.organization,
      startDate: t.startDate, endDate: t.endDate,
      location: t.location, quota: t.quota, cost: t.cost,
      status: t.status, description: t.description,
    });
    openModal('modal-training-form');
  }

  function saveTraining() {
    if (!validateRequired('training-form', ['title', 'category', 'method', 'trainer', 'organization', 'startDate', 'endDate', 'location', 'quota', 'cost'])) return;
    const data = getFormData('training-form');
    const id = document.getElementById('training-form-id').value;
    const payload = {
      title: data.title, category: data.category, method: data.method,
      trainer: data.trainer, organization: data.organization,
      startDate: data.startDate, endDate: data.endDate,
      location: data.location, quota: parseInt(data.quota) || 0, cost: parseFloat(data.cost) || 0,
      status: data.status || 'Akan Datang', description: data.description || '',
    };
    if (id) {
      DB.training.update(id, payload);
      showToast('Pelatihan berhasil diperbarui', 'success');
    } else {
      DB.training.create({ id: DB.training.nextId(), participants: [], completions: [], ...payload });
      showToast('Pelatihan berhasil ditambahkan', 'success');
    }
    closeModal('modal-training-form');
    _renderGrid();
  }

  function deleteTraining(id) {
    confirmDialog('Hapus program pelatihan ini?', () => {
      DB.training.delete(id);
      showToast('Pelatihan dihapus', 'success');
      _renderGrid();
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  function setFilter(key, val) { _filters[key] = val; _page = 1; _renderGrid(); }
  function resetFilter() {
    _filters = { status: '', category: '', method: '' };
    _page = 1;
    document.querySelectorAll('#training-grid + div select, .card select').forEach(s => s.value = '');
    _renderGrid();
  }
  function goPage(p) { _page = p; _renderGrid(); }

  // ── Modal HTML ────────────────────────────────────────────────
  function _modalHtml() {
    return `
<!-- Detail Modal -->
<div class="modal" id="modal-training-detail">
  <div class="modal-box modal-xl">
    <div class="modal-header">
      <h2 class="modal-title" id="modal-training-title"></h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-training-detail')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body" id="modal-training-detail-body"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-training-detail')">Tutup</button>
    </div>
  </div>
</div>

<!-- Form Modal -->
<div class="modal" id="modal-training-form">
  <div class="modal-box modal-lg">
    <div class="modal-header">
      <h2 class="modal-title" id="training-form-title">Tambah Pelatihan</h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-training-form')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="training-form-id">
      <form id="training-form">
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Judul Pelatihan</label>
            <input type="text" name="title" class="form-control" placeholder="Nama program pelatihan">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Kategori</label>
            <select name="category" class="form-control">
              <option value="">Pilih kategori</option>
              <option value="Hard Skill">Hard Skill</option>
              <option value="Soft Skill">Soft Skill</option>
              <option value="Compliance">Compliance</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>
          <div class="form-group required">
            <label class="form-label">Metode</label>
            <select name="method" class="form-control">
              <option value="">Pilih metode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div class="form-group required">
            <label class="form-label">Status</label>
            <select name="status" class="form-control">
              <option value="Akan Datang">Akan Datang</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Trainer / Fasilitator</label>
            <input type="text" name="trainer" class="form-control" placeholder="Nama trainer">
          </div>
          <div class="form-group required">
            <label class="form-label">Penyelenggara</label>
            <input type="text" name="organization" class="form-control" placeholder="Nama lembaga">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Tanggal Mulai</label>
            <input type="date" name="startDate" class="form-control">
          </div>
          <div class="form-group required">
            <label class="form-label">Tanggal Selesai</label>
            <input type="date" name="endDate" class="form-control">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Lokasi / Platform</label>
            <input type="text" name="location" class="form-control" placeholder="Ruang rapat / URL platform">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Kuota Peserta</label>
            <input type="number" name="quota" class="form-control" min="1" placeholder="Jumlah maks peserta">
          </div>
          <div class="form-group required">
            <label class="form-label">Biaya / Peserta (Rp)</label>
            <input type="number" name="cost" class="form-control" min="0" placeholder="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi Program</label>
          <textarea name="description" class="form-control" rows="4" placeholder="Tujuan, materi, dan informasi tambahan"></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-training-form')">Batal</button>
      <button class="btn btn-primary" onclick="TrainingModule.saveTraining()">Simpan</button>
    </div>
  </div>
</div>`;
  }

  return { render, init, setFilter, resetFilter, goPage, openDetail, openAdd, openEdit, saveTraining, deleteTraining, toggleComplete, addParticipant };
})();
