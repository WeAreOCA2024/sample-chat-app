FROM golang:latest

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./

RUN go mod download

RUN go get github.com/gin-contrib/cors

COPY . .

RUN go mod tidy

EXPOSE 8080

CMD ["air"]