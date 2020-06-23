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
window.设置 = {};
// 下面才是正文
console.log('script.js 已载入');
docReady(() => {
    let
        Roll歌按钮 = getEl('#roll-button');
    Roll歌按钮.setAttribute('disabled', 'disabled');
    //#region 设置
    let 设置按钮 = getEl('#setting-button');
    let 保存设置 = getEl('#save-option');
    设置按钮.addEventListener('click', () => {
        getEl('.option-main')[0].classList.add('show');
    });
    let 表单 = getEl('#option-form');
    表单.addEventListener('submit', function (event) {
        let
            最低等级 = getEl('#lv-min').value,
            最高等级 = getEl('#lv-max').value,
            最低等级带加号 = getEl('#lv-min-plus').checked,
            最高等级带加号 = getEl('#lv-max-plus').checked,
            表单数据 = new FormData(this);
        console.log('表单数据：', 表单数据);

        if (!(Number(最低等级) > 0) || isNaN(Number(最低等级)) || !(Number(最高等级) > 0) || isNaN(Number(最高等级))) {
            console.log('设置有误');
            console.log('最低等级：', 最低等级);
            console.log('最高等级：', 最高等级);

            console.log(Number(最低等级));
            console.log(isNaN(Number(最低等级)));
            console.log(Number(最高等级));
            console.log(isNaN(Number(最高等级)));

            // event.preventDefault();
            return false;
        }
        设置 = 表单数据;
        getEl('.option-main')[0].classList.remove('show');
        Roll歌按钮.removeAttribute('disabled');
        event.preventDefault();
        return false;
    });
    //#endregion

    Roll歌按钮.addEventListener('click', () => {
        console.log('Roll!');
    });
});
