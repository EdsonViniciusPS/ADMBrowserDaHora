// filepath: c:\LunaeGroup\GitProjects\browser-admin\src\js\main.js

const API_URL = 'http://138.118.173.101:5000/api/links';
const form = document.getElementById('linkForm');
const responseMsg = document.getElementById('responseMsg');

async function loadLinks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Exemplo do formato esperado do JSON:
        // {
        //     "links": [
        //         { "title": "Google", "url": "https://google.com" },
        //         { "title": "GitHub", "url": "https://github.com" }
        //     ]
        // }

        const links = data.links || [];
        const linksList = document.getElementById('links');
        
        if (links.length === 0) {
            linksList.innerHTML = '<li class="empty-message">Nenhum link cadastrado</li>';
            return;
        }

        // Preencher os inputs vazios com dados existentes
        links.forEach((link, index) => {
            if (index < 4) { // Limitado a 4 links
                const titleInput = document.getElementById(`title${index + 1}`);
                const urlInput = document.getElementById(`url${index + 1}`);
                
                if (!titleInput.value && !urlInput.value) {
                    titleInput.value = link.title || '';
                    urlInput.value = link.url || '';
                }
            }
        });

        // Atualizar lista de links
        linksList.innerHTML = links.map((link, index) => `
            <li>
                <span>#${index + 1} - ${link.title}</span>
                <a href="${link.url}" target="_blank" rel="noopener">${link.url}</a>
            </li>
        `).join('');

    } catch (err) {
        console.error('Erro ao carregar links:', err);
        document.getElementById('links').innerHTML = 
            '<li class="error">Erro ao carregar links do servidor</li>';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const links = [];
    // Coleta apenas os campos preenchidos
    for (let i = 1; i <= 4; i++) {
        const title = document.getElementById(`title${i}`).value.trim();
        const url = document.getElementById(`url${i}`).value.trim();
        if (title || url) {
            if (!title || !url) {
                responseMsg.className = 'response-message error';
                responseMsg.textContent = `Por favor, preencha tanto o título quanto a URL para o link ${i}`;
                return;
            }
            links.push({ title, url });
        }
    }

    if (links.length === 0) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = 'Por favor, preencha pelo menos um par de título e URL';
        return;
    }

    try {
        // Enviar todos os links em um único objeto JSON
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ links: links })
        });

        const result = await response.json();

        if (response.ok) {
            responseMsg.className = 'response-message success';
            responseMsg.textContent = 'Links salvos com sucesso!';
            form.reset();
            await loadLinks(); // Recarrega os links
        } else {
            responseMsg.className = 'response-message error';
            responseMsg.textContent = result.error || 'Erro ao salvar os links';
        }
    } catch (err) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = 'Erro de conexão com o servidor';
        console.error('Erro:', err);
    }
});

// Carregar links ao iniciar a página
document.addEventListener('DOMContentLoaded', loadLinks);