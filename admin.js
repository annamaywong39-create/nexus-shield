// ======================== SUPABASE SETUP ========================
const SUPABASE_URL = 'https://bxelezmomnruiurtiptg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWxlem1vbW5ydWl1cnRpcHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzg1NjksImV4cCI6MjA5MTY1NDU2OX0.N_QqBk9GVAWqMAyj9zzpopY2pqkzpk6P1w45giZZGNo';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Admin: Supabase client initialized');
} else {
    console.error('Admin: Supabase library not loaded');
}

const ADMIN_PASSWORD = 'admin123';

if (!sessionStorage.getItem('admin_logged_in')) {
    const pwd = prompt('Enter admin password:');
    if (pwd !== ADMIN_PASSWORD) {
        alert('Unauthorized');
        window.location.href = 'index.html';
    } else {
        sessionStorage.setItem('admin_logged_in', 'true');
    }
}

let currentReports = [];

async function loadReports() {
    if (!supabaseClient) {
        document.getElementById('reportsTableBody').innerHTML = '<tr><td colspan="9">Supabase not initialized. Check console.</tr';
        return;
    }
    const statusFilter = document.getElementById('filterStatus').value;
    const walletFilter = document.getElementById('filterWallet').value.trim();
    let query = supabaseClient.from('reports').select('*').order('id', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    if (walletFilter) query = query.ilike('scammer_wallet', `%${walletFilter}%`);
    const { data, error } = await query;
    if (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reportsTableBody').innerHTML = '<tr><td colspan="9">Error loading reports. Check console.</tr';
        return;
    }
    currentReports = data || [];
    renderTable(currentReports);
}

function renderTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!reports.length) {
        tbody.innerHTML = '<tr><td colspan="9">No reports found</tr';
        return;
    }
    tbody.innerHTML = reports.map(report => {
        let formattedDate = '-';
        if (report.timestamp) {
            const date = new Date(report.timestamp);
            formattedDate = date.toLocaleString();
        }
        // Show full scammer wallet with tooltip (optional, but full text visible on hover)
        const scammerFull = report.scammer_wallet || '';
        return `
        <tr>
            <td>${report.id}</td
            <td>${report.victim_name || 'Legacy Report'}</td
            <td><span title="${scammerFull}">${scammerFull}</span></td
            <td>${report.amount_lost} ${report.currency_lost}</td
            <td>${report.chain || '-'}</td
            <td>${formattedDate}</td
            <td>
                <select class="status-select" data-id="${report.id}">
                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending (20%)</option>
                    <option value="approved" ${report.status === 'approved' ? 'selected' : ''}>Approved (30%)</option>
                    <option value="investigating" ${report.status === 'investigating' ? 'selected' : ''}>Investigating (45-50%)</option>
                    <option value="recovering1" ${report.status === 'recovering1' ? 'selected' : ''}>Recovering Phase 1 (50-60%)</option>
                    <option value="recovering2" ${report.status === 'recovering2' ? 'selected' : ''}>Recovering Phase 2 (60-90%)</option>
                    <option value="recovered" ${report.status === 'recovered' ? 'selected' : ''}>Recovered (100%)</option>
                    <option value="failed" ${report.status === 'failed' ? 'selected' : ''}>Failed (100%)</option>
                </select>
            </td
            <td><button class="update-btn" data-id="${report.id}">Update</button></td
            <td>${report.report_id || '-'}</td
        </tr>
    `}).join('');

    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            const select = document.querySelector(`.status-select[data-id="${id}"]`);
            const newStatus = select.value;
            if (!supabaseClient) return;
            const { error } = await supabaseClient.from('reports').update({ status: newStatus }).eq('id', id);
            if (error) alert('Update failed: ' + error.message);
            else loadReports();
        });
    });
}

document.getElementById('applyFiltersBtn')?.addEventListener('click', loadReports);
document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    if (!currentReports.length) return;
    const headers = ['id', 'victim_name', 'scammer_wallet', 'amount_lost', 'currency_lost', 'status', 'chain', 'timestamp', 'report_id'];
    const rows = currentReports.map(r => headers.map(h => r[h] || '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reports_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
});
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.href = 'admin.html';
});

loadReports();