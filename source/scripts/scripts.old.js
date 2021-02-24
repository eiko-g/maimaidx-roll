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
  // 载入歌单('maimaidxplus', 1);
  //#endregion
  let
    Roll歌按钮 = getEl('#roll-button'),
    收歌按钮 = getEl('#random-roll');
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
      表单数据 = new FormData(this);
    console.log('表单数据：', 表单数据);

    // 清空一下设置，不然会有残留
    设置 = {};
    for (let [key, value] of 表单数据.entries()) {
      设置[key] = value;
    }
    getEl('.option-main')[0].classList.remove('show');
    Roll歌按钮.removeAttribute('disabled');

    console.log('设置：', 设置);

    let 等级文字 = {};
    if (设置.最低等级带加号) {
      等级文字.最低等级 = `${设置.最低等级}+`;
    } else {
      等级文字.最低等级 = `${设置.最低等级}`;
    }

    if (设置.最高等级) {
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

    // 筛选歌曲
    抽奖歌单 = 载入的JSON[设置.歌单].曲目列表;
    console.log('筛选前的抽奖歌单：', 抽奖歌单);
    function 筛选歌单(歌曲) {
      // 筛歌过程提取出来
      function 筛歌过程(此歌等级) {
        let result = false;
        if (
          (Number.parseInt(此歌等级) >= Number.parseInt(lv_min))
          && (Number.parseInt(此歌等级) <= Number.parseInt(lv_max))
        ) {
          // 就给过
          result = true;

          // 再检查下边界
          // 如果等于最低等级，就检查下要不要加号
          if (Number.parseInt(此歌等级) == Number.parseInt(lv_min)) {
            if (设置.最低等级带加号) {
              if (此歌等级 == lv_min) {
                result = true;
              } else {
                result = false;
              }
            }
          }
          // 最高等级就另一种判定
          if (Number.parseInt(此歌等级) == Number.parseInt(lv_max)) {
            if (!设置.最高等级带加号) {
              if (此歌等级 == lv_max) {
                result = true;
              } else {
                result = false;
              }
            }
          }
        }
        return result;
      }
      let
        result = false,
        lv_min = 设置.最低等级,
        lv_max = 设置.最高等级,
        songLv = Object.values(歌曲.等级),
        min_plus = false,
        max_plus = false;
      // console.log('歌曲：', 歌曲);
      if (设置.最低等级带加号) {
        lv_min = lv_min + '+';
        min_plus = true;
      }
      if (设置.最高等级带加号) {
        lv_max = lv_max + '+';
        max_plus = true;
      }
      // 如果没写最高等级的话
      // 或者两边设置一样的话！
      if ((!设置.最高等级) || (lv_min == lv_max)) {
        // 如果全难度的话
        if (设置.难度 == 'all') {
          // 这首歌的某个难度等于设置的最低难度
          songLv.some((此歌等级) => {
            if (此歌等级 == lv_min) {
              result = true;
            }
          });
        } else {
          // 如果设置了难度就看那个难度就行了
          if (歌曲.等级[设置.难度] == lv_min) {
            result = true;
          }
        }
      } else {
        // 如果写了最高难度的话
        // 如果最低难度大于最高难度的话，使用了 JavaScript 的隐式转换判定
        if (lv_min > lv_max) {
          //alert('难度设置有误，请重新检查。');
        } else {
          // 如果是全难度
          if (设置.难度 == 'all') {
            // 看看这首歌中的某个难度符不符合要求
            songLv.some((此歌等级) => {
              // 如果这首歌的这个难度在难度区间内
              // 但是不知道为啥筛歌过程在这里炸了，以后再研究
              if (
                (Number.parseInt(此歌等级) >= Number.parseInt(lv_min))
                && (Number.parseInt(此歌等级) <= Number.parseInt(lv_max))
              ) {
                // 就给过
                result = true;

                // 再检查下边界
                // 如果等于最低等级，就检查下要不要加号
                if (Number.parseInt(此歌等级) == Number.parseInt(lv_min)) {
                  if (设置.最低等级带加号) {
                    if (此歌等级 == lv_min) {
                      result = true;
                    } else {
                      result = false;
                    }
                  }
                }
                // 最高等级就另一种判定
                if (Number.parseInt(此歌等级) == Number.parseInt(lv_max)) {
                  if (!设置.最高等级带加号) {
                    if (此歌等级 == lv_max) {
                      result = true;
                    } else {
                      result = false;
                    }
                  }
                }
              }
            })
          } else {
            let 此歌等级 = 歌曲.等级[设置.难度];
            // 如果指定了等级
            result = 筛歌过程(此歌等级);
          }
        }
      }

      return result;
    }
    抽奖歌单 = 抽奖歌单.filter(筛选歌单);
    // 打乱一下歌单，避免浏览器的伪随机影响
    shuffleArray(抽奖歌单);
    console.log('筛选后的抽奖歌单：', 抽奖歌单);

    // 测试用
    window.aaa = 抽奖歌单;

    if (抽奖歌单.length == 0) {
      alert('抽选歌单为空，请检查筛选条件。');
    }

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
  function getKeysByValue(object, value) {
    return Object.keys(object).filter(key => object[key] === value);
  }

  function 展示内容(抽到的歌) {
    getEl('#title').textContent = 抽到的歌.曲名;
    getEl('#category').textContent = 分类名[抽到的歌.分类];
    getEl('#type').textContent = 抽到的歌.类型;
    if (抽到的歌.封面 && (抽到的歌.封面 != '')) {
      getEl('#cover').setAttribute('src', `./static/img/cover/${抽到的歌.分类}/${抽到的歌.封面}.jpg`);
    } else {
      getEl('#cover').setAttribute('src', './static/img/nocover.png');
    }
    getEl('#table-lv-num-B').textContent = 抽到的歌.等级.B;
    getEl('#table-lv-num-A').textContent = 抽到的歌.等级.A;
    getEl('#table-lv-num-E').textContent = 抽到的歌.等级.E;
    getEl('#table-lv-num-M').textContent = 抽到的歌.等级.M;
    getEl('#table-lv-num-R').textContent = 抽到的歌.等级.R;
  }

  Roll歌按钮.addEventListener('click', () => {
    console.log('Roll!');
    let
      随机数 = 抽取(0, 抽奖歌单.length - 1),
      抽到的歌 = 抽奖歌单[随机数],
      要展示的难度;
    console.log(抽到的歌);
    展示内容(抽到的歌);

    // 想办法弄出抽的是哪个难度
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

      let 重复等级的难度 = [];

      // 判断这首歌的每个难度对应的等级在不在范围内
      for (const [难度, 等级] of Object.entries(抽到的歌.等级)) {
        //console.log('aaa', 难度, 等级)
        if (筛选等级(等级)) {
          重复等级的难度.push(难度);
        }
      }
      //console.log('重复等级的难度', 重复等级的难度)
      // 随机 Roll 个难度
      shuffleArray(重复等级的难度);
      要展示的难度 = 重复等级的难度[0];
      //#endregion
      // 堆完屎了
    } else {
      // 指定难度了不就直接展示了
      要展示的难度 = 设置.难度;
    }


    getEl('#table-lv-num-B').classList.remove('current');
    getEl('#table-lv-num-A').classList.remove('current');
    getEl('#table-lv-num-E').classList.remove('current');
    getEl('#table-lv-num-M').classList.remove('current');
    getEl('#table-lv-num-R').classList.remove('current');
    if ((要展示的难度) && (要展示的难度.length != 0)) {
      console.log('最终展示的难度：', 要展示的难度);
      getEl(`#table-lv-num-${要展示的难度}`).classList.add('current');
    }

    // 每次抽完都要打乱歌单
    shuffleArray(抽奖歌单);
    console.log('重新随机的歌单：', 抽奖歌单);
    // 测试用
    window.aaa = 抽奖歌单;
  });

  // 今天收什么呢？
  let 收歌歌单CN = [];
  收歌按钮.addEventListener('click', () => {
    console.log('今天一定收！');
    if (收歌歌单CN.length == 0) {
      收歌歌单CN = 载入的JSON['maimaidxCN'].曲目列表;
    }
    shuffleArray(收歌歌单CN);
    let
      随机数 = 抽取(0, 收歌歌单CN.length - 1),
      抽到的歌 = 收歌歌单CN[随机数];
    console.log(抽到的歌);
    展示内容(抽到的歌);

    getEl('#table-lv-num-B').classList.remove('current');
    getEl('#table-lv-num-A').classList.remove('current');
    getEl('#table-lv-num-E').classList.remove('current');
    getEl('#table-lv-num-M').classList.remove('current');
    getEl('#table-lv-num-R').classList.remove('current');
  });
});
