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
	return render_template('index.html')

@app.route('/document')
def document():
	'Show the Document page'
	return render_template('document.html')

@app.route('/multilang')
def multilang():
	'Show the Multi Lang Document page'
	return render_template('multilang.html')

@app.route('/uilangs')
def uilangs():
	'Show the UI Langs Document page'
	return render_template('uilangs.html')

@app.route('/math')
def math():
	'Show the Math page'
	return render_template('math.html')

@app.route('/getimmersivereadertoken', methods=['POST'])
def getimmersivereadertoken():
	'Get the access token'
	if request.method == 'POST':
		payload = {'Ocp-Apim-Subscription-Key': os.environ.get('SUBSCRIPTION_KEY', 'defaultValue'),
            	   'content-type': 'application/x-www-form-urlencoded'}
		resp = requests.post(os.environ.get('ENDPOINT', 'defaultValue') + '/issueToken', headers=payload)
		return resp.text