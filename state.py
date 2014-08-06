import sqlite3
import os
from flask import Flask, request, g
from contextlib import closing
import json
import re

DATABASE = os.path.join('/tmp/hs.db')

app = Flask(__name__)
app.config.from_object(__name__)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

@app.route('/d', methods=['GET'])
def get_scores():
    results = g.db.execute(
        'select name, score, time from hs order by score limit 10')

    q = [dict(zip(['name', 'score', 'time'], [item for item in row]))
         for row in results]

    return json.dumps(q)


@app.route('/d', methods=['POST'])
def post_score():
    data = request.form
    if (not re.match('[\s\w]{1,20}$', data['name'])):
        return json.dumps({'error': 'invalid name'})
    if (not re.match('[0-9]+\.?[0-9]*$', data['time'])):
        return json.dumps({'error': 'invalid time'})
    if (not re.match('[0-9]{1,15}$', data['score'])):
        return json.dumps({'error': 'invalid score'})

    g.db.execute('insert into hs (name, score, time) values (?, ?, ?)',
                 [data['name'], data['score'], data['time']])
    g.db.commit()
    return json.dumps({'ok': 'success'})


def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('state.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()


if __name__ == '__main__':
    app.run()
