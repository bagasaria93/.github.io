(function () {
    'use strict';

    let activeTab = 'laravel';
    let activeSubScript = null;
    let activeOutputTab = 'result';
    let currentChart = null;
    let pipelineInterval = null;

    const el = {
        mainTabs: () => document.querySelectorAll('.main-tab-btn'),
        subTabs: () => document.getElementById('sub-tabs'),
        codeDisplay: () => document.getElementById('code-display'),
        lineNumbers: () => document.getElementById('line-numbers'),
        editorFilename: () => document.getElementById('editor-filename'),
        copyBtn: () => document.getElementById('copy-btn'),
        copyLabel: () => document.getElementById('copy-label'),
        runBtn: () => document.getElementById('run-btn'),
        outputResult: () => document.getElementById('output-result'),
        outputExplanation: () => document.getElementById('output-explanation'),
        outputTabBtns: () => document.querySelectorAll('.output-tab-btn'),
        statusDot: () => document.getElementById('status-dot'),
        toast: () => document.getElementById('toast'),
        toastMsg: () => document.getElementById('toast-msg'),
        mobileMenuBtn: () => document.getElementById('mobile-menu-btn'),
        mobileMenu: () => document.getElementById('mobile-menu'),
    };

    function init() {
        bindMainTabs();
        bindOutputTabs();
        bindCopyBtn();
        bindRunBtn();
        bindMobileMenu();
        loadTab('laravel');
    }

    function bindMainTabs() {
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll(`[data-tab="${tab}"]`).forEach(b => b.classList.add('active'));
                loadTab(tab);
                if (el.mobileMenu().classList.contains('block')) {
                    el.mobileMenu().classList.remove('block');
                    el.mobileMenu().classList.add('hidden');
                }
            });
        });
    }

    function bindOutputTabs() {
        el.outputTabBtns().forEach(btn => {
            btn.addEventListener('click', () => {
                el.outputTabBtns().forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeOutputTab = btn.dataset.output;
                el.outputResult().classList.toggle('hidden', activeOutputTab !== 'result');
                el.outputExplanation().classList.toggle('hidden', activeOutputTab !== 'explanation');
            });
        });
    }

    function bindCopyBtn() {
        el.copyBtn().addEventListener('click', () => {
            const script = getCurrentScript();
            if (!script) return;
            navigator.clipboard.writeText(script.code).then(() => {
                el.copyLabel().textContent = 'Copied!';
                setTimeout(() => { el.copyLabel().textContent = 'Copy'; }, 2000);
                showToast('Kode berhasil disalin ke clipboard.');
            });
        });
    }

    function bindRunBtn() {
        el.runBtn().addEventListener('click', () => {
            const script = getCurrentScript();
            if (!script) return;
            runScript(script);
        });
    }

    function bindMobileMenu() {
        el.mobileMenuBtn().addEventListener('click', () => {
            const menu = el.mobileMenu();
            const isHidden = menu.classList.contains('hidden');
            menu.classList.toggle('hidden', !isHidden);
            menu.classList.toggle('block', isHidden);
        });
    }

    function loadTab(tabKey) {
        activeTab = tabKey;
        resetOutput();
        renderSubTabs(tabKey);
        const firstScript = CODES[tabKey].scripts[0];
        loadScript(firstScript);
    }

    function renderSubTabs(tabKey) {
        const scripts = CODES[tabKey].scripts;
        const container = el.subTabs();
        container.innerHTML = '';
        scripts.forEach((script, idx) => {
            const btn = document.createElement('button');
            btn.className = 'sub-tab-btn' + (idx === 0 ? ' active' : '');
            btn.dataset.scriptId = script.id;
            btn.textContent = script.label;
            btn.addEventListener('click', () => {
                container.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadScript(script);
                resetOutput();
            });
            container.appendChild(btn);
        });
    }

    function loadScript(script) {
        activeSubScript = script.id;
        el.editorFilename().textContent = script.filename;
        const code = el.codeDisplay();
        code.className = 'font-mono text-sm leading-6 language-' + script.language;
        code.textContent = script.code;
        hljs.highlightElement(code);
        renderLineNumbers(script.code);
        renderExplanation(script.explanation);
    }

    function renderLineNumbers(code) {
        const lines = code.split('\n').length;
        const container = el.lineNumbers();
        container.innerHTML = '';
        for (let i = 1; i <= lines; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            container.appendChild(span);
        }
    }

    function renderExplanation(explanation) {
        el.outputExplanation().innerHTML = `
            <div class="explanation-section">
                <h3>${explanation.title}</h3>
                <p>${explanation.overview}</p>
            </div>
            <div class="explanation-section">
                <h3>Key Concepts</h3>
                <ul>
                    ${explanation.points.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function getCurrentScript() {
        const tab = CODES[activeTab];
        if (!tab) return null;
        return tab.scripts.find(s => s.id === activeSubScript) || tab.scripts[0];
    }

    function runScript(script) {
        if (el.runBtn().classList.contains('running')) return;
        if (pipelineInterval) clearInterval(pipelineInterval);
        if (currentChart) { currentChart.destroy(); currentChart = null; }

        el.runBtn().classList.add('running');
        el.runBtn().innerHTML = `<svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Running...`;
        setStatusDot('running');

        el.outputTabBtns().forEach(b => {
            if (b.dataset.output === 'result') b.click();
        });

        el.outputResult().innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 gap-4">
                <div class="relative w-12 h-12">
                    <div class="scan-line" style="height:2px;background:linear-gradient(90deg,transparent,#7c3aed,transparent);"></div>
                    <div class="w-12 h-12 rounded-xl border border-violet-500/40 bg-violet-600/10 flex items-center justify-center">
                        <svg class="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    </div>
                </div>
                <p class="text-sm font-mono text-gray-500">Menjalankan script...</p>
            </div>
        `;

        const delay = 900 + Math.random() * 600;

        setTimeout(() => {
            el.runBtn().classList.remove('running');
            el.runBtn().innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run`;
            setStatusDot('done');
            renderOutput(script.output);
        }, delay);
    }

    function renderOutput(output) {
        const container = el.outputResult();
        let html = '';

        if (output.type === 'json') {
            const statusColor = output.meta.status >= 400 ? 'badge-rows' : 'badge-success';
            html += `<div class="output-meta">
                <span class="output-meta-badge ${statusColor}">HTTP ${output.meta.status}</span>
                <span class="output-meta-badge badge-time">${output.meta.time}</span>
                ${output.meta.rows !== null ? `<span class="output-meta-badge badge-rows">${output.meta.rows} rows</span>` : ''}
            </div>`;
            html += `<div class="json-output animate-in">${formatJSON(output.data)}</div>`;
        }

        if (output.type === 'table') {
            html += `<div class="output-meta">
                <span class="output-meta-badge badge-success">OK</span>
                <span class="output-meta-badge badge-time">${output.meta.time}</span>
                <span class="output-meta-badge badge-rows">${output.meta.rows} rows</span>
            </div>`;
            html += `<div class="overflow-x-auto rounded-lg border border-border animate-in mb-4">
                <table class="query-table">
                    <thead><tr>${output.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${output.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>`;
            if (output.chart) {
                html += `<div class="chart-container animate-in"><canvas id="output-chart"></canvas></div>`;
            }
        }

        if (output.type === 'pipeline') {
            html += `<div class="output-meta">
                <span class="output-meta-badge badge-success">Pipeline Success</span>
                <span class="output-meta-badge badge-time">${output.total_duration}</span>
                <span class="output-meta-badge badge-rows">${output.steps.length} steps</span>
            </div>`;
            html += `<div id="pipeline-container" class="animate-in"></div>`;
        }

        container.innerHTML = html;
        container.classList.add('animate-in');

        if (output.type === 'table' && output.chart) {
            renderChart(output.chart);
        }

        if (output.type === 'pipeline') {
            animatePipeline(output.steps);
        }
    }

    function renderChart(chartData) {
        const canvas = document.getElementById('output-chart');
        if (!canvas) return;
        if (currentChart) { currentChart.destroy(); currentChart = null; }
        currentChart = new Chart(canvas, {
            type: chartData.type,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.label,
                    data: chartData.data,
                    backgroundColor: chartData.color + '33',
                    borderColor: chartData.color,
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1d24',
                        borderColor: '#2a2d36',
                        borderWidth: 1,
                        titleColor: '#a78bfa',
                        bodyColor: '#d1d5db',
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y.toLocaleString('id-ID')} Juta`,
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#2a2d36' },
                        ticks: { color: '#6b7280', font: { family: 'JetBrains Mono', size: 11 } }
                    },
                    y: {
                        grid: { color: '#2a2d36' },
                        ticks: { color: '#6b7280', font: { family: 'JetBrains Mono', size: 11 } }
                    }
                }
            }
        });
    }

    function animatePipeline(steps) {
        const container = document.getElementById('pipeline-container');
        if (!container) return;

        const jobColors = { test: '#60a5fa', build: '#f59e0b', deploy: '#10b981' };

        container.innerHTML = steps.map(step => `
            <div class="pipeline-step" id="step-${step.id}">
                <div class="pipeline-icon waiting" id="icon-${step.id}">...</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span style="color:${jobColors[step.job]};font-size:10px;font-family:'JetBrains Mono',monospace;font-weight:600;text-transform:uppercase;">${step.job}</span>
                        <span class="text-gray-400 text-sm font-mono">${step.name}</span>
                    </div>
                    <span class="text-xs text-gray-600 font-mono" id="dur-${step.id}">waiting...</span>
                </div>
            </div>
        `).join('');

        let idx = 0;
        pipelineInterval = setInterval(() => {
            if (idx >= steps.length) {
                clearInterval(pipelineInterval);
                return;
            }
            const step = steps[idx];
            const stepEl = document.getElementById(`step-${step.id}`);
            const iconEl = document.getElementById(`icon-${step.id}`);
            const durEl = document.getElementById(`dur-${step.id}`);

            if (stepEl) stepEl.classList.add('active');
            if (iconEl) {
                iconEl.className = 'pipeline-icon running';
                iconEl.textContent = '...';
            }
            if (durEl) durEl.textContent = 'running...';

            setTimeout(() => {
                if (stepEl) { stepEl.classList.remove('active'); stepEl.classList.add('success'); }
                if (iconEl) { iconEl.className = 'pipeline-icon success'; iconEl.textContent = ''; }
                if (durEl) durEl.textContent = step.duration;
            }, 500);

            idx++;
        }, 280);
    }

    function formatJSON(obj, indent = 0) {
        const pad = '  '.repeat(indent);
        const innerPad = '  '.repeat(indent + 1);

        if (obj === null) return `<span class="json-null">null</span>`;
        if (typeof obj === 'boolean') return `<span class="json-bool">${obj}</span>`;
        if (typeof obj === 'number') return `<span class="json-number">${obj}</span>`;
        if (typeof obj === 'string') return `<span class="json-string">"${escapeHtml(obj)}"</span>`;

        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            const items = obj.map(item => `${innerPad}${formatJSON(item, indent + 1)}`).join(',\n');
            return `[\n${items}\n${pad}]`;
        }

        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) return '{}';
            const items = keys.map(key =>
                `${innerPad}<span class="json-key">"${key}"</span>: ${formatJSON(obj[key], indent + 1)}`
            ).join(',\n');
            return `{\n${items}\n${pad}}`;
        }

        return String(obj);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function resetOutput() {
        if (currentChart) { currentChart.destroy(); currentChart = null; }
        if (pipelineInterval) clearInterval(pipelineInterval);
        setStatusDot('idle');
        el.outputResult().innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center">
                <div class="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <p class="text-gray-500 text-sm">Klik <span class="text-violet-400 font-mono">Run</span> untuk menjalankan script</p>
                <p class="text-gray-600 text-xs mt-1">Output akan muncul di sini</p>
            </div>
        `;
    }

    function setStatusDot(state) {
        const dot = el.statusDot();
        dot.className = 'status-dot ' + state;
    }

    function showToast(msg) {
        const toast = el.toast();
        const toastMsg = el.toastMsg();
        toastMsg.textContent = msg;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }, 2800);
    }

    document.addEventListener('DOMContentLoaded', init);
})();