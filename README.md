## 项目介绍

该项目是一个前后端分离的博客系统，前端使用 React + antdm，后端使用 Express 框架 + MongoDB 进行开发，使用 JWT 做权限验证，使用 bcrypt 对密码加密。

- 博客为单用户设计，功能上满足基本的文章，分类及评论
- 博客是我个人进行开发的，主要还是满足自己的学习需求，如果要长期使用，建议采用 wordperss、hexo 这类主流博客

## 项目地址

- 后端：[https://github.com/hchenzi/blog-api](https://Github.com/hchenzi/blog-api)
- 前端：[https://github.com/hchenzi/blog-web](https://Github.com/hchenzi/blog-web)
- 演示地址：http://hcz1120.cn:20222

## 注意点

1. blog-api 目录下需新建`.env`文件，添加以下变量：
   - PORT：博客后台所运行的端口
   - MongoDB_URI：MongoDB 的连接地址
   - JWT_SECRET：JWT 的加密/解密密钥，可输入任意字符串
2. 建议使用 pm2 部署
3. 初次使用时，需手动进入`/init`目录设置站点名称及用户名密码

## 网站截图

![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_7QJ6wz898V.png)
![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_W3XuQateru.png)
![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_f6hSJdB4jY.png)
![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_jT6q0lLX25.png)
![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_lGnDv6cXai.png)
![](https://share-1252784048.cos.ap-shanghai.myqcloud.com/share/2022/07/chrome_txEZK8y6Ia.png)
