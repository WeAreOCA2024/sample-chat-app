Docker 起動
初めて動かす人
docker compose up --build

2回目以降
エラーなどをターミナルに表示したい人用(DockerのImageが増えるから適度に消してね)
docker compose up --build

エラーは見えないけどImage(None)を増やしたくない人用
docker compose up -d

PostgreSQLを直接触りたい人用
docker compose exec db bash
psql mydatabase myuser

実際の画面にアクセス
next.js
localhost:3000/
Go
localhost:8080/捜査したい内容

Docker 停止
docker compose stop
