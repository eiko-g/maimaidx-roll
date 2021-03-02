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
      'maimaidxplus': 'maimaiDX+ 日版',
      'maimaidxCN': '舞萌DX ver.CH-1.01E',
      'test': '测试用'
    },
    分类名 = {
      'pops_anime': '动画 & 流行',
      'niconico': 'nico & V家',
      'toho': '东方 Project',
      'variety': '综艺曲目', // 还是想翻译成 游戏 & 联动 来着
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
  载入歌单('maimaidxCN', 2021030101);
  载入歌单('test', 1111);
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
    // 开始计时
    console.time('筛歌');
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
    //#endregion

    // 预览歌单
    console.log('筛选后歌单：', 抽奖歌单);

    if (抽奖歌单.length == 0) {
      // alert('抽选歌单为空，请检查筛选条件。');
      console.warn('抽选歌单为空，请检查筛选条件。');
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
    getEl('#setting-lv').textContent = `[${难度名[设置.难度]}]` + 等级文字.最低等级 + 等级文字.最高等级;
    getEl('#setting-songlist').textContent = 歌单名[设置.歌单];

    // 隐藏设置框
    getEl('.option-main')[0].classList.remove('show');
    // 使抽歌按钮可用
    Roll歌按钮.removeAttribute('disabled');
    // 计时结束
    console.timeEnd('筛歌');
    // 禁掉默认的提交动作
    event.preventDefault();
    return false;
  });
  //#endregion
});
// 载入完力
console.log('script.js 已载入');