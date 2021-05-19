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
 * 就是 Number.parseInt() 啦
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
docReady(() => {
  // 弹个提示
  console.info('脚本已可用');
  let
    设置 = {},
    载入的JSON = [],
    抽奖歌单 = [],
    歌单名 = {
      // 'maimaidxplus': 'maimaiDX+ 日版',
      'maimaidxCN': '舞萌DX ver.CH1.11-A',
      'test': '测试用'
    },
    分类名 = {
      'pops_anime': '动画 & 流行',
      'niconico': 'nico & V家',
      'toho': '东方 Project',
      'variety': '其他游戏', // 虽然不太对但是也算那个意思了
      'maimai': 'maimai',
      'gekichu': '音击 & 中二'
      // 'original': '原创曲目'
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
  载入歌单('maimaidxCN', 2021051901);
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

  //#region 难度选择
  // 跟分类一样写就行了
  // 点了全部难度就把别的难度取消掉
  getEl('.rank-label.all input')[0].addEventListener('click', function () {
    getEl('.rank-label:not(.all) input').forEach(item => {
      item.checked = false;
    });
    // 不给点掉全部难度
    if (this.checked == false) {
      this.checked = true;
    }
  });

  // 点了其他难度就把全部难度取消掉
  getEl('.rank-label:not(.all) input').forEach(item => {
    item.addEventListener('click', () => {
      if (getEl('.rank-label:not(.all) input:checked').length != 0) {
        getEl('.rank-label.all input')[0].checked = false;
      } else {
        // 如果难度被全部取消的话就勾上全选
        getEl('.rank-label.all input')[0].checked = true;
      }
    });
  });
  //#endregion

  //#region 分类选择
  // 点了全部分类就把别的分类取消掉
  getEl('.cat-label.all input')[0].addEventListener('click', function () {
    getEl('.cat-label:not(.all) input').forEach(item => {
      item.checked = false;
    });
    // 不给点掉全部分类
    if (this.checked == false) {
      this.checked = true;
    }
  });

  // 点了其他分类就把全部分类取消掉
  getEl('.cat-label:not(.all) input').forEach(item => {
    item.addEventListener('click', () => {
      if (getEl('.cat-label:not(.all) input:checked').length != 0) {
        getEl('.cat-label.all input')[0].checked = false;
      } else {
        // 如果分类被全部取消的话就勾上全选
        getEl('.cat-label.all input')[0].checked = true;
      }
    });
  });
  //#endregion

  //#region 判断等级
  // 把这部分提取出来就好写一点
  function 判断等级(输入的等级) {
    // 如果设置的最高跟最低一样的话，就等于单难度抽歌
    let 高低一样 = (
      (设置.最低等级 == 设置.最高等级)
      && (设置.最低等级带加号 == 设置.最高等级带加号)
    );
    // 单等级抽歌的情况
    if (设置.范围 == '单' || 高低一样) {
      // console.log('单等级抽歌');
      // 简化等级
      let 抽取等级 = 设置.最低等级;
      if (设置.最低等级带加号) {
        // 给抽歌等级加上加号
        抽取等级 = 抽取等级 + '+';
      }
      // 返回结果
      return (输入的等级 == 抽取等级);
    } else if ((设置.范围 == '多') && (!高低一样)) {
      // 多等级抽歌的情况
      // console.log('多等级抽歌');
      // 先判定上下限
      // 如果高低整数等级一样的话，比如 12 跟 12+
      if (设置.最低等级 == 设置.最高等级) {
        // 这个好处理，直接返回结果就好
        // 举例：取整('12+') == 12，返回 true
        // 取整('13+') == 12，返回 false
        return (取整(输入的等级) == 设置.最低等级)
      } else {
        // 多等级的话，比如 11+ ~ 13
        // 先预设判定结果
        let 判定结果 = false;
        // 先判断整数范围
        // 如果某首歌是 12+ 的话就在 11+ ~ 13 里面，这个肯定没问题，嗯🚩
        // 同理，11/11+ 和 13/13+ 目前也是在范围内，下面再判断边缘情况
        // 抽 11+ ~ 12 也是没问题的，11/12+ 的情况在下面会判断
        if (取整(输入的等级) >= 设置.最低等级 && 取整(输入的等级) <= 设置.最高等级) {
          判定结果 = true;
        }
        // 再判断边缘情况
        // 如果抽到 11 的话，就不在 11+ ~ 13 的范围了嘛
        // 如果是抽 11 ~ 13 就不用这个判断了
        if (
          // what if 11/11+
          (取整(输入的等级) == 设置.最低等级) &&
          // what if 要求结尾是+
          (设置.最低等级带加号 == 'on') &&
          // what if 结尾没有+
          (输入的等级[输入的等级.length - 1] != '+')
        ) {
          // 就不在抽歌范围了
          判定结果 = false;
          // 举例：抽 11+ ~ 12，上面筛出来一首 11
          // 那么 11 取整得到 11，设置要求带加号，但是 11 的最后一位不是 +，所以为 false
          // 筛出来一首 11+ 的话，取整得到 11，最后一位是 +，所以无动作，继承上面的 判定结果 = true
        }

        // 判断最高等级的就是反过来的，我也不知道为什么这么写，但是感觉就该这样，脑子不太行。
        if (
          // what if 13/13+
          (取整(输入的等级) == 设置.最高等级) &&
          // what if 要求结尾不是+
          (设置.最高等级带加号 != 'on') &&
          // what if 结尾有+
          (输入的等级[输入的等级.length - 1] == '+')
        ) {
          // 就不在抽歌范围了
          判定结果 = false;
          // 举例：抽 11+ ~ 12，上面筛出来一首 12+
          // 那么 12+ 取整得到 12，设置要求不带加号，但是 12+ 的最后一位是 +，所以为 false
          // 筛出来一首 12 的话，取整得到 12，最后一位不是 +，所以无动作，继承上面的 判定结果 = true
        }

        // 返回判定结果
        return 判定结果;
      }
    } else {
      // 以上情况都不是，报个错
      alert('设置有问题，需要检查设置或提交 Issue');
    }
  }
  //#endregion

  // 表单保存的动作
  let 表单 = getEl('#option-form');
  表单.addEventListener('submit', function (event) {
    // 开始计时
    console.time('筛歌');
    let 表单数据 = new FormData(this);
    console.log('表单数据：', 表单数据);

    // 清空一下设置，不然会有残留
    设置 = {};
    for (let [key, value] of 表单数据.entries()) {
      设置[key] = value;
    }
    // 单独处理一下分类
    设置.分类 = [];
    getEl('.cat-label input:checked').forEach(item => {
      设置.分类.push(item.value);
    });
    if (设置.分类.length == 0) {
      设置.分类[0] = 'all';
    }
    // 也单独处理一下难度
    设置.难度 = [];
    getEl('.rank-label input:checked').forEach(item => {
      设置.难度.push(item.value);
    });
    if (设置.难度.length == 0 || 设置.难度[0] == 'all') {
      设置.难度 = ['B', 'A', 'E', 'M', 'R'];
    }
    console.log('设置：', 设置);

    //#region 筛歌部分
    let 原始歌单 = 载入的JSON[设置.歌单].曲目列表;
    // 先清空一下歌单
    抽奖歌单 = [];

    // 遍历歌单
    原始歌单.map(当前歌曲 => {
      // 前面已经已经预设了当 设置.难度 == 'all' 时则把全部难度塞了进去
      // 所以这边就懒得搞那么多了
      // 先设置结果
      let 结果 = false;
      // 判定这首歌对应难度的等级符不符合要求
      设置.难度.forEach(难度 => {
        // 只要有一个难度的等级符合了要求就给过
        if (判断等级(当前歌曲.等级[难度])) {
          结果 = true;
        }
      });
      if (结果) {
        抽奖歌单.push(当前歌曲);
      }
    });

    // 最后筛一遍分类
    if (设置.分类 && 设置.分类 != 'all') {
      抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
        return 设置.分类.includes(被选中的歌.分类);
      });
    }
    //#endregion

    // 预览歌单
    console.log('筛选后歌单：', 抽奖歌单);

    if (抽奖歌单.length == 0) {
      alert('抽选歌单为空，请检查筛选条件。');
      // console.warn('抽选歌单为空，请检查筛选条件。');
      // 禁抽歌
      Roll歌按钮.setAttribute('disabled', 'disabled');
    } else {
      // 可抽歌
      Roll歌按钮.removeAttribute('disabled');
    }

    // 显示设置
    let 等级文字 = {};
    if (设置.最低等级带加号) {
      等级文字.最低等级 = `${设置.最低等级}+`;
    } else {
      等级文字.最低等级 = `${设置.最低等级}`;
    }

    let 高低一样 = (
      (设置.最低等级 == 设置.最高等级)
      && (设置.最低等级带加号 == 设置.最高等级带加号)
    );
    if (设置.范围 == '多' && 设置.最高等级 && !高低一样) {
      if (设置.最高等级带加号) {
        等级文字.最高等级 = ` ~ ${设置.最高等级}+`;
      } else {
        等级文字.最高等级 = ` ~ ${设置.最高等级}`;
      }
    } else {
      等级文字.最高等级 = '';
    }

    let tempArr = [];
    if (设置.分类[0] != 'all') {
      设置.分类.forEach(item => {
        tempArr.push(分类名[item]);
      });
      console.log('分类：', tempArr);
    } else {
      tempArr[0] = '全分类';
    }
    getEl('#setting-category').textContent = tempArr.join('、');

    tempArr = [];
    if (设置.难度[0] != 'all') {
      设置.难度.forEach(item => {
        tempArr.push(`<span class="${item}">${item}</span>`);
      });
      console.log('难度：', tempArr);
    } else {
      tempArr[0] = '全难度';
    }
    getEl('#setting-rank').innerHTML = tempArr.join('.');
    getEl('#setting-lv').textContent = 等级文字.最低等级 + 等级文字.最高等级;
    getEl('#setting-songlist').textContent = 歌单名[设置.歌单];

    // 隐藏设置框
    getEl('.option-main')[0].classList.remove('show');
    // 计时结束
    console.timeEnd('筛歌');
    // 禁掉默认的提交动作
    event.preventDefault();
    return false;
  });
  //#endregion

  function 展示内容(抽到的歌) {
    getEl('#title').textContent = 抽到的歌.曲名;
    getEl('#category').textContent = 分类名[抽到的歌.分类];
    getEl('#type').textContent = 抽到的歌.类型;
    if (抽到的歌.封面 && (抽到的歌.封面 != '')) {
      getEl('#cover').setAttribute('src', `./static/img/cover/${抽到的歌.封面}.jpg`);
    } else {
      getEl('#cover').setAttribute('src', './static/img/nocover.png');
    }
    if (抽到的歌.类型 == 'DX') {
      getEl('#type').parentNode.classList.add('DX');
    } else {
      getEl('#type').parentNode.classList.remove('DX');
    }

    for (const [难度] of Object.entries(抽到的歌.等级)) {
      getEl(`#table-lv-num-${难度}`).textContent = 抽到的歌.等级[难度];
    }
  }

  // 开始 Roll 歌
  Roll歌按钮.addEventListener('click', () => {
    console.log('Roll!');
    // 打乱歌单
    shuffleArray(抽奖歌单);
    console.log(抽奖歌单);
    // 算法足够随机的情况下取第一首即可
    let 抽到的歌 = 抽奖歌单[0];
    console.log(抽到的歌);
    展示内容(抽到的歌);

    let 要展示的难度 = '', tempArr = [], 临时结果 = false;

    // 想办法弄出抽的是哪个难度
    设置.难度.forEach(难度 => {
      // 判断这首歌的等级所对应的难度合不合适
      console.log(抽到的歌.等级[难度]);
      if (判断等级(抽到的歌.等级[难度])) {
        // 合适就塞数组里
        console.log('塞进去了');
        tempArr.push(难度);
      }
    });
    console.log('临时数组：', tempArr);
    shuffleArray(tempArr);
    要展示的难度 = tempArr[0];

    // 先清掉显示中的样式
    getEl('.table-lv-num').forEach(el => {
      el.classList.remove('current');
    });
    // 封面也整个框
    getEl('#cover').classList.remove('B', 'A', 'E', 'M', 'R');
    if ((要展示的难度) && (要展示的难度.length != 0)) {
      console.log('最终展示的难度：', 要展示的难度);
      getEl(`#table-lv-num-${要展示的难度}`).classList.add('current');

      // 封面的框
      getEl('#cover').classList.add(要展示的难度);
    }
  });

  // 随便整一首
  收歌按钮.addEventListener('click', () => {
    if (!载入的JSON['maimaidxCN']) {
      alert('歌单还没载入好，稍等一哈');
    } else {
      console.log('随便 Roll 一首');
      let 收歌歌单CN = 载入的JSON['maimaidxCN'].曲目列表;
      shuffleArray(收歌歌单CN);
      let 抽到的歌 = 收歌歌单CN[0];
      console.log(抽到的歌);
      展示内容(抽到的歌);

      getEl('.table-lv-num').forEach(el => {
        el.classList.remove('current');
      });
      getEl('#cover').classList.remove('B', 'A', 'E', 'M', 'R');
    }
  });
});
// 载入完力
console.log('script.js 已载入');