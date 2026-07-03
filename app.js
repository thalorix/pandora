const VALID_USERNAME = 'matteo';
const VALID_PASSWORD = '3a%uwbK*5hGnX3';

let ideaSelezionata = null;
let idee = [];

function caricaIdeeDaStorage() {
    const salvate = localStorage.getItem('pandora_idee');
    idee = salvate ? JSON.parse(salvate) : [];
}

function salvaIdeeInStorage() {
    localStorage.setItem('pandora_idee', JSON.stringify(idee));
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        localStorage.setItem('pandora_logged', 'true');
        showApp();
    } else {
        const el = document.getElementById('loginError');
        el.textContent = '❌ Credenziali non valide';
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 3000);
    }
});

document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('pandora_logged');
    showLogin();
});

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appContainer').style.display = 'grid';
    caricaIdeeDaStorage();
    renderLista();
}

if (localStorage.getItem('pandora_logged') === 'true') {
    showApp();
} else {
    showLogin();
}

document.getElementById('btnMenu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
});

document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
});

document.getElementById('btnSearch').addEventListener('click', () => {
    document.getElementById('ricerca').focus();
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
});

document.getElementById('btnMobileNuova').addEventListener('click', () => {
    document.getElementById('btnNuova').click();
});

document.getElementById('btnMobileCerca').addEventListener('click', () => {
    document.getElementById('ricerca').focus();
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
});

document.getElementById('btnMobileCategorie').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
});

document.getElementById('btnCloseDetails').addEventListener('click', () => {
    document.getElementById('detailsPanel').classList.remove('open');
});

function renderLista() {
    const filtro = document.querySelector('input[name="filtro"]:checked').value;
    const ricerca = document.getElementById('ricerca').value.toLowerCase();
    
    let ideeFiltrate = idee;
    
    if (filtro !== 'tutte') {
        ideeFiltrate = ideeFiltrate.filter(i => i.categoria === filtro);
    }
    
    if (ricerca) {
        ideeFiltrate = ideeFiltrate.filter(i => 
            i.titolo.toLowerCase().includes(ricerca) || 
            (i.descrizione && i.descrizione.toLowerCase().includes(ricerca))
        );
    }
    
    const lista = document.getElementById('listaIdee');
    
    if (ideeFiltrate.length === 0) {
        lista.innerHTML = '<div class="empty-list"><div class="empty-icon">🔍</div><h4>Nessuna idea trovata</h4><p>Clicca "Nuova Idea" per iniziare</p></div>';
    } else {
        lista.innerHTML = ideeFiltrate.map(idea => creaCard(idea)).join('');
    }
    
    document.getElementById('totaleIdee').textContent = idee.length;
    document.getElementById('totaleIdeeMobile').textContent = idee.length;
    
    if (ideaSelezionata) {
        const card = document.querySelector(`[data-id="${ideaSelezionata.id}"]`);
        if (card) card.classList.add('selezionata');
    }
}

function creaCard(idea) {
    const coloreCat = idea.categoria === 'business' ? '#4a9eff' : '#ff9f43';
    const coloriStato = { 
        'in_idea': '#718096', 
        'in_corso': '#4a9eff', 
        'completata': '#26de81', 
        'abbandonata': '#ff5252' 
    };
    const coloreStato = coloriStato[idea.stato] || '#718096';
    const descBreve = idea.descrizione 
        ? (idea.descrizione.length > 140 ? idea.descrizione.substring(0, 140) + '...' : idea.descrizione) 
        : '';
    
    return `<div class="idea-card" data-id="${idea.id}" style="border-color: ${coloreCat}" onclick="selezionaIdea('${idea.id}')">
        <div class="card-header">
            <span class="badge-cat" style="background: ${coloreCat}">${idea.categoria.toUpperCase()}</span>
            <span class="badge-stato" style="background: ${coloreStato}">${idea.stato.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="card-title">${escapeHtml(idea.titolo)}</div>
        ${descBreve ? `<div class="card-desc">${escapeHtml(descBreve)}</div>` : '<div style="height:10px"></div>'}
    </div>`;
}

function selezionaIdea(id) {
    document.querySelectorAll('.idea-card').forEach(c => c.classList.remove('selezionata'));
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) card.classList.add('selezionata');
    
    const idea = idee.find(i => i.id === id);
    if (!idea) return;
    
    ideaSelezionata = idea;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('bannerTitolo').textContent = idea.titolo;
    document.getElementById('editCategoria').value = idea.categoria;
    document.getElementById('editStato').value = idea.stato;
    document.getElementById('editTitolo').value = idea.titolo;
    document.getElementById('editDescrizione').value = idea.descrizione || '';
    document.getElementById('editPiano').value = idea.piano_azione || '';
    document.getElementById('editTimestamp').textContent = 
        `🕐 Creata: ${formatDate(idea.created_at)} • Modificata: ${formatDate(idea.updated_at)}`;
    
    document.getElementById('detailsPanel').classList.add('open');
}

document.getElementById('btnNuova').addEventListener('click', () => {
    const nuovaIdea = {
        id: Date.now().toString(),
        categoria: 'personale',
        titolo: 'Nuova idea',
        descrizione: '',
        piano_azione: '',
        stato: 'in_idea',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    idee.unshift(nuovaIdea);
    salvaIdeeInStorage();
    ideaSelezionata = nuovaIdea;
    renderLista();
    selezionaIdea(nuovaIdea.id);
    
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
});

document.getElementById('btnSalva').addEventListener('click', () => {
    if (!ideaSelezionata) return;
    
    const titolo = document.getElementById('editTitolo').value.trim();
    if (!titolo) {
        alert('⚠️ Il titolo non può essere vuoto!');
        return;
    }
    
    const index = idee.findIndex(i => i.id === ideaSelezionata.id);
    if (index === -1) return;
    
    idee[index] = {
        ...idee[index],
        categoria: document.getElementById('editCategoria').value,
        titolo: titolo,
        descrizione: document.getElementById('editDescrizione').value,
        piano_azione: document.getElementById('editPiano').value,
        stato: document.getElementById('editStato').value,
        updated_at: new Date().toISOString()
    };
    
    salvaIdeeInStorage();
    alert('✅ Idea salvata con successo!');
    renderLista();
    selezionaIdea(ideaSelezionata.id);
});

document.getElementById('btnElimina').addEventListener('click', () => {
    if (!ideaSelezionata) return;
    if (!confirm('⚠️ Sei sicuro di voler eliminare questa idea?\n\nQuesta azione non può essere annullata.')) return;
    
    idee = idee.filter(i => i.id !== ideaSelezionata.id);
    salvaIdeeInStorage();
    ideaSelezionata = null;
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('detailsPanel').classList.remove('open');
    renderLista();
});

document.querySelectorAll('input[name="filtro"]').forEach(r => 
    r.addEventListener('change', renderLista));
document.getElementById('ricerca').addEventListener('input', renderLista);

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('it-IT');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
}
