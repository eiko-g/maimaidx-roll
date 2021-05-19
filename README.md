# maimaiDX Roll 歌网页

毕竟 maimaiDX 删了随机选歌功能，所以就自己写了个来用。

[点击试用](https://roll.maimoe.in/maimai)

---

## 关于随机算法

使用的 [洗牌算法](https://www.zhihu.com/question/68330851)，尽量避免了浏览器自带随机数不够随机的问题。还顺便写了个小测试，就是 `roll-test` 文件夹里的东西，大家可以来试试。

---

## 安装环境与构建

先安装 [node.js](https://nodejs.org)，然后进入文件夹，输入命令：

```bash
npm i
```

开发时：

```bash
gulp
```

构建：

```bash
gulp build
```

FTP 上传：

```bash
gulp upload
```

嗯，KPI++。

---

## To do

- [x] 歌曲分类选择
- [x] 多选等级范围
- [x] 弄一份当前版本等级的数据，避免造成混乱
- [x] 改改样式
- [x] 多选难度分类（不咕不咕）
- [ ] 可选标准谱和 DX 谱

~~难度多选好像没啥必要，比如比赛时抽歌需要紫谱白谱，选个 All 就够了吧，Roll 到红谱就重抽。懒逼发言~~

---

## 歌单数据 Excel

舞萌DX 2021：[OneDrive 链接](https://1drv.ms/x/s!ArePsgkuEqXhqmnLl0QyCovF9Sq1?e=amxLw2)

阔以的话帮我抓抓虫，谢谢大佬们。

---

## 资料来源

- [maimai fc2 wiki](https://maimai.wiki.fc2.com/)
- [maimaiDX Offcial](https://maimai.sega.jp/song/)
- [maimai 中文维基](https://maimai.fandom.com/zh/wiki/Maimai%E4%B8%AD%E6%96%87_%E7%BB%B4%E5%9F%BA)

---

## 使用场景
~~其实是阴间歌比赛现场~~
- [舞萌DX周年百店推广赛 女子组（东莞长安万科城市英雄店）](https://www.bilibili.com/video/BV1DV411t7zi)
- [舞萌DX周年百店推广赛 男子组（东莞国贸环游嘉年华）](https://www.bilibili.com/video/BV17y4y1n7Vs)
- 其他可以看 Sam 的录播或者直播，直播比较有意思，我可以远程发功影响抽歌结果\[doge\]
- 也欢迎其他比赛用我这网页抽歌玩，节目效果++

---

## License
- 封面及部分素材归 &copy;SEGA 及原作者所有
- 我写的代码部分为 WTFPL