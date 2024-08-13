package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Pass string `json:"pass"`
}

type Chat struct {
	ID            int    `json:"id"`
	From          int    `json:"from_pid"`
	To            int    `json:"to_pid"`
	From_userid   int    `json:"from_userid"`
	To_userid     int    `json:"to_userid"`
	Msg           string `json:"msg"`
	Time          string `json:"time"`
	Delete_from   bool   `json:"delete_from"`
	Delete_to     bool   `json:"delete_to"`
	From_reaction int    `json:"from_reaction"`
	To_reaction   int    `json:"to_reaction"`
}

type Profile struct {
	ID     int    `json:"id"`
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
}

type Friend struct {
	ID        int    `json:"id"`
	User1_id  int    `json:"user1_id"`
	User2_id  int    `json:"user2_id"`
	User1_pid int    `json:"user1_pid"`
	User2_pid int    `json:"user2_pid"`
	Time      string `json:"time"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			return
		}
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Printf("Error writing message: %v", err)
			return
		}
	}
}

func main() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	r.Use(cors.New(config))

	// DB connection
	dsn := "postgres://myuser:mypassword@db:5432/mydatabase?sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// WebSocket endpoint
	r.GET("/ws", func(c *gin.Context) {
		fmt.Print("WebSocket connection")
		handleWebSocket(c)
	})
	// get all users
	r.GET("/get/users", func(c *gin.Context) {
		users := getAllUsers(db)
		c.JSON(http.StatusOK, users)
	})

	// get user by name
	r.GET("/get/user/:name", func(c *gin.Context) {
		name := c.Param("name")
		users := getUserByName(db, name)
		c.JSON(http.StatusOK, users)
	})

	// get my profile by name
	r.GET("/get/profile/:name", func(c *gin.Context) {
		name := c.Param("name")
		myId := getUserByName(db, name)[0].ID
		myProfile := getMyProfileById(db, myId)
		c.JSON(http.StatusOK, myProfile)
	})
	// get profile by pid
	r.GET("/get/profile/pid/:pid", func(c *gin.Context) {
		pid := c.Param("pid")
		id, _ := strconv.Atoi(pid)
		profile := getProfileByPid(db, id)
		c.JSON(http.StatusOK, profile)
	})

	// get Friend Profile by name
	r.GET("/get/friend/profile/:name", func(c *gin.Context) {
		name := c.Param("name")
		friendProfile := getFriendProfileById(db, name)
		c.JSON(http.StatusOK, friendProfile)
	})

	// get friend profile by pid
	r.GET("/get/friend/profile/id/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		friendProfile := getFriendProfileByProfileId(db, id)
		c.JSON(http.StatusOK, friendProfile)
	})

	// get chat log by name
	r.GET("/get/chat/:myid/:friendid", func(c *gin.Context) {
		myid, _ := strconv.Atoi(c.Param("myid"))
		friendid, _ := strconv.Atoi(c.Param("friendid"))
		chatLog := getChatLog(db, myid, friendid)
		c.JSON(http.StatusOK, chatLog)
	})

	// post chat log by my profile id and friend profile id
	r.POST("/post/chat/:myid/:friendid", func(c *gin.Context) {
		strMyProfileId := c.Param("myid")
		strFriendProfileId := c.Param("friendid")
		myProfileId, _ := strconv.Atoi(strMyProfileId)
		friendProfileId, _ := strconv.Atoi(strFriendProfileId)
		friend := getFriend(db, myProfileId, friendProfileId)
		var msg struct {
			Message string `json:"message"`
		}
		if err := c.BindJSON(&msg); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if friend[0].User1_pid == myProfileId {
			postChatLog(db, myProfileId, friendProfileId, friend[0].User1_id, friend[0].User2_id, msg.Message)
		} else {
			postChatLog(db, myProfileId, friendProfileId, friend[0].User2_id, friend[0].User1_id, msg.Message)
		}
	})

	// edit chat log by chat log id
	r.PUT("/edit/chat/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		var msg struct {
			Message string `json:"message"`
		}
		if err := c.BindJSON(&msg); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		putChatLog(db, id, msg.Message)
	})

	// delete chat log by chat log id
	r.DELETE("/delete/chat/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		deleteChatLog(db, id)
	})

	// delete chat log from my screen
	r.PUT("/delete/chat/:id/:profileid/:senderid", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		profileid, _ := strconv.Atoi(c.Param("profileid"))
		senderid, _ := strconv.Atoi(c.Param("senderid"))
		if profileid == senderid {
			deleteChatLogFromMyScreen(db, id, "from")
		} else {
			deleteChatLogFromMyScreen(db, id, "to")
		}
	})

	// restore chat log to my screen
	r.PUT("/restore/chat/:id/:profileid/:senderid", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		profileid, _ := strconv.Atoi(c.Param("profileid"))
		senderid, _ := strconv.Atoi(c.Param("senderid"))
		if profileid == senderid {
			restoreChatLogToMyScreen(db, id, "from")
		} else {
			restoreChatLogToMyScreen(db, id, "to")
		}
	})

	port := ":8080"
	r.Run(port)
}

func getAllUsers(db *sql.DB) []User {
	rows, err := db.Query("SELECT * FROM users")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Pass); err != nil {
			return nil
		}
		users = append(users, user)
	}
	return users
}

func getUserByName(db *sql.DB, name string) []User {
	rows, err := db.Query("SELECT * FROM users WHERE uname=$1", name)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Pass); err != nil {
			return nil
		}
		users = append(users, user)
	}
	return users
}

func getMyProfileById(db *sql.DB, id int) []Profile {
	rows, err := db.Query("SELECT * FROM profile WHERE user_id=$1", id)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var profile Profile
		if err := rows.Scan(&profile.ID, &profile.UserID, &profile.Name); err != nil {
			return nil
		}
		profiles = append(profiles, profile)
	}
	return profiles
}

func getProfileByPid(db *sql.DB, pid int) []Profile {
	rows, err := db.Query("SELECT * FROM profile WHERE id=$1", pid)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var profile Profile
		if err := rows.Scan(&profile.ID, &profile.UserID, &profile.Name); err != nil {
			return nil
		}
		profiles = append(profiles, profile)
	}
	return profiles
}

func getFriendProfileById(db *sql.DB, name string) []Friend {
	rows, err := db.Query("SELECT * FROM friends WHERE user1_id IN (select id from users where uname=$1) or user2_id IN (select id from users where uname=$1)", name)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var profiles []Friend
	for rows.Next() {
		var profile Friend
		if err := rows.Scan(&profile.ID, &profile.User1_id, &profile.User2_id, &profile.User1_pid, &profile.User2_pid, &profile.Time); err != nil {
			return nil
		}
		profiles = append(profiles, profile)
	}
	return profiles
}
func getFriendProfileByProfileId(db *sql.DB, id int) []Friend {
	rows, err := db.Query("SELECT * FROM friends WHERE user1_pid=$1 or user2_pid=$1", id)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var profiles []Friend
	for rows.Next() {
		var profile Friend
		if err := rows.Scan(&profile.ID, &profile.User1_id, &profile.User2_id, &profile.User1_pid, &profile.User2_pid, &profile.Time); err != nil {
			return nil
		}
		profiles = append(profiles, profile)
	}
	return profiles
}

// get friend by my profile id and friend profile id
func getFriend(db *sql.DB, myid int, friendid int) []Friend {

	rows, err := db.Query("SELECT * FROM friends WHERE (user1_pid=$1 and user2_pid=$2) or (user1_pid=$2 and user2_pid=$1)", myid, friendid)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var friends []Friend
	for rows.Next() {
		var friend Friend
		if err := rows.Scan(&friend.ID, &friend.User1_id, &friend.User2_id, &friend.User1_pid, &friend.User2_pid, &friend.Time); err != nil {
			return nil
		}
		friends = append(friends, friend)
	}
	return friends
}

// get chat log by my id and friend profile id
func getChatLog(db *sql.DB, myid int, friendid int) []Chat {
	rows, err := db.Query("SELECT * FROM chatlog WHERE (from_userid=$1 and to_pid=$2) or (from_pid=$2 and to_userid=$1) ORDER BY time DESC ", myid, friendid)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var chats []Chat
	for rows.Next() {
		var chat Chat
		if err := rows.Scan(&chat.ID, &chat.From, &chat.To, &chat.From_userid, &chat.To_userid, &chat.Msg, &chat.Time, &chat.Delete_from, &chat.Delete_to, &chat.From_reaction, &chat.To_reaction); err != nil {
			return nil
		}
		chats = append(chats, chat)
	}
	return chats
}

// post chat log
func postChatLog(db *sql.DB, myProfileId int, FriendProfileId int, myId int, friendId int, msg string) {
	_, err := db.Exec("INSERT INTO chatlog (from_pid, to_pid, from_userid, to_userid, msg) VALUES ($1, $2, $3, $4, $5)", myProfileId, FriendProfileId, myId, friendId, msg)
	if err != nil {
		log.Fatalf("Failed to insert chat log: %v", err)
	}
}

// put chat log
func putChatLog(db *sql.DB, id int, msg string) {
	_, err := db.Exec("UPDATE chatlog SET msg=$1 WHERE id=$2", msg, id)
	if err != nil {
		log.Fatalf("Failed to update chat log: %v", err)
	}
}

// delete chat log
func deleteChatLog(db *sql.DB, id int) {
	_, err := db.Exec("DELETE FROM chatlog WHERE id=$1", id)
	if err != nil {
		log.Fatalf("Failed to delete chat log: %v", err)
	}
}

// delete chat log from my screen
func deleteChatLogFromMyScreen(db *sql.DB, id int, mode string) {
	_, err := db.Exec("UPDATE chatlog SET "+mode+"_delete=$1 WHERE id=$2", true, id)
	if err != nil {
		log.Fatalf("Failed to delete chat log from my screen: %v", err)
	}
}

// restore chat log to my screen
func restoreChatLogToMyScreen(db *sql.DB, id int, mode string) {
	_, err := db.Exec("UPDATE chatlog SET "+mode+"_delete=$1 WHERE id=$2", false, id)
	if err != nil {
		log.Fatalf("Failed to restore chat log to my screen: %v", err)
	}
}
