import traceback
import os
import requests
import json
from dotenv import load_dotenv
from flask import Flask, redirect, render_template, request, jsonify, abort
app = Flask(__name__)

load_dotenv()

# ---------------------------------------------------------------------------
# SECURITY NOTICE
# ---------------------------------------------------------------------------
# The /GetTokenAndSubdomain endpoint below mints a real Azure AD access token
# from this app's confidential service-principal credentials (CLIENT_ID /
# CLIENT_SECRET) and returns that bearer token to the caller. Any caller that
# can reach this route obtains a usable Cognitive Services token.
#
# This quickstart is intended ONLY for local development on 127.0.0.1. Before
# deploying anything derived from this sample:
#   1. Replace the loopback check in `_require_local()` with real application
#      authentication (e.g. a login-required decorator, session check, signed
#      request, or API gateway in front of the app).
#   2. Do NOT run `flask run --host=0.0.0.0` (or otherwise bind to a public
#      interface) without first adding auth -- doing so exposes the token
#      minter to your LAN / the internet.
# ---------------------------------------------------------------------------

def _require_local():
	'Reject non-loopback callers. Replace with real auth for production use.'
	if request.remote_addr not in ('127.0.0.1', '::1'):
		abort(403, description='This sample only serves loopback requests. '
			'Add real authentication before exposing /GetTokenAndSubdomain.')

@app.route('/')
def index():
	'Show the index page'
	return render_template('index.html')

@app.route('/options')
def options():
	'Show the options page'
	return render_template('options.html')

@app.route('/GetTokenAndSubdomain', methods=['GET'])
def getTokenAndSubdomain():
	'Get the access token'
	_require_local()
	if request.method == 'GET':
		try:
			headers = { 'content-type': 'application/x-www-form-urlencoded' }
			data = {
				'client_id': str(os.environ.get('CLIENT_ID')),
				'client_secret': str(os.environ.get('CLIENT_SECRET')),
				'resource': 'https://cognitiveservices.azure.com/',
				'grant_type': 'client_credentials'
			}

			resp = requests.post('https://login.windows.net/' + str(os.environ.get('TENANT_ID')) + '/oauth2/token', data=data, headers=headers)
			jsonResp = resp.json()
			
			if ('access_token' not in jsonResp):
				print(jsonResp)
				raise Exception('AAD Authentication error')

			token = jsonResp['access_token']
			subdomain = str(os.environ.get('SUBDOMAIN'))

			return jsonify(token = token, subdomain = subdomain)
		except Exception as e:
			message = 'Unable to acquire Azure AD token. Check the debugger for more information.'
			print(message, e)
			return jsonify(error = message)