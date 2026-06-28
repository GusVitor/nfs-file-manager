import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import json
from datetime import datetime

app = Flask(__name__)

# Configuração
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/root/File_SYSTEM/upload')
ARQUIVOS_FOLDER = os.getenv('ARQUIVOS_FOLDER', '/root/File_SYSTEM/Arquivos')
COMPARTILHADA_FOLDER = os.getenv('COMPARTILHADA_FOLDER', '/root/File_SYSTEM/Compartilhada')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024  # 1GB max

# Garantir que os diretórios existem
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ARQUIVOS_FOLDER, exist_ok=True)
os.makedirs(COMPARTILHADA_FOLDER, exist_ok=True)

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health():
    """Health check para Load Balancer"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload de arquivo"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nome de arquivo vazio'}), 400
        
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            return jsonify({
                'message': 'Arquivo enviado com sucesso',
                'filename': filename,
                'path': filepath,
                'timestamp': datetime.now().isoformat()
            }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files', methods=['GET'])
def list_files():
    """Listar arquivos do diretório upload"""
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(filepath):
                size = os.path.getsize(filepath)
                mtime = os.path.getmtime(filepath)
                files.append({
                    'name': filename,
                    'size': size,
                    'modified': datetime.fromtimestamp(mtime).isoformat()
                })
        
        return jsonify({'files': files, 'count': len(files)}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Deletar arquivo"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        os.remove(filepath)
        return jsonify({'message': 'Arquivo deletado com sucesso'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/info', methods=['GET'])
def system_info():
    """Informações do sistema"""
    try:
        import shutil
        
        # Informações de disco
        upload_stat = shutil.disk_usage(app.config['UPLOAD_FOLDER'])
        
        return jsonify({
            'upload_folder': app.config['UPLOAD_FOLDER'],
            'upload_free_space': upload_stat.free,
            'upload_total_space': upload_stat.total,
            'upload_used_space': upload_stat.used,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
