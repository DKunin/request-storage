function logging(...rest) {
    console.log(rest);
}

let requestStorage = {
    addRequest(key, value) {
        this.urls[key] = value;
        sessionStorage.setItem(
            'sessionStorageItem',
            JSON.stringify(requestStorage.urls)
        );
    },
    sync(savedState) {
        logging('sync', savedState);
        this.urls = savedState || {};
    },
    getFeature(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject({ error: 'Please provide url' });
            }
            logging(this.urls);
            if (this.urls && this.urls[url]) {
                logging('fetching request from cache');
                return resolve(this.urls[url]);
            }
            logging('fetching request');
            fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            })
                .then(response => response.json())
                .then(result => {
                    this.addRequest(url, result);
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                    throw new Error(error);
                });
        });
    },
    getFeatures() {
        return this.urls;
    },
    isEmpty() {
        return Object.keys(this.urls).length === 0;
    },
    purge() {
        this.urls = {};
        localStorage.removeItem('sessionStorageItem');
        sessionStorage.removeItem('sessionStorageItem');
    },
    init() {
        requestStorage.sync(
            JSON.parse(sessionStorage.getItem('sessionStorageItem')) || {}
        );

        if (requestStorage.isEmpty()) {
            localStorage.setItem('getSessionStorage', Date.now());
        }

        window.addEventListener('storage', function(event) {
            logging('event', event, requestStorage.isEmpty());
            if (event.key == 'getSessionStorage') {
                localStorage.setItem(
                    'sessionStorageItem',
                    JSON.stringify(requestStorage.urls)
                );
                localStorage.removeItem('sessionStorageItem');
            } else if (
                event.key == 'sessionStorageItem' &&
                requestStorage.isEmpty()
            ) {
                var data = JSON.parse(event.newValue);
                requestStorage.sync(data);
            }
        });
    },
    urls: {}
};

export default requestStorage;
