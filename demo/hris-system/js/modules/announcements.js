window.AnnouncementsModule = (function () {
  let _page = 1;
  const PER_PAGE = 8;
  let _filters = { category: '', status: '', search: '' };

  const CATEGORIES = ['SDM', 'Keuangan', 'Operasional', 'Informasi', 'Kebijakan', 'Acara'];

  // ── render ──────────────────────────────────────────────────
  function render() {
    const isHR = Auth.can('create_announcement');
    if (isHR) {
      return `
<div class="page-header">
  <div>
    <h1 class="page-title">Pengumuman</h1>
    <p class="page-subtitle">Kelola pengumuman dan informasi untuk seluruh karyawan</p>
  </div>
  <button class="btn btn-primary" onclick="AnnouncementsModule.openAdd()">
    <i data-lucide="plus" style="width:16px;height:16px"></i> Buat Pengumuman
  </button>
</div>

<div class="card" style="margin-bottom:16px;padding:16px 20px">
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
    <div class="form-group" style="margin:0;flex:1;min-width:200px">
      <label class="form-label">Cari Pengumuman</label>
      <input type="text" class="form-control" placeholder="Judul pengumuman..." oninput="AnnouncementsModule.setFilter('search',this.value)">
    </div>
    <div class="form-group" style="margin:0;min-width:140px">
      <label class="form-label">Kategori</label>
      <select class="form-control" onchange="AnnouncementsModule.setFilter('category',this.value)">
        <option value="">Semua</option>
        ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group" style="margin:0;min-width:130px">
      <label class="form-label">Status</label>
      <select class="form-control" onchange="AnnouncementsModule.setFilter('status',this.value)">
        <option value="">Semua</option>
        <option value="Publish">Publish</option>
        <option value="Draft">Draft</option>
      </select>
    </div>
    <button class="btn btn-outline btn-sm" onclick="AnnouncementsModule.resetFilter()">Reset</button>
  </div>
</div>

<div id="ann-list"></div>
<div id="ann-pagination" style="margin-top:16px"></div>
${_modalHtml(isHR)}`;
    } else {
      return `
<div class="page-header">
  <div>
    <h1 class="page-title">Pengumuman</h1>
    <p class="page-subtitle">Informasi dan pengumuman terkini dari perusahaan</p>
  </div>
</div>
<div class="card" style="margin-bottom:16px;padding:12px 16px">
  <input type="text" class="form-control" placeholder="Cari pengumuman..." oninput="AnnouncementsModule.setFilter('search',this.value)" style="max-width:400px">
</div>
<div id="ann-list"></div>
<div id="ann-pagination" style="margin-top:16px"></div>
${_modalHtml(isHR)}`;
    }
  }

  // ── init ─────────────────────────────────────────────────────
  function init() {
    lucide.createIcons();
    _renderList();
  }

  // ── list ──────────────────────────────────────────────────────
  function _renderList() {
    const isHR = Auth.can('create_announcement');
    let items = isHR ? DB.announcements.getAll() : DB.announcements.getPublished();

    if (_filters.search) {
      const q = _filters.search.toLowerCase();
      items = items.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }
    if (_filters.category) items = items.filter(a => a.category === _filters.category);
    if (_filters.status) items = items.filter(a => a.status === _filters.status);

    // Pinned first, then by date desc
    items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
      return new Date(b.publishDate) - new Date(a.publishDate);
    });

    const pag = paginate(items, _page, PER_PAGE);
    const el = document.getElementById('ann-list');
    if (!el) return;

    if (!pag.items.length) {
      el.innerHTML = `<div class="empty-state"><i data-lucide="bell-off" style="width:48px;height:48px;color:var(--text-muted)"></i><p>Belum ada pengumuman.</p></div>`;
      document.getElementById('ann-pagination').innerHTML = '';
      lucide.createIcons();
      return;
    }

    el.innerHTML = pag.items.map(a => _annCard(a, isHR)).join('');
    document.getElementById('ann-pagination').innerHTML = paginationHtml(pag, 'AnnouncementsModule.goPage');
    lucide.createIcons();
  }

  function _annCard(a, isHR) {
    const catColors = {
      SDM: 'badge-info', Keuangan: 'badge-success', Operasional: 'badge-warning',
      Informasi: 'badge-purple', Kebijakan: 'badge-secondary', Acara: 'badge-warning',
    };
    const poster = DB.employees.getById(a.postedBy);
    const preview = a.content.replace(/\n+/g, ' ').slice(0, 140) + (a.content.length > 140 ? '…' : '');
    return `
<div class="card" style="margin-bottom:12px;cursor:pointer;transition:box-shadow .2s;padding:16px 20px;${a.isPinned ? 'border-left:3px solid var(--primary)' : ''}"
     onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'" onmouseleave="this.style.boxShadow=''"
     onclick="AnnouncementsModule.openDetail('${a.id}')">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
    <div style="display:flex;align-items:flex-start;gap:10px">
      ${a.isPinned ? `<i data-lucide="pin" style="width:16px;height:16px;color:var(--primary);flex-shrink:0;margin-top:3px"></i>` : ''}
      <div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
          <h3 style="font-size:15px;font-weight:600;color:var(--text-primary);margin:0">${escapeHtml(a.title)}</h3>
          ${isHR && a.status === 'Draft' ? `<span class="badge badge-secondary">Draft</span>` : ''}
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:6px">${preview}</p>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="badge ${catColors[a.category] || 'badge-secondary'}" style="font-size:10px">${a.category}</span>
          <span style="font-size:11px;color:var(--text-muted)">${formatDate(a.publishDate, 'long')}</span>
          ${poster ? `<span style="font-size:11px;color:var(--text-muted)">oleh ${escapeHtml(poster.name)}</span>` : ''}
          <span style="font-size:11px;color:var(--text-muted)"><i data-lucide="eye" style="width:11px;height:11px;margin-right:3px;vertical-align:middle"></i>${a.views}</span>
        </div>
      </div>
    </div>
    ${isHR ? `
    <div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">
      ${a.isPinned ? `<button class="btn btn-outline btn-sm" onclick="AnnouncementsModule.togglePin('${a.id}',false)" title="Unpin"><i data-lucide="pin-off" style="width:14px;height:14px"></i></button>` : `<button class="btn btn-outline btn-sm" onclick="AnnouncementsModule.togglePin('${a.id}',true)" title="Pin"><i data-lucide="pin" style="width:14px;height:14px"></i></button>`}
      ${a.status === 'Draft' ? `<button class="btn btn-primary btn-sm" onclick="AnnouncementsModule.publish('${a.id}')">Publish</button>` : `<button class="btn btn-outline btn-sm" onclick="AnnouncementsModule.unpublish('${a.id}')">Unpublish</button>`}
      <button class="btn btn-outline btn-sm" onclick="AnnouncementsModule.openEdit('${a.id}')"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
      <button class="btn btn-danger btn-sm" onclick="AnnouncementsModule.deleteAnn('${a.id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
    </div>` : ''}
  </div>
</div>`;
  }

  // ── detail modal ──────────────────────────────────────────────
  function openDetail(id) {
    const a = DB.announcements.getById(id);
    if (!a) return;
    // Increment views
    DB.announcements.update(id, { views: (a.views || 0) + 1 });

    const poster = DB.employees.getById(a.postedBy);
    const catColors = {
      SDM: 'badge-info', Keuangan: 'badge-success', Operasional: 'badge-warning',
      Informasi: 'badge-purple', Kebijakan: 'badge-secondary', Acara: 'badge-warning',
    };

    document.getElementById('ann-detail-title').textContent = a.title;
    document.getElementById('ann-detail-body').innerHTML = `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
  <span class="badge ${catColors[a.category] || 'badge-secondary'}">${a.category}</span>
  <span style="font-size:12px;color:var(--text-muted)">${formatDate(a.publishDate, 'long')}</span>
  ${poster ? `<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)">${avatarHtml(poster.name, 22)} ${escapeHtml(poster.name)}</span>` : ''}
  ${a.isPinned ? `<span class="badge badge-info"><i data-lucide="pin" style="width:11px;height:11px;margin-right:3px"></i>Disematkan</span>` : ''}
  ${a.status === 'Draft' ? `<span class="badge badge-secondary">Draft</span>` : ''}
