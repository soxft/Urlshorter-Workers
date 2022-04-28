# Urlshorter-Workers

> A simple urlshorter based on cloudflare worerks

# Useage

1. 在Cloudflare创建一个 `KV`  及 `Workers`
2. 修改`Workers`的变量, 将`KV 命名空间绑定` 中 `LINKS` 指向 1 中创建的KV
3. 将 `index.js` 中`config`对象的`passwd`修改为 您的密码
4. 上传`index.js` 至您的workers

# Api

> POST /

**请求试例**
```json
{
    "url": "https://baidu.com",
    "passwd": "default"
}
```

**期待返回**
```json
{
    "code": 0,
    "msg": "ok",
    "short": "abcd"
}
```

# 参考

 - [xyTom/Url-Shorten-Worker](https://github.com/xyTom/Url-Shorten-Worker)
