import os
import state
import unittest
import tempfile
import json


class StateTestCase(unittest.TestCase):

    def setUp(self):
        self.db_fd, state.app.config['DATABASE'] = tempfile.mkstemp()
        state.app.config['TESTING'] = True
        self.app = state.app.test_client()
        state.init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(state.app.config['DATABASE'])

    def test_empty_db(self):
        rv = self.app.get('/d')
        assert json.loads(rv.data) == []

    def test_single_entry(self):
        test_data = {
            'name': 'john doe',
            'score': 1234,
            'time': 1234
        }
        rv = self.app.post('/d', data=test_data)
        assert 'ok' in json.loads(rv.data)
        rv = self.app.get('/d')
        assert json.loads(rv.data) == [test_data]

    def test_multiple_entries(self):
        for score in range(0, 25):
            data = {'name': 'john doe',
                    'score': score,
                    'time': 1234}
            rv = self.app.post('/d', data=data)
            assert 'ok' in json.loads(rv.data)
        rv = self.app.get('/d')
        assert len(json.loads(rv.data)) == 10


if __name__ == '__main__':
    unittest.main()
