'use strict';

const SESSION_STORAGE_KEY = 'sessionStorageItem';
const GET_SESSION_STORAGE_KEY = 'getSessionStorage';
let env;
try {
    env = process.env;
} catch (err) {
    env = {};
}
const PRODUCTION = !env ? false : env.NODE_ENV === 'production';

function logging() {
    if (PRODUCTION) {
        return null;
    }
    console.log([].slice.call(arguments));
}

let requestStorage = {
    addRequest(key, value) {
        this.urls[key] = value;
        sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(requestStorage.urls)
        );
    },
    sync(savedState) {
        logging('sync', savedState);
        this.urls = savedState || {};
    },
    fetchFeature(url, resolve, reject) {
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

            if (!this.synced) {
                setTimeout(() => {
                    this.fetchFeature(url, resolve, reject);
                }, 0);
            } else {
                this.fetchFeature(url, resolve, reject);
            }
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
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    },
    init() {
        requestStorage.sync(
            JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) || {}
        );

        if (requestStorage.isEmpty()) {
            localStorage.setItem(GET_SESSION_STORAGE_KEY, Date.now());
        }

        window.addEventListener('storage', function(event) {
            logging('event', event, requestStorage.isEmpty());
            if (event.key == GET_SESSION_STORAGE_KEY) {
                localStorage.setItem(
                    SESSION_STORAGE_KEY,
                    JSON.stringify(requestStorage.urls)
                );
                localStorage.removeItem(SESSION_STORAGE_KEY);
            } else if (
                event.key == SESSION_STORAGE_KEY &&
                requestStorage.isEmpty()
            ) {
                requestStorage.sync(JSON.parse(event.newValue));
                this.synced = true;
            }
        });
    },
    urls: {},
    synced: false
};

export default requestStorage;
