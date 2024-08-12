Docker 起動
初めて動かす人
docker compose up --build

2回目以降
ログをターミナルに表示したい人用(DockerのImageが増えるから適度に消してね)
docker compose up

ログを見たくない人用
docker compose up -d

PostgreSQLを直接触りたい人用
docker compose exec db bash
psql mydatabase myuser

実際の画面にアクセス
next.js
localhost:3000/
Go
localhost:8080/操作したい内容

Docker 停止
docker compose stop
