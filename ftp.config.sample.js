module.exports = () => {
    return {
        // FTP 服务器地址
        host: 'your-ftp.site',
        // FTP 账号
        user: 'you',
        // FTP 密码
        password: 'pass',
        // 线程数
        parallel: 10,
        // 端口
        port: 21,
        // 服务器端的目录，比如这会传到你那边的 /maimai 目录
        // 访问网站时需访问 //你的网页.web/maimai 才是这个抽歌页面
        webDir: '/maimai'
    }
}