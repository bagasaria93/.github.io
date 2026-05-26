'use strict';

window.RecruitmentModule = (function () {
  let selectedJobId = null;

  const STAGES = ['Applied','Screening','Interview','Offer','Hired','Rejected'];

  function render() {
    const jobs = DB.recruitment.getAll();
    const open = jobs.filter(j => j.status === 'Buka');
    const totalCandidates = jobs.reduce((s,j) => s + j.candidates.length, 0);
    const hired = jobs.reduce((s,j) => s + j.candidates.filter(c=>c.stage==='Hired').length, 0);

    const canCreate = Auth.can('create_recruitment');

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Rekrutmen</div>
        <div class="page-subtitle">Kelola lowongan dan pipeline kandidat</div>
      </div>
      ${canCreate ? `<button class="btn btn-primary" onclick="RecruitmentModule.openAddJob()">
        <i data-lucide="plus"></i> Tambah Lowongan
      </button>` : ''}
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
      <div class="stat-card"><div class="stat-icon green"><i data-lucide="briefcase"></i></div>
        <div><div class="stat-value">${open.length}</div><div class="stat-label">Posisi Terbuka</div></div></div>
      <div class="stat-card"><div class="stat-icon blue"><i data-lucide="users"></i></div>
        <div><div class="stat-value">${totalCandidates}</div><div class="stat-label">Total Kandidat</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i data-lucide="user-check"></i></div>
        <div><div class="stat-value">${hired}</div><div class="stat-label">Kandidat Hired</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><i data-lucide="star"></i></div>
        <div><div class="stat-value">${jobs.reduce((s,j)=>s+j.candidates.filter(c=>c.stage==='Offer').length,0)}</div>
        <div class="stat-label">Tahap Penawaran</div></div></div>
    </div>

    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;min-height:500px;">
      <!-- Job List -->
      <div>
        <div class="card" style="overflow:visible;">
          <div class="card-header"><div class="card-title">Lowongan</div></div>
          <div id="job-list">
            ${jobs.map(j => `
              <div class="job-item ${selectedJobId===j.id?'active':''}" onclick="RecruitmentModule.selectJob('${j.id}')">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                  <div>
                    <div style="font-weight:700;font-size:13.5px;">${escapeHtml(j.position)}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(getDeptName(j.department))}</div>
                  </div>
                  ${badge(j.status)}
                </div>
                <div style="margin-top:8px;display:flex;gap:6px;align-items:center;">
                  <span style="font-size:11.5px;color:var(--text-muted);"><i data-lucide="users" style="width:12px;height:12px;"></i> ${j.candidates.length} kandidat</span>
                  <span style="font-size:11px;color:var(--text-muted);">&bull;</span>
                  <span style="font-size:11.5px;color:var(--text-muted);">Deadline: ${formatDate(j.deadline,'short')}</span>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Job Detail & Pipeline -->
      <div id="job-detail-panel">
        ${selectedJobId ? renderJobDetail(selectedJobId) : renderJobPlaceholder()}
      </div>
    </div>

    ${renderJobModal()}
    ${renderCandidateModal()}`;
  }

  function renderJobPlaceholder() {
    return `<div class="card" style="display:flex;align-items:center;justify-content:center;min-height:400px;">
      <div class="empty-state">
        <i data-lucide="briefcase"></i>
        <h3>Pilih Lowongan</h3>
        <p>Klik salah satu lowongan di sebelah kiri untuk melihat detail dan pipeline kandidat</p>
      </div>
    </div>`;
  }

  function renderJobDetail(jobId) {
    const job = DB.recruitment.getById(jobId);
    if (!job) return renderJobPlaceholder();
    const canEdit = Auth.can('edit_recruitment');
    const canDel = Auth.can('delete_recruitment');

    const stagesData = STAGES.map(stage => ({
      stage, candidates: job.candidates.filter(c => c.stage === stage)
    }));

    return `
    <div class="card">
      <div class="card-header">
        <div>
          <div style="font-size:17px;font-weight:800;">${escapeHtml(job.position)}</div>
          <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px;">
            ${escapeHtml(getDeptName(job.department))} &bull; ${escapeHtml(job.type)} &bull; Kuota: ${job.quota}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${badge(job.status)}
          ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="RecruitmentModule.openEditJob('${job.id}')" title="Edit"><i data-lucide="pencil"></i></button>` : ''}
          ${canDel ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="RecruitmentModule.deleteJob('${job.id}')" title="Hapus" style="color:var(--danger);"><i data-lucide="trash-2"></i></button>` : ''}
        </div>
      </div>
      <div class="card-body" style="padding-bottom:8px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="font-size:12.5px;"><span style="color:var(--text-muted);">Diposting:</span> ${formatDate(job.postedDate,'short')}</div>
          <div style="font-size:12.5px;"><span style="color:var(--text-muted);">Deadline:</span> ${formatDate(job.deadline,'short')}</div>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:12.5px;margin-bottom:6px;">Persyaratan:</div>
          <ul style="padding-left:16px;font-size:12.5px;color:var(--text-secondary);line-height:1.8;">
            ${job.requirements.map(r=>`<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="padding:0 20px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="font-weight:700;font-size:14px;">Pipeline Kandidat (${job.candidates.length})</div>
          <button class="btn btn-primary btn-sm" onclick="RecruitmentModule.openAddCandidate('${job.id}')">
            <i data-lucide="user-plus"></i> Tambah Kandidat
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;overflow-x:auto;">
          ${stagesData.map(({stage, candidates}) => `
          <div style="background:var(--body-bg);border-radius:var(--radius);padding:10px;min-width:120px;">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);margin-bottom:6px;display:flex;justify-content:space-between;">
              <span>${stage}</span>
              <span style="background:var(--primary);color:#fff;border-radius:99px;padding:1px 6px;font-size:10px;">${candidates.length}</span>
            </div>
            ${candidates.map(c => `
            <div style="background:#fff;border:1px solid var(--border);border-radius:6px;padding:8px;margin-bottom:6px;cursor:pointer;font-size:12px;"
                 onclick="RecruitmentModule.openCandidateDetail('${job.id}','${c.id}')">
              <div style="font-weight:600;margin-bottom:2px;">${escapeHtml(c.name)}</div>
              <div style="color:var(--text-muted);font-size:11px;">${formatDate(c.appliedDate,'short')}</div>
              ${c.rating > 0 ? `<div style="margin-top:3px;color:#F59E0B;font-size:11px;">${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</div>` : ''}
            </div>`).join('')}
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderJobModal() {
    const depts = DB.departments.getAll();
    return `
    <div class="modal" id="modal-job">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title" id="job-modal-title">Tambah Lowongan</div>
          <button class="modal-close" onclick="closeModal('modal-job')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-job">
            <input type="hidden" name="id" id="job-id">
            <div class="form-group">
              <label class="form-label required">Posisi yang Dibuka</label>
              <input type="text" name="position" class="form-control" placeholder="Nama jabatan yang dicari">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Departemen</label>
                <select name="department" class="form-control">
                  ${depts.map(d=>`<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tipe Pekerjaan</label>
                <select name="type" class="form-control">
                  <option>Tetap</option><option>Kontrak</option><option>Magang</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kuota</label>
                <input type="number" name="quota" class="form-control" value="1" min="1">
              </div>
              <div class="form-group">
                <label class="form-label">Deadline</label>
                <input type="date" name="deadline" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi Pekerjaan</label>
              <textarea name="description" class="form-control" rows="3" placeholder="Deskripsi singkat posisi..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Persyaratan (satu per baris)</label>
              <textarea name="requirementsRaw" class="form-control" rows="4" placeholder="Minimal S1 Informatika&#10;Pengalaman 2 tahun&#10;..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select name="status" class="form-control">
                <option>Buka</option><option>Tutup</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-job')">Batal</button>
          <button class="btn btn-primary" onclick="RecruitmentModule.saveJob()">
            <i data-lucide="save"></i> Simpan
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderCandidateModal() {
    return `
    <div class="modal" id="modal-candidate">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title" id="candidate-modal-title">Tambah Kandidat</div>
          <button class="modal-close" onclick="closeModal('modal-candidate')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="candidate-modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-candidate')">Batal</button>
          <button class="btn btn-primary" id="candidate-save-btn" onclick="RecruitmentModule.saveCandidate()">
            <i data-lucide="save"></i> Simpan
          </button>
        </div>
      </div>
    </div>`;
  }

  function init() {
    // Re-attach job list styles
    document.querySelectorAll('.job-item').forEach(el => {
      el.style.cursor = 'pointer';
    });
    if (window.lucide) lucide.createIcons();
  }

  function selectJob(jobId) {
    selectedJobId = jobId;
    const panel = document.getElementById('job-detail-panel');
    if (panel) { panel.innerHTML = renderJobDetail(jobId); if (window.lucide) lucide.createIcons({ nodes: [panel] }); }
    document.querySelectorAll('.job-item').forEach(el => el.classList.remove('active'));
    const jobItems = document.querySelectorAll('.job-item');
    const jobs = DB.recruitment.getAll();
    const idx = jobs.findIndex(j => j.id === jobId);
    if (jobItems[idx]) jobItems[idx].classList.add('active');
  }

  function openAddJob() {
    document.getElementById('job-modal-title').textContent = 'Tambah Lowongan';
    document.getElementById('form-job').reset();
    document.getElementById('job-id').value = '';
    openModal('modal-job');
    if (window.lucide) lucide.createIcons();
  }

  function openEditJob(id) {
    const job = DB.recruitment.getById(id);
    if (!job) return;
    document.getElementById('job-modal-title').textContent = 'Edit Lowongan';
    setFormData('form-job', { ...job, requirementsRaw: job.requirements.join('\n') });
    openModal('modal-job');
    if (window.lucide) lucide.createIcons();
  }

  function saveJob() {
    const data = getFormData('form-job');
    if (!data.position) { showToast('Nama posisi wajib diisi', 'error'); return; }
    const requirements = (data.requirementsRaw || '').split('\n').map(r=>r.trim()).filter(Boolean);
    delete data.requirementsRaw;
    data.requirements = requirements;
    data.quota = parseInt(data.quota) || 1;

    if (data.id) {
      DB.recruitment.update(data.id, data);
      showToast('Lowongan berhasil diperbarui', 'success');
    } else {
      const id = DB.recruitment.nextId();
      DB.recruitment.create({ ...data, id, postedDate: todayStr(), candidates: [] });
      showToast('Lowongan baru berhasil ditambahkan', 'success');
    }
    closeModal('modal-job');
    App.navigate('recruitment');
  }

  function deleteJob(id) {
    confirmDialog('Hapus lowongan ini beserta semua data kandidat?', () => {
      DB.recruitment.delete(id);
      selectedJobId = null;
      showToast('Lowongan berhasil dihapus', 'success');
      App.navigate('recruitment');
    });
  }

  let currentJobId = null;
  let currentCandidateId = null;

  function openAddCandidate(jobId) {
    currentJobId = jobId;
    currentCandidateId = null;
    document.getElementById('candidate-modal-title').textContent = 'Tambah Kandidat';
    document.getElementById('candidate-modal-body').innerHTML = candidateFormHtml();
    document.getElementById('candidate-save-btn').style.display = '';
    openModal('modal-candidate');
    if (window.lucide) lucide.createIcons();
  }

  function openCandidateDetail(jobId, candidateId) {
    currentJobId = jobId;
    currentCandidateId = candidateId;
    const job = DB.recruitment.getById(jobId);
    const c = job?.candidates.find(x => x.id === candidateId);
    if (!c) return;
    document.getElementById('candidate-modal-title').textContent = 'Detail Kandidat';
    document.getElementById('candidate-modal-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        ${avatarHtml(c.name,48)}
        <div>
          <div style="font-size:17px;font-weight:700;">${escapeHtml(c.name)}</div>
          <div style="font-size:12.5px;color:var(--text-muted);">${escapeHtml(c.email)} &bull; ${escapeHtml(c.phone)}</div>
          <div style="margin-top:4px;">${badge(c.stage)}</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tahap Pipeline</label>
        <select class="form-control" id="cand-stage">${STAGES.map(s=>`<option value="${s}" ${s===c.stage?'selected':''}>${s}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Rating (1-5)</label>
        <select class="form-control" id="cand-rating">
          ${[0,1,2,3,4,5].map(r=>`<option value="${r}" ${r===c.rating?'selected':''}>${r===0?'Belum dinilai':r+' Bintang'}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Catatan</label>
        <textarea class="form-control" id="cand-notes" rows="4">${escapeHtml(c.notes)}</textarea>
      </div>
      <div style="font-size:12px;color:var(--text-muted);">Melamar: ${formatDate(c.appliedDate,'short')}</div>`;
    document.getElementById('candidate-save-btn').style.display = '';
    openModal('modal-candidate');
    if (window.lucide) lucide.createIcons();
  }

  function candidateFormHtml() {
    return `
    <form id="form-candidate">
      <div class="form-group">
        <label class="form-label required">Nama Lengkap</label>
        <input type="text" id="cand-name" class="form-control" placeholder="Nama kandidat">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="cand-email" class="form-control" placeholder="email@domain.com">
        </div>
        <div class="form-group">
          <label class="form-label">No. Telepon</label>
          <input type="text" id="cand-phone" class="form-control" placeholder="081xxxxxxxxx">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tahap Awal</label>
        <select class="form-control" id="cand-stage">
          ${STAGES.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Catatan</label>
        <textarea class="form-control" id="cand-notes" rows="3" placeholder="Catatan awal tentang kandidat..."></textarea>
      </div>
    </form>`;
  }

  function saveCandidate() {
    const job = DB.recruitment.getById(currentJobId);
    if (!job) return;

    if (currentCandidateId) {
      // Update existing
      const stage = document.getElementById('cand-stage')?.value;
      const rating = parseInt(document.getElementById('cand-rating')?.value || '0');
      const notes = document.getElementById('cand-notes')?.value;
      const candidates = job.candidates.map(c => c.id === currentCandidateId ? { ...c, stage, rating, notes } : c);
      DB.recruitment.update(currentJobId, { candidates });
      showToast('Data kandidat berhasil diperbarui', 'success');
    } else {
      // Add new
      const name = document.getElementById('cand-name')?.value.trim();
      if (!name) { showToast('Nama kandidat wajib diisi', 'error'); return; }
      const newCandidate = {
        id: generateId('CND'),
        name, email: document.getElementById('cand-email')?.value || '',
        phone: document.getElementById('cand-phone')?.value || '',
        stage: document.getElementById('cand-stage')?.value || 'Applied',
        appliedDate: todayStr(), notes: document.getElementById('cand-notes')?.value || '', rating: 0,
      };
      DB.recruitment.update(currentJobId, { candidates: [...job.candidates, newCandidate] });
      showToast('Kandidat berhasil ditambahkan', 'success');
    }
    closeModal('modal-candidate');
    selectJob(currentJobId);
  }

  return { render, init, selectJob, openAddJob, openEditJob, saveJob, deleteJob, openAddCandidate, openCandidateDetail, saveCandidate };
})();

// Job item styles
const jobStyle = document.createElement('style');
jobStyle.textContent = `.job-item{padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background var(--transition);} .job-item:hover{background:var(--primary-xlight);} .job-item.active{background:var(--primary-xlight);border-left:3px solid var(--primary);}`;
document.head.appendChild(jobStyle);
