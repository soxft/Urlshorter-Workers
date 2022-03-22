const config = {
    passwd: 'default', // set request password
}

const response_header = {
    "content-type": "text/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
}

async function randomStr(len) {
    len = len || 4;
    let _chars = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
    let result = '';
    for (i = 0; i < len; i++) {
        result += _chars.charAt(Math.floor(Math.random() * _chars.length));
    }
    return result;
}

async function md5(url) {
    const url_digest = await crypto.subtle.digest({
        name: "MD5"
    }, new TextEncoder().encode(url))
    const hashArray = Array.from(new Uint8Array(url_digest))
    return hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function checkUrl(url) {
    let objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
    if (objExp.test(url) == true) {
        return true;
    } else {
        return false;
    }
}

async function get_short_from_url(url_md5) {
    let res = await LINKS.get(url_md5)
    if (res == null) return false
    return res
}

async function save_url(url) {
    random_key = await randomStr()
    let status;

    let is_exist = await LINKS.get(random_key)
    if (is_exist == null) {
        // try to read cache from KV
        let url_md5 = await md5(url)
        let short = await get_short_from_url(url_md5)
        if (short) {
            status = true
            random_key = short
        } else {
            status = await LINKS.put(random_key, url);
            await LINKS.put(url_md5, random_key)
        }

        return status, random_key
    } else if (key == null) {
        save_url(url)
    }
}

async function handler(request) {
    let request_method = request.method;

    if (request_method == "GET") {
        const requestURL = new URL(request.url)
        const short_url = requestURL.pathname.split("/")[1]

        if (short_url == '') {
            return new Response(JSON.stringify({
                'code': -1,
                'msg': '404 not fond',
                'short': ''
            }), {
                headers: response_header,
                status: 404
            })
        }
        // get raw url from KV
        if (links = await LINKS.get(short_url)) return Response.redirect(links, 302)

        return new Response(JSON.stringify({
            'code': -2,
            'msg': '404 not fond',
            'short': ''
        }), {
            headers: response_header,
            status: 404
        })
    } else if (request_method === "POST") {
        // create uri
        let req

        try {
            req = await request.json()
        } catch (error) {
            return new Response(JSON.stringify({
                'code': -6,
                'msg': 'Invalid Request',
                'short': ''
            }), {
                headers: response_header,
                status: 500
            })
        }

        let url = req.url || '',
            passwd = req.passwd || '',
            status,
            short

        if (!await checkUrl(url)) {
            return new Response(JSON.stringify({
                'code': -3,
                'msg': 'Invalid Url',
                'short': ''
            }), {
                headers: response_header,
            })
        }

        if (passwd !== config.passwd) {
            return new Response(JSON.stringify({
                'code': -4,
                'msg': 'Permission Deniend',
                'short': ''
            }), {
                headers: response_header,
            })
        }

        status, short = await save_url(url)

        // check save status
        if (typeof (status) == "undefined") {
            return new Response(JSON.stringify({
                "code": 0,
                "msg": "ok",
                "short": short
            }), {
                headers: response_header,
            })
        } else {
            return new Response(JSON.stringify({
                'code': -5,
                'msg': 'Server Error',
                'short': ''
            }), {
                headers: response_header,
                status: 500
            })
        }
    } else if (request_method === "OPTIONS") { // preflight
        return new Response(``, {
            headers: response_header,
            status: 204
        })
    }
}

addEventListener("fetch", async event => {
    event.respondWith(handler(event.request))
})