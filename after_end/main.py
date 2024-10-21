from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import string
import random
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from datetime import datetime
import base64


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 用于生成短链接的字符集
characters = string.ascii_letters + string.digits

# 短链接的基础URL（这里假设我们的服务运行在 localhost:8000）
BASE_URL = "http://localhost:8000/"


class Item(BaseModel):
    url: str
    custom_path: str = None


def generate_short_code():
    """生成6位随机字符的短链接代码"""
    return ''.join(random.choice(characters) for _ in range(6))

def encode_url(url):
    """使用base64编码URL"""
    return base64.urlsafe_b64encode(url.encode()).decode()

def decode_url(encoded_url):
    """使用base64解码URL"""
    return base64.urlsafe_b64decode(encoded_url.encode()).decode()

def connect_db(sql, args):
    conn = sqlite3.connect('SQLite.db')
    c = conn.cursor()
    c.execute(sql, args)
    return c,conn


@app.post("/shorten")
def shorten_url(item: Item):
    """将长链接转换为短链接"""
    try:
        encoded_url = encode_url(item.url)
        c,conn = connect_db("SELECT short_link FROM 'chained_record' WHERE long_link = ?", (encoded_url,))
        existing = c.fetchone()
        
        # 用户指定了自定义路径
        if item.custom_path:
            c.execute("SELECT * FROM 'chained_record' WHERE short_link = ?", (item.custom_path,))
            if c.fetchone():
                conn.close()
                return JSONResponse({"status": 1, "msg": "自定义路径已存在，请重新输入", "data": None}, status_code=200)
            short_code = item.custom_path

        else:
            short_code = generate_short_code()
            while True:
                c.execute("SELECT * FROM 'chained_record' WHERE short_link = ?", (short_code,))
                if not c.fetchone():
                    break
                short_code = generate_short_code()

        # 如果已经存在相同的长链接，则直接返回已有的短链接
        if existing:
            conn.close()
            return JSONResponse({"status": 0, "msg": "该链接已存在，为您自动分配", "data": {"short_url": f"{BASE_URL}{existing[0]}"}})

        # 将短链接和长链接存入数据库        
        create_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        c.execute("INSERT INTO 'chained_record' (short_link, long_link, create_time) VALUES (?, ?, ?)", 
                  (short_code, encoded_url, create_time))
        conn.commit()
        conn.close()

        return JSONResponse({"status": 0, "msg": "添加成功", "data": {"short_url": f"{BASE_URL}{short_code}"}})
    except Exception as e:
        return JSONResponse({"status": 1, "msg": str(e), "data": None}, status_code=500)

@app.get("/expand")
def expand_url(short_url: str):
    """将短链接解析为原始长链接"""
    try:
        short_code = short_url.replace(BASE_URL, "")
        c,conn = connect_db("SELECT long_link FROM 'chained_record' WHERE short_link = ?", (short_code,))
        result = c.fetchone()
        conn.close()

        if not result:
            return JSONResponse({"status": 1, "msg": "未查询到短链接", "data": None}, status_code=404)
        
        original_url = decode_url(result[0])
        return JSONResponse({"status": 0, "msg": "查询成功", "data": {"long_url": original_url}})
    except Exception as e:
        return JSONResponse({"status": 1, "msg": str(e), "data": None}, status_code=500)

@app.get("/{short_code}")
def redirect_to_long_url(short_code: str):
    """处理短链接重定向"""
    c,conn = connect_db("SELECT long_link FROM 'chained_record' WHERE short_link = ?", (short_code,))
    result = c.fetchone()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    original_url = decode_url(result[0])
    return RedirectResponse(original_url)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)