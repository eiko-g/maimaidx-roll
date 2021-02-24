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

/**
 * 取整
 * 就是取整
 */
function 取整(str) {
  return Number.parseInt(str);
}

// 打乱数组，来自：https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// 逼乎相关讨论：https://www.zhihu.com/question/68330851
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 下面才是正文
console.log('script.js 已载入');
docReady(() => {
  let
    设置 = {},
    载入的JSON = [],
    抽奖歌单 = [],
    歌单名 = {
      'maimaidxplus': 'maimaiDX+ 日版',
      'maimaidxCN': '舞萌DX ver.CH-1.01D',
      'test': '测试用'
    },
    分类名 = {
      'pops_anime': '动画 & 流行',
      'niconico': 'nico & V家',
      'toho': '东方 Project',
      'variety': '综艺曲目',
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
      url: `./data/${文件名}.json?ver=${版本}`,
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
          console.log(`载入文件失败：${文件名}（${版本}），失败次数：${载入次数}`);
        } else {
          alert(`${文件名}.json（${版本}）载入失败次数过多，请刷新页面重试`);
          载入次数 = 0;
        }
      }
    });
  }
  载入歌单('maimaidxCN', 2021012901);
  // 载入歌单('test', 1111);
  //#endregion

  let
    Roll歌按钮 = getEl('#roll-button'),
    收歌按钮 = getEl('#random-roll');
  // 先禁掉按钮，不然有时候刷新没有被禁
  Roll歌按钮.setAttribute('disabled', 'disabled');
  //#region 设置框相关
  let 设置按钮 = getEl('#setting-button');
  // 显示设置框
  设置按钮.addEventListener('click', () => {
    getEl('.option-main')[0].classList.add('show');
  });

  // 切换等级设置显示
  getEl('#lv-range-s').addEventListener('click', () => {
    getEl('#option-lv-max').classList.remove('show');
    getEl('#option-lv-max-plus').classList.remove('show');
  });
  getEl('#lv-range-m').addEventListener('click', () => {
    getEl('#option-lv-max').classList.add('show');
    getEl('#option-lv-max-plus').classList.add('show');
  });

  // 表单保存的动作
  let 表单 = getEl('#option-form');
  表单.addEventListener('submit', function (event) {
    let 表单数据 = new FormData(this);
    console.log('表单数据：', 表单数据);

    // 清空一下设置，不然会有残留
    设置 = {};
    for (let [key, value] of 表单数据.entries()) {
      设置[key] = value;
    }
    console.log('设置：', 设置);

    //#region 筛歌部分
    抽奖歌单 = 载入的JSON[设置.歌单].曲目列表;
    if (设置.范围 == '单') {
      console.log('单难度抽歌');
      if (设置.最低难度 && !Number.isNaN(取整(设置.最低难度))) {
        // 单难度抽歌
      }

    } else if (设置.范围 == '多') {
      console.log('多难度抽歌');
    } else {
      alert('设置有问题，需要检查');
    }
    //#endregion

    // if (抽奖歌单.length == 0) {
    //   alert('抽选歌单为空，请检查筛选条件。');
    // }

    // 显示设置
    let 等级文字 = {};
    if (设置.最低等级带加号) {
      等级文字.最低等级 = `${设置.最低等级}+`;
    } else {
      等级文字.最低等级 = `${设置.最低等级}`;
    }

    if (设置.范围 == '多' && 设置.最高等级) {
      if (设置.最高等级带加号) {
        等级文字.最高等级 = ` ~ ${设置.最高等级}+`;
      } else {
        等级文字.最高等级 = ` ~ ${设置.最高等级}`;
      }
    } else {
      等级文字.最高等级 = '';
    }
    getEl('#setting-lv').textContent = `[${难度名[设置.难度]}]` + 等级文字.最低等级 + 等级文字.最高等级;
    getEl('#setting-songlist').textContent = 歌单名[设置.歌单];

    // 隐藏设置框
    getEl('.option-main')[0].classList.remove('show');
    // 使抽歌按钮可用
    Roll歌按钮.removeAttribute('disabled');
    // 禁掉默认的提交动作
    event.preventDefault();
    return false;
  });
  //#endregion
});