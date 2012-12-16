thestategame.com
================

Installation / Running the development server
---------------------------------------------

    ```bash
    # Create the virtualenv
    mkvirtualenv state
    # Clone the repo
    git clone git@githb.com:jarv/thestategame.com.git
    # Install the python requirements
    cd thestategame.com
    pip intall -r requirements.txt
    # Create the database
    echo "from state import init_db; init_db();" | python
    # Run the development server
    python state.py
    ```

Tests
-----

    python state_tests.py


