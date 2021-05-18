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
      'maimaidxCN': '舞萌DX ver.CH-1.11',
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
  载入歌单('maimaidxCN', 2021043001);
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
    console.log('设置：', 设置);

    //#region 筛歌部分
    抽奖歌单 = 载入的JSON[设置.歌单].曲目列表;
    let 高低一样 = ((设置.最低等级 == 设置.最高等级) && (设置.最低等级带加号 == 设置.最高等级带加号));
    console.log('高低一样：', 高低一样);
    if (设置.范围 == '单' || 高低一样) {
      console.log('单等级抽歌');
      // 简化等级
      let 抽取等级 = 设置.最低等级;
      if (设置.最低等级带加号) {
        抽取等级 = 抽取等级 + '+';
      }
      // 如果全难度的话
      if (设置.难度 == 'all') {
        抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
          // 结果标记
          let result = false;
          //console.log('被选中的歌', 被选中的歌);
          // 把等级取成数组
          let 歌的等级 = Object.values(被选中的歌.等级);
          //console.log('歌的等级', 歌的等级);
          // 如果等级数组里面有某项符合的话
          歌的等级.some(单个等级 => {
            if (单个等级 == 抽取等级) {
              // 就把结果标记改成 true
              result = true;
            }
          });
          // 返回这首歌的判断结果
          return result;
        });
      } else {
        // 剩下的就是指定了难度嘛
        抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
          // console.log(被选中的歌);
          // 字面意思
          return (被选中的歌.等级[设置.难度] == 抽取等级);
        });
      }
    } else if ((设置.范围 == '多') && (!高低一样)) {
      console.log('多等级抽歌');
      // 如果是全难度的话
      if (设置.难度 == 'all') {
        // 如果高低整数等级一样的话，比如 12 跟 12+
        if (取整(设置.最低等级) == 取整(设置.最高等级)) {
          抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
            // 结果标记
            let result = false;
            //console.log('被选中的歌', 被选中的歌);
            // 把等级取成数组
            let 歌的等级 = Object.values(被选中的歌.等级);
            //console.log('歌的等级', 歌的等级);
            // 如果等级数组里面有某项符合的话
            歌的等级.some(单个等级 => {
              // 这时候 12+ 也是 12 嘛
              if (取整(单个等级) == 设置.最低等级) {
                // 就把结果标记改成 true
                result = true;
              }
            });
            // 返回这首歌的判断结果
            return result;
          });
        } else {
          //#region 多难度范围抽歌
          // 如果范围更大的话
          // what if 11+ ~ 13
          抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
            // 结果标记
            let result = false;
            //console.log('被选中的歌', 被选中的歌);
            // 把等级取成数组
            let 歌的等级 = Object.values(被选中的歌.等级);
            //console.log('歌的等级', 歌的等级);
            歌的等级.some(单个等级 => {
              // 先判断整数范围
              // 如果某首歌是 12+ 的话就在 11+ ~ 13 里面，这个肯定没问题，嗯🚩
              // 同理，11/11+ 和 13/13+ 目前也是在范围内，下面再判断边缘情况
              // 抽 11+ ~ 12 也是没问题的，11/12+ 的情况在下面会判断
              if (取整(单个等级) >= 设置.最低等级 && 取整(单个等级) <= 设置.最高等级) {
                result = true;
              }
              // 再判断边缘情况
              // 如果抽到 11 的话，就不在 11+ ~ 13 的范围了嘛
              // 如果是抽 11 ~ 13 就不用这个判断了
              if (
                // what if 11/11+
                (取整(单个等级) == 设置.最低等级) &&
                // what if 要求结尾是+
                (设置.最低等级带加号 == 'on') &&
                // what if 结尾没有+
                (单个等级[单个等级.length - 1] != '+')
              ) {
                // 就不在抽歌范围了
                result = false;
                // 举例：抽 11+ ~ 12，上面筛出来一首 11
                // 那么 11 取整得到 11，设置要求带加号，但是 11 的最后一位不是 +，所以为 false
                // 筛出来一首 11+ 的话，取整得到 11，最后一位是 +，所以无动作，继承上面的 result = true
              }

              // 判断最高等级的就是反过来的，我也不知道为什么这么写，但是感觉就该这样，脑子不太行。
              if (
                // what if 13/13+
                (取整(单个等级) == 设置.最高等级) &&
                // what if 要求结尾不是+
                (设置.最高等级带加号 != 'on') &&
                // what if 结尾有+
                (单个等级[单个等级.length - 1] == '+')
              ) {
                // 就不在抽歌范围了
                result = false;
                // 举例：抽 11+ ~ 12，上面筛出来一首 12+
                // 那么 12+ 取整得到 12，设置要求不带加号，但是 12+ 的最后一位是 +，所以为 false
                // 筛出来一首 12 的话，取整得到 12，最后一位不是 +，所以无动作，继承上面的 result = true
              }
            });
            // 返回结果
            return result;
          });
          //#endregion 多难度范围抽歌
        }
      } else {
        // 如果指定了难度的话
        抽奖歌单 = 抽奖歌单.filter(被选中的歌 => {
          // 结果标记
          let result = false;
          //console.log('被选中的歌', 被选中的歌);
          // 把等级取出来
          let 单个等级 = 被选中的歌.等级[设置.难度];
          // 然后复制粘贴上面的
          // 是的，“代码复用”
          if (取整(单个等级) >= 设置.最低等级 && 取整(单个等级) <= 设置.最高等级) {
            result = true;
          }
          if (
            (取整(单个等级) == 设置.最低等级) &&
            (设置.最低等级带加号 == 'on') &&
            (单个等级[单个等级.length - 1] != '+')
          ) {
            result = false;
          }
          if (
            (取整(单个等级) == 设置.最高等级) &&
            (设置.最高等级带加号 != 'on') &&
            (单个等级[单个等级.length - 1] == '+')
          ) {
            result = false;
          }
          return result;
        });
      }
    } else {
      alert('设置有问题，需要检查');
    }
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
      console.log(tempArr);
    } else {
      tempArr[0] = '全分类';
    }

    getEl('#setting-rank').textContent = 难度名[设置.难度];
    getEl('#setting-rank').classList.remove('B', 'A', 'E', 'M', 'R');
    getEl('#setting-rank').classList.add(设置.难度);
    getEl('#setting-lv').textContent = 等级文字.最低等级 + 等级文字.最高等级;
    getEl('#setting-songlist').textContent = 歌单名[设置.歌单];
    getEl('#setting-category').textContent = tempArr.join('、');

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

    let 要展示的难度;

    // 想办法弄出抽的是哪个难度
    // 先复制粘贴旧的了，反正可以用
    if (设置.难度 == 'all') {
      // 全难度的情况下
      // 开始堆屎了
      //#region 另一个思路的筛选
      function 筛选等级(等级) {
        // 又开始了.jpg
        let
          结果 = false,
          实际最低等级 = 设置.最低等级,
          实际最高等级 = 设置.最高等级;
        if (设置.最低等级带加号) {
          实际最低等级 = 设置.最低等级 + '+';
        }
        if (设置.最高等级带加号) {
          实际最高等级 = 设置.最高等级 + '+';
        }
        if (!设置.最高等级 || 设置.最高等级 == '') {
          实际最高等级 = 实际最低等级;
        }
        // 先判断在不在等级（不含加号的）范围内
        if (
          (Number.parseInt(等级) >= Number.parseInt(实际最低等级))
          && (Number.parseInt(等级) <= Number.parseInt(实际最高等级))
        ) {
          // 在就 true
          结果 = true;
        }

        // 再检查下边界
        // 如果等于最低等级，就检查下要不要加号
        if (Number.parseInt(等级) == Number.parseInt(实际最低等级)) {
          if (设置.最低等级带加号) {
            if (等级 == 实际最低等级) {
              结果 = true;
            } else {
              结果 = false;
            }
          }
        }
        // 最高等级就另一种判定
        if (Number.parseInt(等级) == Number.parseInt(实际最高等级)) {
          if (!设置.最高等级带加号) {
            if (等级 == 实际最高等级) {
              结果 = true;
            } else {
              结果 = false;
            }
          }
        }
        // 最后返回结果
        return 结果;
      }

      let 符合条件的难度 = [];

      // 判断这首歌的每个难度对应的等级在不在范围内
      for (const [难度, 等级] of Object.entries(抽到的歌.等级)) {
        //console.log('aaa', 难度, 等级)
        if (筛选等级(等级)) {
          符合条件的难度.push(难度);
        }
      }
      console.log('符合条件的难度', 符合条件的难度)
      // 随机 Roll 个难度
      shuffleArray(符合条件的难度);
      要展示的难度 = 符合条件的难度[0];
      //#endregion
      // 堆完屎了
    } else {
      // 指定难度了不就直接展示了
      要展示的难度 = 设置.难度;
    }

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