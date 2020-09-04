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
docReady(() => {
    let
        设置 = {},
        载入的JSON = [],
        抽奖歌单 = [],
        歌单名 = {
            'maimaidxplus': 'maimaiDX+ 日版',
            'maimaidxCN': 'maimaiDX CN（新基准）'
        },
        分类名 = {
            'pops_anime': '动画 & 流行',
            'niconico': 'nico & V家',
            'toho': '东方 Project',
            'variety': '游戏 & 联动',
            'maimai': 'maimai 原创',
            'gekichu': '音击 & 中二',
            'original': '原创曲目'
        },
        难度名 = {
            all: '全难度',
            B: 'Basic',
            A: 'Advanced',
            E: 'Expert',
            M: 'Master',
            R: 'Re:Master'
        };
    //#region 载入歌单
    function 载入歌单(文件名, 版本 = 1) {
        let 载入次数;
        myAjax({
            type: 'GET',
            url: './data/' + 文件名 + '.json?ver=' + 版本,
            timeout: 10000,
            type: 'json',
            done: (data) => {
                console.log(data.response);
                载入的JSON[文件名] = data.response;
                console.log('载入的JSON:', 载入的JSON);
            },
            fail: () => {
                if (载入次数 < 10) {
                    载入次数++;
                    载入歌单(文件名, 版本);
                    console.log('载入文件失败：' + 文件名 + '（' + 版本 + '），失败次数：' + 载入次数);
                } else {
                    alert(文件名 + '.json' + '（' + 版本 + '）' + '载入失败次数过多，请刷新页面重试');
                    载入次数 = 0;
                }
            }
        });
    }
    载入歌单('maimaidxCN', 1);
    载入歌单('maimaidxplus', 1);
    //#endregion
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
            等级 = getEl('#lv').value,
            等级带加号 = getEl('#lv-plus').checked,
            表单数据 = new FormData(this);
        console.log('表单数据：', 表单数据);

        if (!(Number(等级) > 0) || isNaN(Number(等级))) {
            console.log('设置有误');
            console.log('等级：', 等级);

            console.log(Number(等级));
            console.log(isNaN(Number(等级)));

            // event.preventDefault();
            return false;
        }
        // 清空一下设置，不然会有残留
        设置 = {};
        for (let [key, value] of 表单数据.entries()) {
            设置[key] = value;
        }
        getEl('.option-main')[0].classList.remove('show');
        Roll歌按钮.removeAttribute('disabled');

        console.log('设置：', 设置);

        if (设置.等级带加号) {
            getEl('#setting-lv').textContent = `[${难度名[设置.难度]}] ${设置.等级}+`;
        } else {
            getEl('#setting-lv').textContent = `[${难度名[设置.难度]}] ${设置.等级}`;
        }
        getEl('#setting-songlist').textContent = 歌单名[设置.歌单];

        // 筛选歌曲
        抽奖歌单 = 载入的JSON[设置.歌单].曲目列表;
        console.log('筛选前的抽奖歌单：', 抽奖歌单);
        function 筛选歌单(歌曲) {
            let
                result = false,
                lv = 设置.等级;
            let tempLv = Object.values(歌曲.等级);
            if (设置.等级带加号) {
                lv = lv + '+';
            }
            if (设置.难度 == 'all') {
                tempLv.some((value) => {
                    if (value == lv) {
                        result = true;
                    }
                    // console.log('Result:', result);
                });
            } else {
                if (歌曲.等级[设置.难度] == lv) {
                    result = true;
                }
            }
            return result;
        }
        抽奖歌单 = 抽奖歌单.filter(筛选歌单);
        // 打乱一下歌单，避免浏览器的伪随机影响
        shuffleArray(抽奖歌单);
        console.log('筛选后的抽奖歌单：', 抽奖歌单);

        event.preventDefault();
        return false;
    });
    //#endregion

    // 打乱数组，来自：https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function 抽取(最小值, 最大值) {
        let 抽取数 = 最大值 - 最小值 + 1;
        return Math.floor(Math.random() * 抽取数 + 最小值);
    }
    // 来自：https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    Roll歌按钮.addEventListener('click', () => {
        console.log('Roll!');
        let
            随机数 = 抽取(0, 抽奖歌单.length - 1),
            抽到的歌 = 抽奖歌单[随机数];
        console.log(抽到的歌);
        getEl('#title').textContent = 抽到的歌.曲名;
        getEl('#category').textContent = 分类名[抽到的歌.分类];
        let temp = {};
        if (设置.等级带加号) {
            temp.lv = 设置.等级 + '+';
        } else {
            temp.lv = 设置.等级;
        }
        temp.lvName = getKeyByValue(抽到的歌.等级, temp.lv);
        getEl('#lv-name').classList.remove('B', 'A', 'E', 'M', 'R');
        getEl('#lv-name').classList.add(temp.lvName);
        getEl('#lv-name').textContent = 难度名[temp.lvName];
        getEl('#lv-num').textContent = temp.lv;
        getEl('#type').textContent = 抽到的歌.类型;
        if (抽到的歌.封面 != '') {
            getEl('#cover').setAttribute('src', `./static/img/cover/${抽到的歌.分类}/${抽到的歌.封面}.jpg`);
        } else {
            getEl('#cover').setAttribute('src', './static/img/nocover.png');
        }
        getEl('#table-lv-num-B').textContent = 抽到的歌.等级.B;
        getEl('#table-lv-num-A').textContent = 抽到的歌.等级.A;
        getEl('#table-lv-num-E').textContent = 抽到的歌.等级.E;
        getEl('#table-lv-num-M').textContent = 抽到的歌.等级.M;
        getEl('#table-lv-num-R').textContent = 抽到的歌.等级.R;
    });
});
