import traceback
import os
import requests
import json
from dotenv import load_dotenv
from flask import Flask, redirect, render_template, request, jsonify
app = Flask(__name__)

load_dotenv()

@app.route('/')
def index():
	'Show the index page'
	return render_template('index.html')

@app.route('/GetTokenAndSubdomain', methods=['GET'])
def getTokenAndSubdomain():
	'Get the access token'
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