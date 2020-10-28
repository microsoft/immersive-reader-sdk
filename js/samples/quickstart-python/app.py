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

@app.route('/GetToken', methods=['POST'])
def getToken():
	'Post request to get the access token'
	if request.method == 'POST':
		payload = {'Ocp-Apim-Subscription-Key': os.environ.get('SUBSCRIPTION_KEY', 'defaultValue'),
            	   'content-type': 'application/x-www-form-urlencoded'}
		resp = requests.post('https://' + os.environ.get('REGION', 'defaultValue') + '.api.cognitive.microsoft.com/sts/v1.0/issueToken', headers=payload)
		return resp.text