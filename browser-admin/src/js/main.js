// filepath: c:\LunaeGroup\GitProjects\browser-admin\src\js\main.js

const API_BASE_URL = 'http://138.118.173.101:5000/api/links';
const form = document.getElementById('linkForm');
const responseMsg = document.getElementById('responseMsg');
const dynamicInputs = document.getElementById('dynamicInputs');
const addLinkBtn = document.getElementById('addLinkBtn');

// Botão para cancelar o último link adicionado
const cancelLinkBtn = document.createElement('button');
cancelLinkBtn.textContent = 'Cancelar Último Link';
cancelLinkBtn.id = 'cancelLinkBtn';
cancelLinkBtn.type = 'button';
cancelLinkBtn.style.display = 'none'; // Inicialmente escondido
form.insertBefore(cancelLinkBtn, addLinkBtn.nextSibling);

// Função para adicionar um novo conjunto de inputs dinamicamente
function addLinkInput() {
    // Verifica se os campos atuais estão preenchidos antes de adicionar novos inputs
    const inputs = dynamicInputs.querySelectorAll('.link-input');
    for (const inputGroup of inputs) {
        const title = inputGroup.querySelector('input[type="text"]').value.trim();
        const url = inputGroup.querySelector('input[type="url"]').value.trim();
        if (!title || !url) {
            responseMsg.className = 'response-message error';
            responseMsg.textContent = 'Preencha o título e a URL antes de adicionar outro link.';
            return;
        }
    }

    const index = dynamicInputs.children.length + 1;
    const inputGroup = document.createElement('div');
    inputGroup.className = 'link-input';
    inputGroup.innerHTML = `
        <label for="title${index}">Título ${index}:</label>
        <input type="text" id="title${index}" required>
        <label for="url${index}">URL ${index}:</label>
        <input type="url" id="url${index}" required>
    `;
    dynamicInputs.appendChild(inputGroup);

    cancelLinkBtn.style.display = 'inline-block'; // Mostra o botão de cancelar
    responseMsg.className = ''; // Limpa mensagens de erro
    responseMsg.textContent = '';
}

// Função para cancelar o último conjunto de inputs adicionados
function cancelLastLinkInput() {
    const lastInputGroup = dynamicInputs.lastElementChild;
    if (lastInputGroup) {
        dynamicInputs.removeChild(lastInputGroup);
        if (dynamicInputs.children.length === 0) {
            cancelLinkBtn.style.display = 'none'; // Esconde o botão se não houver mais inputs
        }
    }
}

// Adicionar o primeiro conjunto de inputs ao carregar a página
addLinkInput();

// Evento para adicionar novos inputs ao clicar no botão
addLinkBtn.addEventListener('click', addLinkInput);

// Evento para cancelar/remover o último input ao clicar no botão
cancelLinkBtn.addEventListener('click', cancelLastLinkInput);

async function loadLinks() {
    try {
        console.log('Tentando carregar links da API...');
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const links = data.links || [];
        console.log('Links recebidos:', links);

        const linksList = document.getElementById('links');
        
        if (links.length === 0) {
            linksList.innerHTML = '<li class="empty-message">Nenhum link cadastrado</li>';
            return;
        }

        // Atualizar lista de links
        linksList.innerHTML = links.map((link, index) => `
            <li>
                <span>#${index} - ${link.title || 'Sem título'}</span>
                <a href="${link.url}" target="_blank" rel="noopener">${link.url || 'URL inválida'}</a>
                <button onclick="deleteLink(${index})" class="delete-btn">Deletar</button>
                <button onclick="editLink(${index}, '${link.title}', '${link.url}')" class="edit-btn">Editar</button>
            </li>
        `).join('');

    } catch (err) {
        console.error('Erro detalhado:', err);
        const linksList = document.getElementById('links');
        const errorMessage = err.message === 'Failed to fetch' 
            ? 'Erro de conexão com o servidor. Verifique se o servidor está online.'
            : `Erro ao carregar links: ${err.message}`;
            
        linksList.innerHTML = `<li class="error">${errorMessage}</li>`;
        responseMsg.className = 'response-message error';
        responseMsg.textContent = errorMessage;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const links = [];
    const inputs = dynamicInputs.querySelectorAll('.link-input');
    inputs.forEach((inputGroup, index) => {
        const title = inputGroup.querySelector(`#title${index + 1}`).value.trim();
        const url = inputGroup.querySelector(`#url${index + 1}`).value.trim();
        if (title && url) {
            links.push({ title, url });
        }
    });

    if (links.length === 0) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = 'Por favor, preencha pelo menos um par de título e URL';
        return;
    }

    try {
        for (const link of links) {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(link)
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar link: ${link.title}`);
            }
        }

        responseMsg.className = 'response-message success';
        responseMsg.textContent = 'Links salvos com sucesso!';
        form.reset();
        dynamicInputs.innerHTML = ''; // Limpa os inputs dinâmicos
        addLinkInput(); // Adiciona um novo conjunto de inputs
        await loadLinks();
        
    } catch (err) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = err.message || 'Erro ao salvar os links';
        console.error('Erro:', err);
    }
});

// Função para deletar um link
async function deleteLink(index) {
    try {
        const response = await fetch(`${API_BASE_URL}/${index}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Erro ao deletar link com índice ${index}`);
        }
        responseMsg.className = 'response-message success';
        responseMsg.textContent = 'Link deletado com sucesso!';
        await loadLinks();
    } catch (err) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = err.message || 'Erro ao deletar o link';
        console.error('Erro:', err);
    }
}

// Função para atualizar um link
async function updateLink(index, title, url) {
    try {
        const response = await fetch(`${API_BASE_URL}/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, url })
        });
        if (!response.ok) {
            throw new Error(`Erro ao atualizar link com índice ${index}`);
        }
        responseMsg.className = 'response-message success';
        responseMsg.textContent = 'Link atualizado com sucesso!';
        await loadLinks();
    } catch (err) {
        responseMsg.className = 'response-message error';
        responseMsg.textContent = err.message || 'Erro ao atualizar o link';
        console.error('Erro:', err);
    }
}

// Função para editar um link (preencher os campos e adicionar botão de atualizar)
function editLink(index, currentTitle, currentUrl) {
    const titleInput = document.getElementById(`title${index + 1}`);
    const urlInput = document.getElementById(`url${index + 1}`);
    titleInput.value = currentTitle;
    urlInput.value = currentUrl;

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Atualizar';
    updateButton.className = 'update-btn';
    updateButton.onclick = async () => {
        const newTitle = titleInput.value.trim();
        const newUrl = urlInput.value.trim();
        if (newTitle && newUrl) {
            await updateLink(index, newTitle, newUrl);
        } else {
            responseMsg.className = 'response-message error';
            responseMsg.textContent = 'Título e URL não podem estar vazios para atualizar.';
        }
    };

    const form = document.getElementById('linkForm');
    form.appendChild(updateButton);
}

// Nova função para obter todos os links
async function getLinks() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        const links = data.links || []; // Tratamento do JSON para acessar a propriedade "links"
        console.log('Links obtidos:', links);
        return links;
    } catch (error) {
        console.error('Falha ao obter links:', error);
        return [];
    }
}

// Uso da nova função getLinks
getLinks().then(links => {
    // Faça algo com os links
    console.log('Links carregados:', links);
});

// Carregar links ao iniciar a página
document.addEventListener('DOMContentLoaded', loadLinks);