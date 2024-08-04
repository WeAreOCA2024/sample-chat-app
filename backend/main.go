package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Pass string `json:"pass"`
}

type Chat struct {
	ID          int    `json:"id"`
	From        int    `json:"from_pid"`
	To          int    `json:"to_pid"`
	From_userid int    `json:"from_userid"`
	To_userid   int    `json:"to_userid"`
	Msg         string `json:"msg"`
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

func main() {

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	r.Use(cors.New(config))

	// DB connection~
	dsn := "postgres://myuser:mypassword@db:5432/mydatabase?sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

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

	// get chat log by name
	r.GET("/get/chat/name/:name", func(c *gin.Context) {
		name := c.Param("name")
		chats := getChatLogByName(db, name)
		c.JSON(http.StatusOK, chats)
	})

	port := ":8080"
	r.Run(port)
	select {}

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

func getChatLogByName(db *sql.DB, name string) []Chat {
	rows, err := db.Query("SELECT * FROM chatlog WHERE to_userid IN (SELECT id FROM profile WHERE name=$1) or from_userid IN (SELECT id FROM profile WHERE name=$1)", name)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var chats []Chat
	for rows.Next() {
		var chat Chat
		if err := rows.Scan(&chat.ID, &chat.From, &chat.To, &chat.From_userid, &chat.To_userid, &chat.Msg); err != nil {
			return nil
		}
		chats = append(chats, chat)
	}
	return chats
}
