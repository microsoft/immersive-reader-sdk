import os
import requests
from flask import Flask, redirect, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
	'Redirect to the Section page'
	return redirect('/index')

@app.route('/index')
def sections():
	'Show the Section page'
	return render_template('index.html', subdomain=str(os.environ.get('SUBDOMAIN')))

@app.route('/document')
def document():
	'Show the Document page'
	return render_template('document.html', subdomain=str(os.environ.get('SUBDOMAIN')))

@app.route('/multilang')
def multilang():
	'Show the Multi Lang Document page'
	return render_template('multilang.html', subdomain=str(os.environ.get('SUBDOMAIN')))

@app.route('/uilangs')
def uilangs():
	'Show the UI Langs Document page'
	return render_template('uilangs.html', subdomain=str(os.environ.get('SUBDOMAIN')))

@app.route('/math')
def math():
	'Show the Math page'
	return render_template('math.html', subdomain=str(os.environ.get('SUBDOMAIN')))

@app.route('/getimmersivereadertoken', methods=['POST'])
def getimmersivereadertoken():
	'Get the access token'
	if request.method == 'POST':
		headers = { 'content-type': 'application/x-www-form-urlencoded' }
		data = {
			'client_id': str(os.environ.get('CLIENT_ID')),
			'client_secret': str(os.environ.get('CLIENT_SECRET')),
			'resource': 'https://cognitiveservices.azure.com/',
			'grant_type': 'client_credentials'
		}
		resp = requests.post('https://login.windows.net/' + str(os.environ.get('TENANT_ID')) + '/oauth2/token', data=data, headers=headers)
		return resp.text