'''
Grady Landers
Server for fishing game leaderboard
'''

from flask import Flask, request, jsonify
from flask_cors import CORS

#initialize server
app = Flask(__name__)
CORS(app)

'''FLASK METHODS'''
#post to the leaderboard
@app.route('/sendscore', methods=['POST'])
def sendscore():
    data = request.get_json()
    name = data['name']
    score = data['score']

    insert_score(name, score)

    response = {
        'status': 'success',
        'message': 'Score added successfully!'
    }
    return jsonify(response)

#fetch the leaderboard
@app.route('/getscores', methods=['GET'])
def getscores():
    return jsonify(leaderboard)

#post to the user ips
@app.route('/connect', methods=['POST'])
def connect():
    data = request.get_json()
    ip = data['ip']

    insert_ip(ip)

    response = {
        'status': 'success',
        'message': 'IP collected successfully!'
    }
    return jsonify(response)

'''UTILITIES'''
def lsort(e):
    return int(e['score'])

def insert_score(name, score):
    entry = {
        'name': name,
        'score': score
    }

    leaderboard.append(entry)
    leaderboard.sort(reverse=True, key=lsort)

    save_leaderboard()

def save_leaderboard():
    f = open('leaderboard.txt', 'w')

    for entry in leaderboard:
        f.write(entry['name']+';'+str(entry['score'])+'\n')

    f.close()

def load_leaderboard():
    scores = []

    f = open('leaderboard.txt', 'r')
    for line in f:
        if line != '':
            entry = line.split(';')
            scores.append({
                'name': entry[0],
                'score': entry[1]
            })
    
    return scores

def insert_ip(ip):
    saved = False
    
    for entry in user_ips:
        if entry['ip'] == ip:
            times = int(entry['times'])
            entry['times'] = str(times+1)
            saved = True
    
    if not saved:
        user_ips.append({
            'ip': ip,
            'times': '1'
        })
    
    save_ips()

def save_ips():
    f = open('log.txt', 'w')

    for entry in user_ips:
        f.write(entry['ip']+';'+entry['times']+'\n')
    
    f.close()

def load_ips():
    ips = []
    
    f = open('log.txt', 'r')
    for line in f:
        if line != '':
            entry = line.split(';')
            ips.append({
                'ip': entry[0],
                'times': entry[1]
            })

    return ips

#set up local data
leaderboard = load_leaderboard()
user_ips = load_ips()

#only start the server when this file is executed
if __name__ == '__main__':
    app.run(host='127.0.0.1',port=8000,debug=True)
