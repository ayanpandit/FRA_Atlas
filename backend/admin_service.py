from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    app.logger.warning('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Admin endpoints will not work until they are provided.')

HEADERS = {
    'apikey': SERVICE_ROLE_KEY or '',
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}' if SERVICE_ROLE_KEY else '',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def patch_patta(filter_column, filter_value, payload):
    url = f"{SUPABASE_URL}/rest/v1/pattas"
    params = {filter_column: f"eq.{filter_value}"}
    resp = requests.patch(url, json=payload, params=params, headers=HEADERS)
    return resp

@app.route('/admin/patta/approve', methods=['POST'])
def approve_patta():
    body = request.get_json() or {}
    id_val = body.get('id')
    patta_id = body.get('patta_id')
    if not (id_val or patta_id):
        return jsonify({'error': 'id or patta_id required'}), 400
    filter_column = 'id' if id_val else 'patta_id'
    filter_value = id_val or patta_id
    payload = {
        'status': 'verified',
        'date_verified': requests.utils.formatdate(usegmt=True)
    }
    resp = patch_patta(filter_column, filter_value, payload)
    try:
        return jsonify(resp.json()), resp.status_code
    except Exception:
        return (resp.text or 'unknown error'), resp.status_code

@app.route('/admin/patta/reject', methods=['POST'])
def reject_patta():
    body = request.get_json() or {}
    id_val = body.get('id')
    patta_id = body.get('patta_id')
    msg = body.get('message', '')
    if not (id_val or patta_id):
        return jsonify({'error': 'id or patta_id required'}), 400
    filter_column = 'id' if id_val else 'patta_id'
    filter_value = id_val or patta_id
    payload = {
        'status': 'rejected',
        'rejected_message': msg,
        'reject_message': msg
    }
    resp = patch_patta(filter_column, filter_value, payload)
    try:
        return jsonify(resp.json()), resp.status_code
    except Exception:
        return (resp.text or 'unknown error'), resp.status_code


@app.route('/admin/pattas', methods=['GET'])
def list_pattas():
    # Return all pattas using service role key. Supports GET /admin/pattas
    url = f"{SUPABASE_URL}/rest/v1/pattas"
    # allow client to request select or limit via query params if needed
    params = dict(request.args) or {'select': '*'}
    # ensure select if none provided
    if 'select' not in params:
        params['select'] = '*'
    resp = requests.get(url, params=params, headers=HEADERS)
    try:
        return jsonify(resp.json()), resp.status_code
    except Exception:
        return (resp.text or 'unknown error'), resp.status_code


@app.route('/admin/patta/update', methods=['POST'])
def update_patta_admin():
    body = request.get_json() or {}
    id_val = body.pop('id', None)
    patta_id = body.pop('patta_id', None)
    if not (id_val or patta_id):
        return jsonify({'error': 'id or patta_id required'}), 400
    filter_column = 'id' if id_val else 'patta_id'
    filter_value = id_val or patta_id
    # payload is remaining body
    payload = body
    if not payload:
        return jsonify({'error': 'no update payload provided'}), 400
    resp = patch_patta(filter_column, filter_value, payload)
    try:
        return jsonify(resp.json()), resp.status_code
    except Exception:
        return (resp.text or 'unknown error'), resp.status_code

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
