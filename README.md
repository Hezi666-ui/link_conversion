# link_conversion

# 链接转换

### 使用fastapi和amis实现关于长链接与短链接的自动转换，能够将长链接转换并且解析，并将解析后的数据使用base64编码存入SQLite数据库中。数据库只建立了一个表，并没有进行用户的交互，你可以加一个用户的功能，每个用户能够自己转换的链接。

## 整体模块分为两个模块，分别是生成短链接和解析短链接。

![生成短链接](https://github.com/Hezi666-ui/link_conversion/blob/main/image/%E7%94%9F%E6%88%90.png "生成短链接")


![解析短链接](https://github.com/Hezi666-ui/link_conversion/blob/main/image/%E8%A7%A3%E6%9E%90.png "解析短链接")


## 如果你要运行项目，请下载整个模块，其中after_end为后端，front_end为前端，请确保你的环境中有python和node.js，没有请先自行安装。


## 关于后端启动，先进入after_end，接着输入：

```python

python main.py

```

## 关于前端其中，先进入front_end，接着输入：

```javascript

npm i

npm run start

```