</div>
<div style="font-size:14px;line-height:1.75;color:var(--text-primary);white-space:pre-wrap">${escapeHtml(a.content)}</div>`;

    openModal('modal-ann-detail');
    lucide.createIcons();
    _renderList();
  }

  // ── form modal ────────────────────────────────────────────────
  function openAdd() {
    document.getElementById('ann-form-title').textContent = 'Buat Pengumuman';
    document.getElementById('ann-form-id').value = '';
    document.getElementById('ann-form').reset();
    document.getElementById('ann-form-publish-date').value = todayStr();
    openModal('modal-ann-form');
  }

  function openEdit(id) {
    const a = DB.announcements.getById(id);
    if (!a) return;
    document.getElementById('ann-form-title').textContent = 'Edit Pengumuman';
    document.getElementById('ann-form-id').value = id;
    setFormData('ann-form', {
      title: a.title, category: a.category, audience: a.audience,
      publishDate: a.publishDate, content: a.content,
    });
    document.getElementById('ann-form-status').value = a.status;
    openModal('modal-ann-form');
  }

  function saveAnn() {
    if (!validateRequired('ann-form', ['title', 'category', 'content'])) return;
    const data = getFormData('ann-form');
    const id = document.getElementById('ann-form-id').value;
    const status = document.getElementById('ann-form-status').value || 'Draft';
    const user = Auth.getUser();

    const payload = {
      title: data.title, category: data.category, audience: data.audience || 'Semua',
      publishDate: data.publishDate || todayStr(), content: data.content,
      status,
    };

    if (id) {
      DB.announcements.update(id, payload);
      showToast('Pengumuman diperbarui', 'success');
    } else {
      DB.announcements.create({
        id: DB.announcements.nextId(), postedBy: user.id, views: 0, isPinned: false, ...payload,
      });
      showToast('Pengumuman dibuat', 'success');
    }
    closeModal('modal-ann-form');
    _renderList();
  }

  function deleteAnn(id) {
    confirmDialog('Hapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.', () => {
      DB.announcements.delete(id);
      showToast('Pengumuman dihapus', 'success');
      _renderList();
    });
  }

  function togglePin(id, val) {
    DB.announcements.update(id, { isPinned: val });
    showToast(val ? 'Pengumuman disematkan' : 'Sematan dihapus', 'success');
    _renderList();
  }

  function publish(id) {
    DB.announcements.update(id, { status: 'Publish', publishDate: todayStr() });
    showToast('Pengumuman dipublikasikan', 'success');
    _renderList();
  }

  function unpublish(id) {
    DB.announcements.update(id, { status: 'Draft' });
    showToast('Pengumuman dikembalikan ke Draft', 'success');
    _renderList();
  }

  function setFilter(key, val) { _filters[key] = val; _page = 1; _renderList(); }
  function resetFilter() {
    _filters = { category: '', status: '', search: '' };
    _page = 1;
    _renderList();
  }
  function goPage(p) { _page = p; _renderList(); }

  // ── modals ────────────────────────────────────────────────────
  function _modalHtml(isHR) {
    return `
