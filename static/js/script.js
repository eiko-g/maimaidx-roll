'use strict';
/**
 * Doc Ready
 * 就是 $.(document).ready(function(){})
 */
function docReady(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/**
 * Get Element
 * 就是 $(element)
 */
function getEl(element) {
    let tempEl;
    switch ([...element][0]) {
        case '#':
            tempEl = document.querySelectorAll(element)[0];
            break;
        default:
            tempEl = document.querySelectorAll(element);
    };
    return tempEl;
}

/**
 * My ajax
 * 自写的一个稀烂的 Ajax 函数
 */
function myAjax({
    method = 'GET',
    url = undefined,
    data,
    async = true,
    user = null,
    password = null,
    type = '',
    done = () => { },
    fail = () => { },
    always = () => { },
    error = () => { },
    timeout = undefined,
    timeoutEvent = () => { },
    beforeSend = () => { },
}) {

    let xhr = new XMLHttpRequest();
    xhr.open(method, url, async, user, password);
    xhr.responseType = type;
    beforeSend(this);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            done(this);
        } else {
            fail(this);
        }
        always(this);
    }
    xhr.onerror = function () {
        error(this);
        always(this);
    }
    timeout = Number(timeout);
    if (!Number.isNaN(timeout) && Number.isInteger(timeout)) {
        xhr.timeout = timeout;
        xhr.ontimeout = function () {
            timeoutEvent(this);
            xhr.abort();
            always(this);
        }
    }
    if (data) {
        xhr.send(data);
    } else {
        xhr.send();
    }
};

// 下面才是正文
console.log('script.js 已载入');