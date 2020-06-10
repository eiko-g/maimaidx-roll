"use strict";
console.log('script.js 已载入');
let 临时输出;
$(document).ready(function () {
    let
        载入次数 = 0,
        载入的JSON = [],
        歌单 = [],
        选项 = {},
        难度文字 = {
            'easy': '梅',
            'normal': '竹',
            'hard': '松',
            'oni': '鬼'
        },
        歌单名字 = {
            'taiko14old': '旧框14旧基准',
            'taiko14new': '旧框14【新】基准',
            'taikomomoiroSP': '摸摸衣裸SP',
            'taikoRedSP': '红SP'
        };
    function 载入歌单(文件名, 版本 = 1) {
        $.ajax({
            type: "GET",
            url: "./data/" + 文件名 + ".json?ver=" + 版本,
            dataType: "json",
        }).done(
            function (响应) {
                console.log(响应);
                载入的JSON[文件名] = 响应;
                console.log(载入的JSON);
            }
        ).fail(
            // 万一网不好或者被劫持就重新加载一下
            function () {
                if (载入次数 < 10) {
                    载入次数++;
                    载入歌单(文件名, 版本);
                    console.log('载入文件失败：' + 文件名 + '（' + 版本 + '），失败次数：' + 载入次数);
                } else {
                    alert(文件名 + '.json' + '（' + 版本 + '）' + '载入失败次数过多，请刷新页面重试');
                    载入次数 = 0;
                }
            }
        );
    };
    载入歌单('taiko14old', 1);
    载入歌单('taiko14new', 1);
    载入歌单('taikomomoiroSP', 20191130);
    载入歌单('taikoRedSP', 2020010901);
    // 载入歌单('error', 123);

    //#region 设置相关
    // 点击展示设置框
    $(document).on('click', '#option-button', function () {
        $('.option-main').addClass('show');
    });
    // 设置框点击提交动作
    $(document).on('submit', '#option-form', function () {
        // 获取表单数据
        let 表单数据 = $(this).serializeArray();
        console.log('表单数据：', 表单数据);
        表单数据.forEach(function (项目) {
            选项[项目.name] = 项目.value;
        })
        console.log('选项：', 选项);

        // 修改显示内容
        $('#option-show-difficulty').text(难度文字[选项.抽取难度]);
        $('#option-show-level-num-min').text(选项.最低等级);
        $('#option-show-level-num-max').text(选项.最高等级);
        $('#option-show-songlist').text(歌单名字[选项.已选歌单]);

        // 处理歌单
        歌单 = 载入的JSON[选项.已选歌单].songList;
        console.log('筛选前歌单：', 歌单);
        function 筛选歌曲(歌曲) {
            return 歌曲.level[选项.抽取难度] >= 选项.最低等级 && 歌曲.level[选项.抽取难度] <= 选项.最高等级;
        }
        歌单 = 歌单.filter(筛选歌曲);
        console.log('筛选后歌单：', 歌单);

        // 关闭设置框
        $('.option-main').removeClass('show');
        $('#roll-button').prop('disabled', false);
        return false;
    });
    //#endregion 设置相关

    //#region 抽奖相关
    function 抽取(最小值, 最大值) {
        let 抽取数 = 最大值 - 最小值 + 1;
        return Math.floor(Math.random() * 抽取数 + 最小值);
    }
    // 抽！
    $(document).on('click', '#roll-button', function () {
        // 先禁了防止鼠标双击或者手抖
        $('#roll-button').prop('disabled', true);
        let A = 0;
        function 抽取歌曲() {
            let 随机数, 抽到的歌;
            随机数 = 抽取(0, 歌单.length - 1);
            抽到的歌 = 歌单[随机数];
            console.log(抽到的歌);

            // 显示歌曲内容
            $('#result-name').text(抽到的歌.name);
            $('#result-name-cn').text(抽到的歌.name_cn);
            $('#result-category').text(抽到的歌.category);
            $('#result-level-name').text(难度文字[选项.抽取难度]);
            $('#result-level-num').text(抽到的歌.level[选项.抽取难度]);

            // 抽完之后把按钮还原
            A++;
            console.log('A:', A);
            if (A > 50) {
                $('#roll-button').prop('disabled', false);
                A = 0;
            }
        }
        for (let a = 0; a <= 50; a++) {
            setTimeout(抽取歌曲, 50 * a);
        }
    });
    //#endregion 抽奖相关
});