<!-- Detail -->
<div class="modal" id="modal-ann-detail">
  <div class="modal-box modal-lg">
    <div class="modal-header">
      <h2 class="modal-title" id="ann-detail-title"></h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-ann-detail')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body" id="ann-detail-body"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-ann-detail')">Tutup</button>
    </div>
  </div>
</div>

${isHR ? `
<!-- Form -->
<div class="modal" id="modal-ann-form">
  <div class="modal-box modal-lg">
    <div class="modal-header">
      <h2 class="modal-title" id="ann-form-title">Buat Pengumuman</h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-ann-form')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="ann-form-id">
      <form id="ann-form">
        <div class="form-group required">
          <label class="form-label">Judul Pengumuman</label>
          <input type="text" name="title" class="form-control" placeholder="Judul yang jelas dan informatif">
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Kategori</label>
            <select name="category" class="form-control">
              <option value="">Pilih kategori</option>
              ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ditujukan Untuk</label>
            <select name="audience" class="form-control">
              <option value="Semua">Semua Karyawan</option>
              <option value="Manajer">Manajer & Pimpinan</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Publish</label>
            <input type="date" name="publishDate" id="ann-form-publish-date" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="ann-form-status" class="form-control" style="max-width:200px">
            <option value="Draft">Simpan sebagai Draft</option>
            <option value="Publish">Publish Sekarang</option>
          </select>
        </div>
        <div class="form-group required">
          <label class="form-label">Isi Pengumuman</label>
          <textarea name="content" class="form-control" rows="10" placeholder="Tulis isi pengumuman secara lengkap dan jelas..."></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-ann-form')">Batal</button>
      <button class="btn btn-primary" onclick="AnnouncementsModule.saveAnn()">Simpan</button>
    </div>
  </div>
</div>` : ''}`;
  }

  return { render, init, setFilter, resetFilter, goPage, openDetail, openAdd, openEdit, saveAnn, deleteAnn, togglePin, publish, unpublish };
})();
