// API Base URL
const API_BASE = window.location.origin;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadStatus = document.getElementById('uploadStatus');
const filesList = document.getElementById('filesList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noFiles = document.getElementById('noFiles');
const refreshBtn = document.getElementById('refreshBtn');
const toast = document.getElementById('toast');
const filesStats = document.getElementById('filesStats');
const totalFiles = document.getElementById('totalFiles');
const totalSize = document.getElementById('totalSize');

// File type icons map
const fileTypeIcons = {
    pdf: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    txt: '📝',
    doc: '📘',
    docx: '📘',
    xls: '📊',
    xlsx: '📊',
    zip: '🗂️',
    default: '📁'
};

// Utility Functions
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return fileTypeIcons[ext] || fileTypeIcons.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Upload Handling
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

async function handleFiles(files) {
    uploadStatus.innerHTML = '';

    for (let file of files) {
        await uploadFile(file);
    }

    fileInput.value = ''; // Reset input
    setTimeout(loadFiles, 500); // Reload list after upload
}

async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        uploadProgress.style.display = 'block';
        progressText.textContent = `Enviando ${file.name}...`;
        progressFill.style.width = '0%';

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                const statusDiv = document.createElement('div');
                statusDiv.className = 'status-message success';
                statusDiv.innerHTML = `✓ ${response.message}: ${response.filename}`;
                uploadStatus.appendChild(statusDiv);
                showToast(`✓ ${file.name} enviado com sucesso!`, 'success');
                progressFill.style.width = '100%';
            } else {
                const response = JSON.parse(xhr.responseText);
                const statusDiv = document.createElement('div');
                statusDiv.className = 'status-message error';
                statusDiv.innerHTML = `✗ Erro ao enviar ${file.name}: ${response.error}`;
                uploadStatus.appendChild(statusDiv);
                showToast(`✗ Erro: ${response.error}`, 'error');
            }
        });

        xhr.addEventListener('error', () => {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'status-message error';
            statusDiv.innerHTML = `✗ Erro de rede ao enviar ${file.name}`;
            uploadStatus.appendChild(statusDiv);
            showToast('✗ Erro de conexão', 'error');
        });

        xhr.open('POST', `${API_BASE}/api/upload`);
        xhr.send(formData);

    } catch (error) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message error';
        statusDiv.innerHTML = `✗ Erro ao processar ${file.name}`;
        uploadStatus.appendChild(statusDiv);
        showToast(`✗ Erro: ${error.message}`, 'error');
    }
}

// Load Files
async function loadFiles() {
    try {
        loadingIndicator.style.display = 'flex';
        filesList.innerHTML = '';
        noFiles.style.display = 'none';
        filesStats.style.display = 'none';

        const response = await fetch(`${API_BASE}/api/files`);

        if (!response.ok) {
            throw new Error('Erro ao carregar arquivos');
        }

        const data = await response.json();
        loadingIndicator.style.display = 'none';

        if (data.files.length === 0) {
            noFiles.style.display = 'block';
            return;
        }

        // Render files
        data.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-icon">${getFileIcon(file.name)}</div>
                <div class="file-info">
                    <h3>${file.name}</h3>
                    <div class="file-meta">
                        <span>💾 ${file.size_human}</span>
                        <span>📅 ${formatDate(file.modified)}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <a href="${API_BASE}/api/download/${encodeURIComponent(file.name)}" 
                       class="btn btn-download" 
                       download>
                        ⬇️ Download
                    </a>
                    <button class="btn btn-danger" 
                            onclick="deleteFile('${file.name.replace(/'/g, "\\'")}')">
                        🗑️ Deletar
                    </button>
                </div>
            `;
            filesList.appendChild(fileItem);
        });

        // Show stats
        totalFiles.textContent = data.total_files;
        totalSize.textContent = data.total_size_human;
        filesStats.style.display = 'block';

    } catch (error) {
        loadingIndicator.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'status-message error';
        errorDiv.innerHTML = `✗ Erro ao carregar arquivos: ${error.message}`;
        filesList.appendChild(errorDiv);
        showToast('✗ Erro ao carregar arquivos', 'error');
    }
}

// Delete File
async function deleteFile(filename) {
    if (!confirm(`Tem certeza que deseja deletar "${filename}"?`)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/api/delete/${encodeURIComponent(filename)}`,
            { method: 'DELETE' }
        );

        const data = await response.json();

        if (response.ok) {
            showToast(`✓ ${filename} deletado com sucesso!`, 'success');
            loadFiles();
        } else {
            showToast(`✗ Erro: ${data.error}`, 'error');
        }

    } catch (error) {
        showToast(`✗ Erro ao deletar: ${error.message}`, 'error');
    }
}

// Refresh Button
refreshBtn.addEventListener('click', loadFiles);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
});
