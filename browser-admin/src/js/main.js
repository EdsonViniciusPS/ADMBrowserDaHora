// filepath: c:\LunaeGroup\GitProjects\browser-admin\src\js\main.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('linkForm');
    const linkList = document.getElementById('linkList');

    // Load existing links from localStorage
    loadLinks();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('linkTitle').value;
        const url = document.getElementById('linkUrl').value;

        if (title && url) {
            addLink(title, url);
            form.reset();
        }
    });

    function addLink(title, url) {
        const linkItem = document.createElement('li');
        linkItem.innerHTML = `<a href="${url}" target="_blank">${title}</a>`;
        linkList.appendChild(linkItem);
        saveLink(title, url);
    }

    function saveLink(title, url) {
        let links = JSON.parse(localStorage.getItem('links')) || [];
        links.push({ title, url });
        localStorage.setItem('links', JSON.stringify(links));
    }

    function loadLinks() {
        const links = JSON.parse(localStorage.getItem('links')) || [];
        links.forEach(link => {
            addLink(link.title, link.url);
        });
    }
});