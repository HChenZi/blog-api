# Blog-Api

## 项目介绍

后端部分主要采用Node.js、Express框架、MongoDB进行开发。

## 安装

1. 安装 nginx，MongoDB，Node.js
2. 更换 npm 源（可选）
3. 克隆blog-api项目
   
4. 进入项目目录，执行npm -i
5. 修改 nginx 配置文件

## 使用

1. 在项目根目录新建`.env`文件，添加以下变量：
   - PORT：博客后台所运行的端口
   - MONGODB_URI：MongoDB的连接地址
   - JWT_SECRET：JWT的加密/解密密钥，可输入任意字符串
2. 启动nginx及MongoDB
3. npm start 启动项目
